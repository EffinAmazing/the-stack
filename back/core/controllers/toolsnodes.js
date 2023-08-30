
const ToolsNodesModel = require('../../db/models/ToolsNodes');
const ToolsModels = require('../../db/models/Tools');
const UserModel = require('../../db/models/Users');
const BluePrintModel = require('../../db/models/Blueprints');
const CategoriesModel = require('../../db/models/Categories');
const ToolsServices = require('../../services/sitetechonlogies');
const async = require('async');

class ToolsNodes {
    constructor(){
        this.model = new ToolsNodesModel();
        this.tools = new ToolsModels();
        this.users = new UserModel();
        this.blueprints = new BluePrintModel();
        this.categories = new CategoriesModel();
    }

    update(req, res, next){
        let data = req.body.data;
        let blueprintId = req.body.blueprintId;
        const referer = req.headers.referer;
        let id = req.params.id;
        const blueprints = this.blueprints;
        const user = req.user;
        if( data && id ){
            this.model.updateOne(id, data).then((result)=>{
                let owners = [];
                let trainedOns = [];
                if ( (data.owner || data.trainedOn) && user ) {
                    if (data.owner) {   
                        owners = data.owner.split(",");
                    }
                    if (data.trainedOn) {
                        trainedOns = data.trainedOn.split(",");
                    }
                    let emails = owners.concat(trainedOns);
                    this.users.verifyListBluePrintConnection(emails, blueprintId, user._id)
                        .then((list)=>{
                            console.log(result);
                            async.filter(list, (item, callback) => {
                                callback(null, item.needSendInvite)
                            }, function(err, filtered) {
                                blueprints.sendInviteUserToBluePrint(filtered, referer, blueprintId)
                                .then(result=>{  console.log(result); })
                                .catch(err=> { console.log(err); });
                            });
                        })
                        .catch(err => {
                            console.log(err);
                        })
                }
                //
                res.json({
                    result: result
                })
            }).catch((err)=>{
                res.json({ 
                    result: "Error",
                    message: err.message
                })
            })
        } else {
            res.json({ 
                result: "Error",
                message: "incorrect data"
            })
        }
    }

    hidelist(req, res, next){
        let ids = req.body.ids;
        
        if (ids) {
            this.model.hideList(ids).then((result) => {
                res.json({
                    result: result
                })
            }).catch((err)=>{
                res.json({ 
                    result: "Error",
                    message: err.message
                })
            })
        } else {
            res.status(400).json({ 
                result: "Error",
                message: "incorrect data"
            })
        }
    }

    unhideList(req, res, next ){
        let ids = req.body.ids;

        if (ids) {
            this.model.unhideList(ids).then((result) => {
                res.json({
                    result: result
                })
            }).catch((err)=>{
                res.json({ 
                    result: "Error",
                    message: err.message
                })
            })
        } else {
            res.status(400).json({ 
                result: "Error",
                message: "incorrect data"
            })
        }
    }

    add(req, res, next) {
        let data = req.body.data;

        if (data) {
            this.model.addOne(data).then((result)=>{
                res.json({
                    result: result
                })
            }).catch(err=>{
                res.status(500).json({
                    result: "Error",
                    message: err.message
                })
            })
        } else {
            res.status(400).json({
                result: "Error",
                message: "incorrect data"
            })
        }
    }

    addList(req, res, next) {
        let dataList = req.body.data;

        if (dataList) {
            this.model.addListNodes(dataList).then((result)=>{
                res.json({
                    result: result
                })
            }).catch(err=>{
                res.status(500).json({
                    result: "Error",
                    message: err.message
                })
            })
        } else {
            res.status(400).json({
                result: "Error",
                message: "incorrect data"
            })
        }
    }

    createCustom(req, res, next) {
        const nodeData = req.body.node;
        const toolData = req.body.tool;
        const icon = req.files.icon

        if (nodeData && toolData) {
            // console.log(node, tool, icon);
            async.waterfall([
                (cb) => {
                    this.tools.createOne(toolData, icon).then((res) =>{ cb(null, res) }).catch(err => { cb(err, null) });
                },
                (toolDoc, cb) =>{
                    nodeData['toolId'] = toolDoc.id;
                    this.model.addOne(nodeData).then(theNode => {
                        theNode['tool'] = toolDoc;
                        cb(null, theNode)
                    }).catch(err => { cb(err, null) })
                }
            ], function(err, result) {
                if (err) {
                    res.status(500).json({
                        result: "Error",
                        message: err.message
                    })
                } else {
                    res.json({
                        result: result
                    })
                }
            })
            
        } else {
            res.status(400).json({
                result: "Error",
                message: 'Bad request'
            });
        }
    }

    updateCustom (req, res, next) {
        const nodeData = req.body.node;
        const toolData = req.body.tool;
        const toolId = req.body.toolId;
        const ID = req.params.id
        const icon = req.files.icon;

        if ( ID && nodeData && toolData && toolId ) {
            async.waterfall([
                (cb) => {
                    this.model.updateOne(ID, nodeData).then(doc => { cb(null, doc) }).catch(err => { cb(err, null) });
                },
                (nodeDoc, cb) => {
                    this.tools.updateTool(toolId, toolData).then(toolDoc => {
                        nodeDoc['tool'] = toolDoc;
                        cb(null, nodeDoc);
                    }).catch(err => { console.log(err);  cb(err, null) });
                },
                (nodeDoc, cb) => {
                    if (icon) {
                        this.tools.updateToolIcon(toolId, icon)
                            .then(() => {
                                cb(null, nodeDoc);
                            }).catch(err => { cb(err, null) });
                    } else {
                        cb(null, nodeDoc);
                    }
                }
            ], function(err, result) {
                if (err) {
                    res.status(500).json({
                        result: "Error",
                        message: err.message
                    })
                } else {
                    res.json({
                        result: result
                    })
                }
            })
        } else {
            res.status(400).json({
                result: "Error",
                message: 'Bad request'
            });
        }
    }

    getListOfTools( req, res, next  ){
        const name = req.query.name;
        const blueprintId = req.query.blueprint;
        let limit = req.query.limit;
        let offset = req.query.offset;

        if (name && blueprintId) {
            async.waterfall([
                // 1. find tools with simular name
                (callback)=>{

                    this.tools.getByName(name, limit, offset).then(result=>{                        
                        callback(null, result);
                    }).catch(err=>{
                        callback(err);
                    })
                },
                // 2. check if this tool is already in stack
                (tools, callback) => {
                    this.model.getNodesIdForTools(tools, blueprintId).then(result => {                        
                        callback(null, result);
                    }).catch(err => {
                        callback(err);
                    });
                }
            ], function (err, result) {
                if (err) {
                    res.status(500).json({
                        result: "Error",
                        message: err.message
                    })
                } else {
                    res.json({
                        result: result
                    })
                }
            })

        } else {
            res.status(400).json({
                result: "Error",
                message: "incorrect data"
            });
        }

    }

    getListOfCategories( req, res, next ) {
        const name = req.query.name;
        let limit = req.query.limit;
        let offset = req.query.offset;
        if ( name || name === '' ) {
            this.categories.getList(name, offset, limit)
            .then( r => {
                res.json({
                    result: r
                })
            })
            .catch(err=>{
                res.status(500).json({
                    result: "Error",
                    message: err.message
                });
            });
        } else {
            res.status(400).json({
                result: "Error",
                message: "incorrect data"
            });
        }
    }

    addDomainTool(req, res, next) {
        const domain = req.body.domain;
        const blueprintId = req.body.blueprintId;

        if (domain || blueprintId) {
            async.waterfall([
                (cb)=>{
                    ToolsServices.getDomainTool(domain)
                        .then((result)=>{  
                            cb(null, result);
                        })
                        .catch((err) => {
                            cb(err, null);
                        })
                }, (atool, cb) =>{
                    // console.log(atool);
                    ToolsServices.getToolsOfDomain(domain).then((result) => {
                        const list = result.tech;
                        list.push(atool);
                        cb(null, list);
                    }).catch((err) => {
                        cb(null, [atool]);
                    })
                }, 
                (toolsList, cb) => {
                    this.tools.proceedTools(toolsList).then(pTools => {
                        cb(null, pTools);
                    }).catch(err => {
                        cb(err, null);
                    });
                },
                (toolsList, cb) => {
                    // console.log( toolsList );
                    this.model.filterToolsByNodes(blueprintId, toolsList, domain).then(data=>{
                        cb(null, data);
                    }).catch(err=>{ cb(err, null); });
                }
            ], function(err, fulldata){
                // 5. return data
                if(err) {
                    console.log(err);
                    res.json({
                        result: "Error",
                        message: err.message
                    });
                } else {
                    res.json({
                        result: fulldata,
                    });
    
                }
            });

            /*ToolsServices.getDomainTool(domain)
            .then((result)=>{
                this.tools.proceedTools([result]).then(atool => {
                    let _tool = atool[0];
                    this.model.createNodesForTool(blueprintId, _tool).then(node => {
                        console.log(_tool, node);
                        node.tool = _tool;
                        res.json({
                            result: node
                        })
                    }).catch(err =>{
                        console.log(err);
                        res.status(500).json({
                            result: "Error",
                            message: err.message
                        });

                    })
                }).catch(err => {
                    console.log(err);
                    res.status(500).json({
                        result: "Error",
                        message: err.message
                    }); 
                });
            }).catch(err => {
                console.log(err);
                res.status(500).json({
                    result: "Error",
                    message: err.message
                });
            });*/
        } else {
            res.status(400).json({
                result: "Error",
                message: "incorrect data"
            });
        }
    }   
}

module.exports = ToolsNodes;
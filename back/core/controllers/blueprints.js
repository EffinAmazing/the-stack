const async = require('async');
const BluePrintModel = require('../../db/models/Blueprints');
const ToolsServices = require('../../services/sitetechonlogies');
const ToolsModel = require('../../db/models/Tools');
const ToolsNodesModel = require('../../db/models/ToolsNodes');
const ArrowsModel = require('../../db/models/Arrows');
const BluePrintAccessModel = require('../../db/models/BlueprintAccess');
const UsersModel = require('../../db/models/Users');
const axios = require('axios');

class BluePrints {
    constructor(){
        this._bluePrints = new BluePrintModel();
        this._tools = new ToolsModel();
        this._toolsNodes = new ToolsNodesModel();
        this._arrows = new ArrowsModel();
        this._bluePrintsAccess = new BluePrintAccessModel();
        this._users = new UsersModel();
    }

    getDomainTools(req, res, next) {
        const user = req.user;
        // 
        let domain = req.query.domain || req.body.domain
        async.waterfall([
            (cb)=>{
                // 0. check domain
                axios.get('http://' + domain).then((data) => {
                    cb(null)
                }).catch((err)=>{
                    cb(new Error("Website Is Not Found"));
                })
            },
            (cb) => {
                // 1. get blueprint of domain
                if (user) {
                    this._bluePrints.getByDomain(domain, user._id).then((result) => { cb(null, result); }).catch((err)=>{ cb(err, null); });
                } else {
                    this._bluePrints.getByDomain(domain).then((result) => { cb(null, result); }).catch((err)=>{ cb(err, null);  });
                }
            },
            (blueprint, cb)=>{
                let data = {
                    blueprint: blueprint,
                    nodes: [],
                    tools: []
                }
                this._toolsNodes.getNodesByBlueprint(data.blueprint.id).then((result)=>{
                    data.nodes = result;
                    cb(null, data)
                }).catch((err)=>{ cb(null, data); })
            },
            (data, cb) => {
                if ( data.nodes.length !== 0 ) {
                    async.map(data.nodes, (item, _cb) => { _cb(null, item.toolId) }, (err, docs) => {
                        if(err) {
                            cb(err,null);
                        } else {
                            this._tools.getToolsByIds(docs)
                                .then(result => {
                                    data.tools = result;
                                    cb(null, data);
                                }).catch(err=>cb(err, data))
                        }
                    });
                   
                } else {
                    // 2. get tools of domain
                    ToolsServices.getToolsOfDomain(domain).then((result)=>{
                        const list = result.tech;
                        data.blueprint['spend'] = result.spend;
                        console.log(data.blueprint);
                        this._bluePrints.updateOne(data.blueprint.id, { spend: result.spend }).then((result)=>{  }).catch(err=>console.log(err));
                        /* */
                        ToolsServices.getDomainTool(domain).then((tool) => {
                            list.push(tool);
                            data.tools = list;
                            cb(null, data);
                        }).catch(err=>{
                            data.tools = list;
                            cb(null, data);
                        })
                        
                    }).catch((err)=>{
                        cb(err, null);
                    });

                }
            },
            (data, cb) => {
                console.log('marge tools with tools in DB');
                // 3. marge tools with tools in DB
                if(data.nodes.length === 0){
                    this._tools.proceedTools(data.tools).then((result) => {
                        data.tools = result;
                        cb(null, data);
                    }).catch((err) => {
                        cb(err, null);
                    });
                } else {
                    cb(null, data);
                }
            },
            (data, cb)=>{
                if( !data.nodes.length ) {
                    this._toolsNodes.createNodesForTools(data.blueprint.id, data.tools).then((result)=>{
                        console.log("res");
                        data.nodes = result;
                        cb(null, data);
                    }).catch((err)=>{
                        console.log("err");
                        cb(err, null);
                    })
                } else {
                    cb(null, data)
                }
            }
        ],function(err, fulldata){
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
        })
        
    }

    getBluePrint(req, res, next) {
        const user = req.user;
        let id = req.params.id;
        console.log(user.id, id);
        if (id) {
            async.waterfall([
                (cb) => {
                    this._bluePrints.one(id)
                    .then((blueprint) => {
                        cb(null, blueprint)
                    })
                    .catch((err) => {
                        cb(err, null);
                    });
                },
                (blueprint, cb) => {
                    if (blueprint.userId.toString() == user._id.toString()) {
                        blueprint['access'] = 'owner';
                        cb(null, blueprint);
                    } else {
                        this._bluePrintsAccess.hasUserAccess(user._id, blueprint.id)
                        .then(result=>{
                            if (result) {
                                blueprint['access'] = result;
                                cb(null, blueprint);
                            } else {
                                cb(new Error('NotAllow'), null);
                            }
                        })
                        .catch(err => {
                            cb(new Error('NotAllow'), null);
                        });
                    }
                },
                (blueprint, cb) => {
                    let data = {
                        blueprint: blueprint,
                        nodes: [],
                        tools: []
                    }
                    this._toolsNodes.getNodesByBlueprint(data.blueprint.id).then((result)=>{
                        data.nodes = result;
                        cb(null, data)
                    }).catch((err)=>{
                        cb(err, null);
                    });
                },
                (data, cb) => {
                    async.map(data.nodes, (item, _cb) => { _cb(null, item.toolId) }, (err, docs) => {
                        if(err) {
                            cb(err,null);
                        } else {
                            this._tools.getToolsByIds(docs)
                                .then(result => {
                                    data.tools = result;
                                    cb(null, data);
                                }).catch(err=>cb(err, data))
                        }
                    });
                }
            ], function(err, result) {
                if (err) {
                    console.log(err);
                    res.status(500).json({
                        result: "Error",
                        message: "Server Error"
                    });
                } else {
                    res.json({
                        result: result
                    });
                }
            });
        } else {
            res.status(400).json({
                result: "Error",
                message: "Bad Request"
            });
        }
    }

    createBlueprint(req, res, next) {
        res.json({
            result: "Ok"
        })
    }

    updateBlueprint(req, res, next) {
        res.json({
            result: "Ok"
        })
    }

    getBluePrintsForUser(req, res, next) {
        const userId = req.query.userId;
        if (userId) {
            this._bluePrints.getListByUserID(userId).then((result) => {
                res.json({
                    result: result
                });
            }).catch(() => {
                res.status(500).json({
                    result: "Error",
                    message: "Server Error"
                });
            });
        } else {
            res.status(400).json({
                result: "Error",
                message: "Bad Request"
            })
        }
    }

    inviteUsers(req, res, next) {
        const emails = req.body.emails;
        const pathFront = req.body.url;
        const blueprintId = req.body.blueprintId;
        const user = req.user;

        if (emails && pathFront && user) {
            async.waterfall([
                (cb)=>{
                    this._users.verifyListBluePrintConnection(emails, blueprintId, user._id)
                    .then((result)=>{
                        cb(null, result);
                    })
                    .catch(err => {
                        cb(err, null);
                    })
                },
                (list, cb) =>{
                    async.filter(list, (item, callback) => {
                        callback(null, item.needSendInvite)
                    }, cb);
                },
                (filtered, cb) => {
                    this._bluePrints.sendInviteUserToBluePrint(filtered, pathFront, blueprintId)
                    .then(result=> cb(null, result))
                    .catch(err=> cb(err, null));
                }
            ], (err, result)=>{
                if (err) {
                    console.log(err);
                    res.status(500).json({
                        result: "Error",
                        message: "Server Error"
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
                message: "Bad Request"
            })
        }
    }

    getSharedBluePrints(req, res, next) {
        const user = req.user;
        if (user) {
            async.waterfall([
                (cb) => {
                    this._bluePrintsAccess.getRelatedIds(user._id)
                    .then( result => cb(null, result))
                    .catch(err => cb(err, null));
                },
                (ids, cb) => {
                    this._bluePrints.getListByIDs(ids)
                    .then(list => cb(null, list))
                    .catch(err => cb(err, null));
                }
            ], function(err, result){
                if (err) {
                    console.log(err);
                    res.status(500).json({
                        result: "Error",
                        message: "Server Error"
                    })
                } else{
                    res.json({
                        result: result
                    });
                }
            });
        } else {
            res.status(400).json({
                result: "Error",
                message: "Bad Request"
            });
        }
    }

    signUserToBluePrint(req, res, next) {
        const blueprintId = req.params.id;
        const user = req.user;

        if (blueprintId && user) {
            this._bluePrints.signBluePrintToUser(blueprintId, user._id)
            .then(result => {
                res.json({
                    result: result
                });
            })
            .catch(err => {
                console.log(err);
                res.status(500).json({
                    result: "Error",
                    message: "Server error"
                });
            })
        } else {
            res.status(400).json({
                result: "Error",
                message: "Bad Request"
            });
        }
    }

    removeBluePrint(req, res, next){
        const id = req.params.id;
        if(id) {
            async.waterfall([
                (cb)=>{
                    this._arrows.removeAllByBlueprintId(id).then(()=>{ cb(null);  }).catch((err)=>{ cb(err) })
                },
                (cb)=>{
                    this._toolsNodes.removeAllForBlueprintId(id).then(()=>{  cb(null);   }).catch((err)=>{ cb(err) })
                },
                (cb) => {
                    this._bluePrintsAccess.removeAllByBlueprintId(id).then(()=>{  cb(null);   }).catch((err)=>{ cb(err) })
                },
                (cb) => {
                    this._bluePrints.delete(id, []).then((r)=>{ cb(null, r); }).catch(err => {  cb(err, null) });
                }
            ], function(err, result){
                if(err) {
                    resres.status(500).json({
                        result: "Error",
                        message: err.message
                    })
                } else {
                    res.json({
                        result: "Ok"
                    });
                }
            })
        } else {
            res.json({
                result: "Error",
                message: "Bad Request"
            })
        }
    }

    getInvitededUsers (req, res, next) {
        const id = req.params.id;
        
        if (id) {
            async.waterfall([
                (cb) => {
                    this._bluePrintsAccess.getBluePrintUsersIds(id).then(ids =>{ cb(null, ids) }).catch(err=>{ cb(err, null) });
                },
                (ids, cb) => {
                    this._users.getListByIDs(ids).then(list => { cb(null, list); }).catch(err => { cb(err, null) });
                }
            ], function(err, result) {
                if (err) {
                    res.status(500).json({
                        result: "Error",
                        message: err.message
                    });
                } else {
                    
                    res.json({
                        result: result
                    })
                }
            })

            
        } else {
            res.json({
                result: "Error",
                message: "Bad Request"
            });
        }
    }
}


module.exports = BluePrints;
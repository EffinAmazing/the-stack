const async = require('async');
const BluePrintModel = require('../../db/models/Blueprints');
const ToolsServices = require('../../services/sitetechonlogies');
const ToolsModel = require('../../db/models/Tools');
const ToolsNodesModel = require('../../db/models/ToolsNodes');
const ArrowsModel = require('../../db/models/Arrows');
const axios = require('axios');

class BluePrints {
    constructor(){
        this._bluePrints = new BluePrintModel();
        this._tools = new ToolsModel();
        this._toolsNodes = new ToolsNodesModel();
        this._arrows = new ArrowsModel();
    }

    getDomainTools(req, res, next) {
        console.log(req.query);

        async.waterfall([
            (cb)=>{
                // 0. check domain
                axios.get('http://' + req.query.domain).then((data) => {
                    cb(null)
                }).catch((err)=>{
                    cb(new Error("Website Is Not Found"));
                })
            },
            (cb) => {
                
                // 1. get blueprint of domain
                this._bluePrints.getByDomain(req.query.domain).then((res)=>{
                    console.log(" success ", res);
                    cb(null, res);
                }).catch((err)=>{
                    console.log(" error ", err)
                    cb(err, null);
                });
            },
            (blueprint, cb)=>{
                let data = {
                    blueprint: blueprint,
                    nodes: [],
                    tools: []
                }
                this._toolsNodes.getNodesByBlueprint(data.blueprint.id).then((res)=>{
                    data.nodes = res;
                    cb(null, data)
                }).catch((err)=>{
                    cb(null, data);
                })
            },
            (data, cb) => {
                if ( data.nodes.length !== 0 ) {
                    async.map(data.nodes, (item, _cb) => { _cb(null, item.toolId) }, (err, docs) => {
                        if(err) {
                            cb(err,null);
                        } else {
                            this._tools.getToolsByIds(docs)
                                .then(res=> {
                                    data.tools = res;
                                    cb(null, data);
                                }).catch(err=>cb(err, data))
                        }
                    });
                   
                } else {
                    
                    // 2. get tools of domain
                    ToolsServices.getToolsOfDomain(req.query.domain).then((list)=>{
                        /* */
                        ToolsServices.getDomainTool(req.query.domain).then((tool) => {
                            list.push(tool);
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
                    this._tools.proceedTools(data.tools).then((res) => {
                        data.tools = res;
                        cb(null, data);
                    }).catch((err) => {
                        cb(err, null);
                    });
                } else {
                    cb(null, data);
                }
            },
            (data, cb)=>{
                //console.log("data.nodes", data.nodes);
                if( !data.nodes.length ) {
                    this._toolsNodes.createNodesForTools(data.blueprint.id, data.tools).then((res)=>{
                        console.log("res");
                        data.nodes = res;
                        cb(null, data);
                    }).catch((err)=>{
                        console.log("err");
                        cb(err, null);
                    })
                } else {
                    cb(null, data)
                }
            }
        ],function(err,result){
            // 5. return data
            if(err) {
                console.log(err);
                res.json({
                    result: "Error",
                    message: err.message
                });
            } else {
                res.json({
                    result: result,
                });

            }
        })
        
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

    removeBluePrint(req, res, next){
        const id = req.params.id;
        if(id) {
            async.waterfall([
                (cb)=>{
                    this._arrows.removeAllByBlueprintId(id).then(()=>{
                        cb(null);
                    }).catch((err)=>{ cb(err) })
                },
                (cb)=>{
                    this._toolsNodes.removeAllForBlueprintId(id).then(()=>{
                        cb(null);
                    }).catch((err)=>{ cb(err) })
                },
                (cb) => {
                    this._bluePrints.delete(id, []).then((r)=>{
                        cb(null, r);
                    }).catch(err => cb(err, null));
                }
            ], function(err, result){
                if(err) {
                    res.json({
                        result: "Ok"
                    });
                } else {
                    res.json({
                        result: "Error",
                        message: err.message
                    })
                }
            })
        } else {
            res.json({
                result: "Error",
                message: "Bad Request"
            })
        }
    }
}


module.exports = BluePrints;
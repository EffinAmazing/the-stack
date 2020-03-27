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
                this._bluePrints.getByDomain(req.query.domain).then((result)=>{
                    cb(null, result);
                }).catch((err)=>{
                    cb(err, null);
                });
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
                                .then(result => {
                                    data.tools = result;
                                    cb(null, data);
                                }).catch(err=>cb(err, data))
                        }
                    });
                   
                } else {
                    // 2. get tools of domain
                    ToolsServices.getToolsOfDomain(req.query.domain).then((result)=>{
                        const list = result.tech;
                        data.blueprint['spend'] = result.spend;
                        console.log(data.blueprint);
                        this._bluePrints.updateOne(data.blueprint.id, { spend: result.spend }).then((result)=>{  }).catch(err=>console.log(err));
                        /* */
                        ToolsServices.getDomainTool(req.query.domain).then((tool) => {
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
                    }).catch(err => {
                        cb(err, null)
                    });
                }
            ], function(err, result){
                if(err) {
                    res.json({
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
}


module.exports = BluePrints;
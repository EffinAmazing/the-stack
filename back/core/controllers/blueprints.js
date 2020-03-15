const async = require('async');
const BluePrintModel = require('../../db/models/Blueprints');
const ToolsServices = require('../../services/sitetechonlogies');
const ToolsModel = require('../../db/models/Tools');
const ToolsNodesModel = require('../../db/models/ToolsNodes');

class BluePrints {
    constructor(){
        this._bluePrints = new BluePrintModel();
        this._tools = new ToolsModel();
        this._toolsNodes = new ToolsNodesModel();
    }

    getDomainTools(req, res, next) {
        console.log(req.query);

        async.waterfall([
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
            (blueprint, cb) => {
                
                // 2. get tools of domain
                ToolsServices.getToolsOfDomain(req.query.domain).then((list)=>{
                    cb(null, { blueprint: blueprint, tools: list });
                }).catch((err)=>{
                    cb(err, null);
                });
            },
            (data, cb) => {

                // 3. marge tools with tools in DB
                this._tools.proceedTools(data.tools).then((res) => {
                    data.tools = res;
                    cb(null, data);
                }).catch((err) => {
                    cb(err, null);
                });
            },
            (data, cb) => {
                
                // 4. create bluprint nodes with tools
                this._toolsNodes.getNodesByBlueprint(data.blueprint.id).then((res)=>{
                    data['nodes'] = res;
                    cb(null, data)
                }).catch((err)=>{
                    data['nodes'] = [];
                    cb(null, data);
                })
            },
            (data, cb)=>{
                console.log("data.nodes", data.nodes);
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
}


module.exports = BluePrints;
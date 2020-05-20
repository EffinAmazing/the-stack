
const ToolsNodesModel = require('../../db/models/ToolsNodes');
const ToolsModels = require('../../db/models/Tools');
const UserModel = require('../../db/models/Users');
const BluePrintModel = require('../../db/models/Blueprints');
const async = require('async');

class ToolsNodes {
    constructor(){
        this.model = new ToolsNodesModel();
        this.tools = new ToolsModels();
        this.users = new UserModel();
        this.blueprints = new BluePrintModel();
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
                                blueprints.sendInviteUserToBluePrint(filtered, referer)
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
            })
        }
    }
}

module.exports = ToolsNodes;
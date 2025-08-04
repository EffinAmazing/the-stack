const async = require('async');
const BluePrintModel = require('../../db/models/Blueprints');
const ToolsServices = require('../../services/sitetechonlogies');
const ToolsModel = require('../../db/models/Tools');
const ToolsNodesModel = require('../../db/models/ToolsNodes');
const ArrowsModel = require('../../db/models/Arrows');
const BluePrintAccessModel = require('../../db/models/BlueprintAccess');
const UsersModel = require('../../db/models/Users');
const axios = require('axios');
const http = require('https');
const dns = require('dns');

class BluePrints {
    constructor(){
        this._bluePrints = new BluePrintModel();
        this._tools = new ToolsModel();
        this._toolsNodes = new ToolsNodesModel();
        this._hiddenTools = new ToolsModel();
        this._arrows = new ArrowsModel();
        this._bluePrintsAccess = new BluePrintAccessModel();
        this._users = new UsersModel();
    }

    getDomainTools(req, res, next) {
        const user = req.user;
        console.log(' ************* getDomainTools ************* ');
        // 
        let domain = req.query.domain || req.body.domain;
        async.waterfall([
            (cb)=>{
                // 0. check domain

                const params = {
                    hostname: domain,
                    port: 443,                    
                    method: 'GET',
                    headers: {
                        'User-Agent': 'request'
                    }
                }

                //MANUALLY block or allow domains
                //this can be used to obfuscate a domain
                //let allowedDomains = ["klnMmQ1y72.ouraring.com"];
                
                //JDH
                //reverting this
                //let blockedDomains = ["www.ouraring.com", "ouraring.com"]; 
                let blockedDomains = [];                

                //TODO
                //check domain with dns lookup instead of httpRequest 
                //to avoid servers blocking the request
                dns.lookup(domain, function(err, result){

                //this.httpRequest(params).then(function(body) {
                    console.log(err,result);

                    if (err) {
                        cb(new Error(err.code));

                    } else if (blockedDomains.includes(params.hostname)) {
                        //site is manually blocked                        
                        cb(new Error('Website Not Found: Blocked'));
                    } else {
                        cb(null);
                    }
                    //console.log(body);                    
                })
                
                
                /*
                .catch((err)=>{
                    
                    console.log('err');console.log(err);

                    //lets expose errors clientside so we can 
                    //get better feedback
                    let returnErrMessage = "Website Not Found";                                                          

                    if (err && allowedDomains.includes(params.hostname)) {
                        //manual override
                        cb(null);
                    } else if (err && err.message == "statusCode=403") {
                        cb(null);
                    } else if (err.response) {                        
                        // The request was made and the server responded with a status code
                        // that falls out of the range of 2xx
                        console.log(err.response.data);
                        console.log(err.response.status);
                        console.log(err.response.headers);
                        returnErrMessage += ': '+err.response.status+' '+err.response.statusText;
                        

                      } else if (err.request) {                        
                        // The request was made but no response was received
                        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                        // http.ClientRequest in node.js
                        console.log('Err: The request was made but no response was received');
                        returnErrMessage += ': The request was made but no response was received.';
                      } else if (err.message) {                        
                        // Something happened in setting up the request that triggered an Error
                        console.log('Error', err.message);
                        returnErrMessage += ': '+err.message;
                      } 
                    cb(new Error(returnErrMessage));
                })
                // cb(null);
                */
            },
            (cb) => {
                // 1. get blueprint of domain
                console.log(user);
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
            (data, cb)=>{
                this._hiddenTools.getHiddenTools().then((result)=>{                    
                    data.hiddenTools = result;
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
                    ToolsServices.getToolsOfDomain(domain).then((result) => {
                        console.log('ToolsServices.getToolsOfDomain', result);
                        const list = result.tech;
                        data.blueprint['spend'] = result.spend;
                        data.blueprint['errorCode'] = result.errorCode || null;
                        data.blueprint['errorMessage'] = result.errorMessage || null;
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
                    this._toolsNodes.createNodesForTools( data.blueprint.id, data.tools, data.blueprint.domain ).then((result)=>{
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
                    result: "Error: "+err.message,
                    message: err.message
                });
            } else {
                res.json({
                    result: fulldata,
                });

            }
        })
        
    }

    httpRequest(params, postData) {
        return new Promise(function(resolve, reject) {
            var req = http.request(params, function(res) {
                // reject on bad status
                //console.log(res);
                if (res.statusCode < 200 || res.statusCode > 302) {
                    return reject(new Error('statusCode=' + res.statusCode));
                }
                // cumulate data
                var body = [];
                res.on('data', function(chunk) {
                    body.push(chunk);
                });
                // resolve on end
                res.on('end', function() {
                    /*try {
                        body = JSON.parse(Buffer.concat(body).toString());
                    } catch(e) {
                        reject(e);
                    }*/
                    resolve(body);
                });
            });
            // reject on request error
            req.on('error', function(err) {
                // This is not a "Second reject", just a different sort of failure
                reject(err);
            });
            if (postData) {
                //req.write(postData);
            }
            // IMPORTANT
            req.end();
        });
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
                (data, cb)=>{
                    this._hiddenTools.getHiddenTools().then((result)=>{                        
                        data.hiddenTools = result;
                        cb(null, data)
                    }).catch((err)=>{ cb(null, data); })
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
            /*  */
            async.waterfall([
                (cb) => {
                    this._bluePrints.copyBluePrint(blueprintId, user._id).then(blueprint => { cb(null, blueprint); }).catch(err=>{ cb(err) });
                },
                (blueprint, cb) => {
                    this._toolsNodes.copyNodes(blueprintId, blueprint.id).then((keysTable)=>{ cb(null, blueprint, keysTable); }).catch(err => { cb(err); });
                },
                (blueprint, keysTable, cb) => {
                    this._arrows.copyArrows(blueprintId, blueprint.id, keysTable).then(()=>{ cb(null, blueprint); }).catch(err => { cb(err) });
                }
            ], function(err, result) {
                if (err) {
                    console.log(err);
                    res.status(500).json({
                        result: "Error",
                        message: "Server error"
                    });
                } else {
                    res.json({
                        result: result
                    });
                }
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
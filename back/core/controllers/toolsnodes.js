
const ToolsNodesModel = require('../../db/models/ToolsNodes');

class ToolsNodes {
    constructor(){
        this.model = new ToolsNodesModel();
    }

    update(req, res, next){
        let data = req.body.data;
        let id = req.params.id;
        if( data && id ){
            this.model.updateOne(id, data).then((result)=>{
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
            res.json({ 
                result: "Error",
                message: "incorrect data"
            })
        }
    }
}

module.exports = ToolsNodes;
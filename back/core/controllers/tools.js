const ToolsModels = require('../../db/models/Tools');
const ToolsServices = require('../../services/sitetechonlogies');
const async = require('async');

class Tools {
    constructor(){
        this.model = new ToolsModels();    
    }

    updateVisibility(req, res, next){
        let data = req.body.data;
        let toolId = req.body.node.tool.id;
        let flag = req.body.flag;
      
        const user = req.user;

        console.log('doing update vis on ',toolId,flag);

        if( toolId && flag != null ){
            this.model.updateTool(toolId, {hidden: flag}).then((result)=>{
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

    getTools( req, res, next  ){
        let limit = 10;
        let offset = 0;
        if (req.query.limit) {
            limit = parseInt( req.query.limit );
        }
        if (req.query.offset) {
            offset = parseInt( req.query.offset );
        }
        this.model.getList(offset, limit)
        .then(data => {
            res.json({
                result: data
            })
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                result: 'Error',
                message: 'Server error'
            }); 
        });
    }

    getByName( req, res, next  ){
        let limit = 10;
        let offset = 0;
        if (req.query.limit) {
            limit = parseInt( req.query.limit );
        }
        if (req.query.offset) {
            offset = parseInt( req.query.offset );
        }
        let name = null;
        if (req.query.name) {
            name = req.query.name.trim().toLowerCase();
        } else {
            res.status(400).json({
                result: 'Error',
                message: 'Bad Request'
            }); 
        }
        this.model.getByName(name, offset, limit)
        .then(data => {
            res.json({
                result: data
            })
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                result: 'Error',
                message: 'Server error'
            }); 
        });
    }
  
}

module.exports = Tools;
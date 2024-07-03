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
  
}

module.exports = Tools;
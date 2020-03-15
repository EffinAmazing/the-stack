var mongoose = require('mongoose');
var AbstaractModel = require('./_abstract');
const ObjectId = mongoose.Schema.Types.ObjectId;

class ToolsModel extends AbstaractModel{
    constructor(){
        super('tools');

        this.schema = mongoose.Schema({
            name: String,
            description: String,
            link: String,
            logo: String,
            tag: String,
            categories: [String],
            created: { type: Date, default: Date.now },
            updated: { type: Date, default: Date.now}
        });

        this.initModel();
    }

    async proceedTools(tools){
        let toDo = tools.map(async (item)=>{
            try{
                let dbItem = await this.modelDB.findOne({ name: item.name });
                return this.mapDocument( dbItem );
            } catch(err) {
                let dbItem = await this.create(item);
                return this.mapDocument( dbItem );
            }
        })

        let res = await Promise.all(toDo);
        return res;
    }
}

module.exports = ToolsModel;
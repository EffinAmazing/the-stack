const mongoose = require('mongoose');
const async = require('async');
const techservice = require('../../services/sitetechonlogies');
const AbstaractModel = require('./_abstract');
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
        this.updateInBackground(res);
        return res;
    }

    async updateTool(id, data){
        let doc = await this.updateOne(id, data);

        return this.mapDocument(doc);
    }

    updateInBackground(tools){
        async.eachSeries(tools, (item, cb) => {
            techservice.loadToolLogo(item.name).then(res=>{
                this.updateTool(item.id, { logo: res }).then(res=>console.log(" loaded ")).catch(err=>console.log(" failed "));
            }).catch((err)=>console.log(err));
            
            setTimeout(cb, 500);
        }, function(err){
            console.log(err);
        })
    }

    async getToolsByIds(ids){
        console.log("ids.length", ids)
        let docs = await this.modelDB.find({ _id: { $in: ids } }).exec();

        console.log("docs.length", docs.length);
        let mappedDocs = await async.map(docs, (item, cb)=>{  cb( null, this.mapDocument(item) ); });
        return mappedDocs;
    }

}

module.exports = ToolsModel;
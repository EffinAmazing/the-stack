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
            price: Number,
            owner: String,
            trainedOn: String,
            categories: [String],
            created: { type: Date, default: Date.now },
            updated: { type: Date, default: Date.now}
        });

        this.initModel();
    }

    async proceedTools(tools){
        let needLoadImage = [];
        let toDo = tools.map(async (item)=>{
            try{
                let start = item.start;
                let end = item.end;
                let dbItem = await this.modelDB.findOne({ name: item.name });
                mapped = this.mapDocument( dbItem );
                mapped['start'] = start;
                mapped['end'] = end;
                return mapped;
            } catch(err) {
                let start = item.start;
                let end = item.end;
                delete item.start;
                delete item.end;
                let dbItem = await this.create(item);
                const mapped = this.mapDocument( dbItem );
                mapped['start'] = start;
                mapped['end'] = end;
                needLoadImage.push(mapped)
                return mapped;
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

    async toolLogoUpdate(item, icon) {
        const dirpath = await techservice.saveLogo(item.id, icon);
        const res = await this.updateTool(item.id, { logo: '/tools-logos/' + item.id  + '.png'});
        return res;
    }

    updateInBackground(tools){
        async.eachSeries(tools, (item, cb) => {
            techservice.loadToolLogo(item.name).then(res=>{
                // this.updateTool(item.id, { logo: res }).then(res=>console.log(" loaded ")).catch(err=>console.log(" failed "));
                this.toolLogoUpdate(item, res).then(() => {
                    setTimeout(cb, 300);
                }).catch(err => {
                    console.log(err);                
                    setTimeout(cb, 300);
                })
            }).catch((err)=>{
               console.log(err);                
               setTimeout(cb, 300);
            });
            
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
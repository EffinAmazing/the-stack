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
        let createItem = async (item)=> {
            let start = item.start;
            let end = item.end;
            delete item.start;
            delete item.end;
            let dbItem = await this.create(item);
            const mapped = this.mapDocument( dbItem );
            mapped['start'] = start;
            mapped['end'] = end;
            needLoadImage.push(mapped);

            return mapped;
        }
    
        let toDo = tools.map(async (item)=>{
            try{
                let start = item.start;
                let end = item.end;
                console.log("find", item.name);
                let dbItem = await this.modelDB.findOne({ name: item.name });
                if(!dbItem){
                    const mapped = await createItem(item);
                    return mapped;
                } else {
                    const mapped = this.mapDocument( dbItem );
                    mapped['start'] = start;
                    mapped['end'] = end;
                    return mapped;
                }
            } catch(err) {
                console.log('error -----------', err);
                const mapped = await createItem(item);
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
                this.toolLogoUpdate(item, res).then(() => {
                    setTimeout(cb, 300);
                }).catch(err => {              
                    setTimeout(cb, 300);
                })
            }).catch((err)=>{             
               setTimeout(cb, 300);
            });
            
        }, function(err){
            console.log(err);
        })
    }

    async getToolsByIds(ids){
        let docs = await this.modelDB.find({ _id: { $in: ids } }).exec();

        let mappedDocs = await async.map(docs, (item, cb)=>{  cb( null, this.mapDocument(item) ); });
        return mappedDocs;
    }


    async getByName(name, offset, limit){
        if (!limit) limit = 15;
        if (!offset) offset = 0 
        if (typeof limit !== 'number') {
            limit = parseInt(limit);
            if (!limit) limit = 15;
        }
        if (typeof offset !== 'number') {
            offset = parseInt(offset);
            if (!offset) offset = 0;
        }
        const listDocs = await this.modelDB.find({ name: { $regex: new RegExp(name.toLowerCase(), "i") } }).exec();
        const tools = await async.map(listDocs, (item, cb) => { cb(null, this.mapDocument(item)) });
        return tools;
    }
}

module.exports = ToolsModel;
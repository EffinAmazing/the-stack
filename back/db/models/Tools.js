const mongoose = require('mongoose');
const async = require('async');
// const fs = require('fs');
const techservice = require('../../services/sitetechonlogies');
const files = require('../../services/download');
const AbstaractModel = require('./_abstract');
const CategoriesModel = require('./Categories');
const ObjectId = mongoose.Schema.Types.ObjectId;

class ToolsModel extends AbstaractModel {
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
            hidden: Boolean,
            created: { type: Date, default: Date.now },
            updated: { type: Date, default: Date.now}
        });

        this.initModel();
    }

    async createOne(data, icon) {
        if ( data.name ) {
            data.tag = 'custom';
            if (!data.categories) {
                data.categories = [];
            } else if (typeof data.categories === 'string') {
                data.categories = data.categories.split(',');
            }
            let doc = await super.create(data, []);
            // icon.pipe(fs.createWriteStream('/tools-logos/' + doc._id  + '.png'));
            try {
                let path = await files.uploadImage(icon, 'tools-logos/' + doc._id  + '.png');
                let mappedDoc = await this.updateTool(doc._id, { logo: '/tools-logos/' + doc.id  + '.png' });

                return mappedDoc;
            } catch (err) {
                console.log(err);
                return this.mapDocument(doc);
            }
          
        } else {
            throw Error('Incorrect data');
        }
    }

    async updateToolIcon(toolId, icon) {
        let path = await files.uploadImage(icon, 'tools-logos/' + toolId  + '.png');

        return path;
    }

    async proceedTools(tools){
        let needLoadImage = [];
        let catModel = new CategoriesModel();
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
            if (dbItem.categories && dbItem.length) {
                catModel.proceedList(dbItem.categories)
            }
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
        console.log('updating',id,data);
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

    async getHiddenTools(){
        let docs = await this.modelDB.find({ hidden: true }).exec();
        let mappedDocs = await async.map(docs, (item, cb)=>{  cb( null, this.mapDocument(item) ); });
        return mappedDocs;
    }

    async getList(offset, limit) {
        let total = await this.modelDB.countDocuments({}).exec();
        let list = await this.modelDB.find({}).limit(limit).skip(offset).sort({ name: 1 }).exec();

        let mapped = await async.map(list, (item, cb) => { cb(null, this.mapDocument(item)); });
        return {
            list: mapped,
            total: total,
            offset: offset,
            limit: limit
        }
    }


    async getByName(name, offset, limit){
        if (!limit) limit = 10;
        if (!offset) offset = 0 
        if (typeof limit !== 'number') {
            limit = parseInt(limit);
            if (!limit) limit = 10;
        }
        if (typeof offset !== 'number') {
            offset = parseInt(offset);
            if (!offset) offset = 0;
        }
        let total = await this.modelDB.find().where('name').regex( new RegExp(name.toLowerCase(), "i") ).exec();
        const listDocs = await this.modelDB.find().where('name').regex( new RegExp(name.toLowerCase(), "i") ).limit(limit).skip(offset).sort({ name: 1 }).exec();        
        const tools = await async.map(listDocs, (item, cb) => { cb(null, this.mapDocument(item)) });
        return {
            list: tools,
            total: total.length,
            offset: offset,
            limit: limit
        }
    }


    async getToolsListByName(name, offset, limit){
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
        const listDocs = await this.modelDB.find().where('name').regex( new RegExp(name.toLowerCase(), "i") ).exec();        
        const tools = await async.map(listDocs, (item, cb) => { cb(null, this.mapDocument(item)) });
        return tools;
    }
    
}

module.exports = ToolsModel;
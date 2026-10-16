const mongoose = require('mongoose');
const async = require('async');
// const fs = require('fs');
const techservice = require('../../services/sitetechonlogies');
const files = require('../../services/download');
const AbstaractModel = require('./_abstract');
const CategoriesModel = require('./Categories');
const TagsModel = require('./Tags');
const { NO_CATEGORY, APP_TAGS, escapeRegex } = require('../../services/visibility-rules');

// categories: null matches a missing field and a stored null (BuiltWith items without Categories).
const NO_CATEGORY_FILTER = { $or: [{ categories: null }, { categories: { $size: 0 } }] };
// Domain nodes and custom apps are outside visibility rules: never listed, counted or updated here.
const NOT_APP_TOOL = { tag: { $nin: APP_TAGS } };
// tools.hidden is the admin setting: true = Hide, false = Show, unset = Default.
const VISIBILITY_UPDATES = {
    show: { $set: { hidden: false } },
    hide: { $set: { hidden: true } },
    default: { $unset: { hidden: 1 } }
};

function toInt(value, fallback, min) {
    const n = parseInt(value, 10);
    return isNaN(n) || n < min ? fallback : n;
}
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
            hidden: Boolean, // admin setting: true = Hide, false = Show, unset = Default (category/tag rules decide)
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
                    await this.modelDB.updateOne({ _id: dbItem._id }, { $set: { tag: item.tag, categories: item.categories } });
                    const mapped = this.mapDocument( dbItem );
                    mapped['start'] = start;
                    mapped['end'] = end;
                    mapped['tag'] = item.tag;
                    mapped['categories'] = item.categories;
                    return mapped;
                }
            } catch(err) {
                console.log('error -----------', err);
                const mapped = await createItem(item);
                return mapped;
            }
        })

        let res = await Promise.all(toDo);
        this.registerSeenNames(res);
        this.updateInBackground(res);
        return res;
    }

    // Non-blocking: newly seen categories/tags arrive as Normal for admin review.
    registerSeenNames(tools) {
        const categories = [];
        const tags = [];
        tools.forEach((tool) => {
            if (!tool) return;
            if (Array.isArray(tool.categories)) categories.push(...tool.categories);
            if (tool.tag) tags.push(tool.tag);
        });
        Promise.all([new CategoriesModel().registerSeen(categories), new TagsModel().registerSeen(tags)])
            .catch(err => console.error('[proceedTools] failed to register categories/tags', err));
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

    async getHiddenTools(){
        let docs = await this.modelDB.find({ hidden: true }).exec();
        let mappedDocs = await async.map(docs, (item, cb)=>{  cb( null, this.mapDocument(item) ); });
        return mappedDocs;
    }

    buildToolsFilter({ name, category, tag, setting } = {}) {
        const and = [NOT_APP_TOOL];
        if (name) and.push({ name: new RegExp(escapeRegex(name), 'i') });
        if (category === NO_CATEGORY) and.push(NO_CATEGORY_FILTER);
        else if (category) and.push({ categories: category });
        if (tag) and.push({ tag });
        if (setting === 'show') and.push({ hidden: false });
        else if (setting === 'hide') and.push({ hidden: true });
        else if (setting === 'default') and.push({ hidden: null }); // matches unset and null
        return { $and: and };
    }

    async queryTools(params = {}) {
        const offset = toInt(params.offset, 0, 0);
        const limit = toInt(params.limit, 10, 1);
        const filter = this.buildToolsFilter(params);

        const total = await this.modelDB.countDocuments(filter).exec();
        const list = await this.modelDB.find(filter).sort({ name: 1 }).skip(offset).limit(limit).exec();
        return {
            list: list.map(item => this.mapDocument(item)),
            total,
            offset,
            limit
        };
    }

    async getList(offset, limit) {
        return this.queryTools({ offset, limit });
    }

    async getByName(name, offset, limit){
        return this.queryTools({ name, offset, limit });
    }

    async bulkSetVisibility(ids, state) {
        const update = VISIBILITY_UPDATES[state];
        if (!update) throw new Error('Invalid state');

        const withTimestamp = Object.assign({}, update, { $set: Object.assign({}, update.$set, { updated: new Date() }) });
        const filter = { $and: [{ _id: { $in: ids } }, NOT_APP_TOOL] };
        const res = await this.modelDB.updateMany(filter, withTimestamp).exec();
        const tools = (await this.modelDB.find(filter).exec()).map(item => this.mapDocument(item));
        return { matched: res.n, modified: res.nModified, tools };
    }

    async getCategoryCounts() {
        const rows = await this.modelDB.aggregate([
            { $match: NOT_APP_TOOL },
            { $sort: { name: 1 } },
            { $unwind: '$categories' },
            { $group: { _id: '$categories', tools: { $sum: 1 }, examples: { $push: '$name' } } },
            { $project: { _id: 0, name: '$_id', tools: 1, examples: { $slice: ['$examples', 3] } } }
        ]).allowDiskUse(true).exec();

        const noCategoryFilter = this.buildToolsFilter({ category: NO_CATEGORY });
        const noCategoryTotal = await this.modelDB.countDocuments(noCategoryFilter).exec();
        const noCategoryExamples = await this.modelDB.find(noCategoryFilter, { name: 1 }).sort({ name: 1 }).limit(3).lean().exec();

        return {
            rows: rows.filter(row => row.name !== NO_CATEGORY),
            noCategory: { tools: noCategoryTotal, examples: noCategoryExamples.map(t => t.name) }
        };
    }

    async getTagCounts() {
        return this.modelDB.aggregate([
            { $match: { tag: { $nin: APP_TAGS.concat(['', null]) } } },
            { $sort: { name: 1 } },
            { $group: { _id: '$tag', tools: { $sum: 1 }, examples: { $push: '$name' } } },
            { $project: { _id: 0, name: '$_id', tools: 1, examples: { $slice: ['$examples', 3] } } }
        ]).allowDiskUse(true).exec();
    }

    // For the block confirm dialog: how many tools match, and how many stay visible
    // because they're also in a whitelisted category.
    async getBlockImpact(match, whitelisted) {
        const filter = this.buildToolsFilter(match.category ? { category: match.category } : { tag: match.tag });
        const results = await Promise.all([
            this.modelDB.countDocuments(filter).exec(),
            whitelisted.length
                ? this.modelDB.countDocuments({ $and: [filter, { categories: { $in: whitelisted } }] }).exec()
                : Promise.resolve(0)
        ]);
        return { tools: results[0], alsoWhitelisted: results[1] };
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
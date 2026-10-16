const mongoose = require('mongoose');
const NamedRulesModel = require('./_named-rules');
const async = require('async');


class CategoriesModel extends NamedRulesModel {
    constructor(){
        super('Categories', ['whitelisted', 'blocked']);

        this.schema = mongoose.Schema({
            name: String,
            toolsCount: Number, // stale snapshot from reload-tools-categories.js; not used for rules
            status: String,     // 'whitelisted' | 'blocked'; absent = Normal
            firstSeen: Date     // set only on categories registered by proceedTools
        });

        
        this.initModel();
    }

    async findByName(name) {
        let category = await this.modelDB.findOne({ name: name });
        // let mapped = async.map(categoties, (item, cb) => {  cb(null, this.mapDocument(item)) });
        return category;
    }

    async proceedList(list) {
        const self = this;
        let rows = await async.map(list, (item, cb) => { 
            this.findByName(item).then((cat)=>{
                if (cat) {
                    /*this.modelDB.updateOne({ _id: cat.id }, { toolsCount: cat.toolsCount + 1 }, function(err, ok){

                    });*/
                    this.updateOne(cat._id, { toolsCount: cat.toolsCount + 1 }).then(res => {
                            cb(null, self.mapDocument(res));
                    }).catch(err => {
                            cb(err, null);
                    })
                } else {
                    this.modelDB.create({ name: item, toolsCount: 1 }, function(err, doc) {
                        if ( err ) {
                            cb(err, null);
                        } else {
                            cb(null, self.mapDocument(doc));
                        }
                    })
                }
            }).catch((err)=>{
                this.modelDB.create({ name: item, toolsCount: 1 }, function(err, doc) {
                    if ( err ) {
                        cb(err, null);
                    } else {
                        cb(null, self.mapDocument(doc));
                    }
                })
            })

                
        });

        return rows;
    }

    async getList(filter, offset, limit) {
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

        const listDocs = await this.modelDB.find().where('name').regex( new RegExp(filter.toLowerCase(), "i") ).exec();
        const cats = await async.map(listDocs, (item, cb) => { cb(null, this.mapDocument(item)) });
        return cats;
    }

    async getRules() {
        const results = await Promise.all([this.namesWithStatus('whitelisted'), this.namesWithStatus('blocked')]);
        return { whitelisted: results[0], blocked: results[1] };
    }
}

module.exports = CategoriesModel;
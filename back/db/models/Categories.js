const mongoose = require('mongoose');
const AbstaractModel = require('./_abstract');
const async = require('async');


class CategoriesModel extends AbstaractModel {
    constructor(){
        super('Categories');

        this.schema = mongoose.Schema({
            name: String,
            toolsCount: Number
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
}

module.exports = CategoriesModel;
var mongoose = require('mongoose');
var async = require('async');

const ObjectId = mongoose.Schema.Types.ObjectId;

class AbstaractModel {
    constructor(name){
        this.name = name;
    }

    initModel(){ // 
        if(!this.modelDB){
            try{
                this.modelDB = mongoose.model(this.name);
            }catch(err){
                this.modelDB = mongoose.model(this.name, this.schema);
            }
        }
    }    

    mapDocument(doc){
        let mapDoc = {};
        
        for (const key of Object.keys(doc._doc)) {
          if (key === '_id' || key === '__v') {
            if(key === '_id') mapDoc['id'] = doc['_id'];
          } else {
            mapDoc[key] = doc[key];
          }
          
        }

        return mapDoc;
    }

    async clearModel(name) {
        if(this.modelDB) {
            if(name === this.name) {
                var result = await this.modelDB.deleteMany({}).exec();
                return result;
            } else {
                throw new Error("IncorrectModelNameForClearing");
            }
        } else {
            throw new Error("ModelIsNotInit");
        }
    }

    async prepareCallbacks(callbacks, after) {
        if (after && after.length) {
            for await (let item of  after) {
                if(typeof item === 'function') callbacks.push(item);
            }
        }

        return callbacks;
    }

    async getOne(id, after) {
        var callbacks = [
            (cb)=>{
                this.modelDB.findById(id, cb)
            }
        ];
        callbacks = await this.prepareCallbacks(callbacks, after);
        
        let result = await async.waterfall(callbacks);
        return result;
    }

    async create(data, after) {
        var callbacks = [(cb)=>{
            this.modelDB.create(data, cb);
        }];
        callbacks = await this.prepareCallbacks(callbacks, after);
        
        let result = await async.waterfall(callbacks);
        return result;
    }

    async getList(params, after) {
        var callbacks = [
            (cb)=>{
                this.modelDB.find(params, cb)
            }
        ];
        callbacks = await this.prepareCallbacks(callbacks, after);

        let result = await async.waterfall(callbacks);
        return result;
    }

    async updateOne(id, data, after){
        var callbacks = [
            (cb)=>{
                this.modelDB.updateOne({_id: id}, data, cb);
            },
            (data, cb) => {
                this.modelDB.findById(id, {}, cb);
            }
        ];
        callbacks = await this.prepareCallbacks(callbacks, after);

        let result = await async.waterfall(callbacks);
        return result;
    }

    async delete(id, before, after) {
        var callbacks = [
            (cb)=>{
                this.modelDB.findByIdAndDelete(id, cb);
            }
        ];
        callbacks = await this.prepareCallbacks(callbacks, after);

        let result = await async.waterfall(callbacks);
        return result;
    }
}

module.exports = AbstaractModel;
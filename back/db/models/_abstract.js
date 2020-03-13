var mongoose = require('mongoose');

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
        
        let result = await async.series(callbacks);
        return result;
    }

    async create(data, after) {
        var callbacks = [(cb)=>{
            this.modelDB.create(data, cb);
        }];
        callbacks = await this.prepareCallbacks(callbacks, after);
        
        let result = await async.series(callbacks);
        return result;
    }

    async getList(params, after) {
        var callbacks = [
            (cb)=>{
                this.modelDB.find(params, cb)
            }
        ];
        callbacks = await this.prepareCallbacks(callbacks, after);

        let result = await async.series(callbacks);
        return result;
    }

    async delete(id, before, after) {
        var callbacks = [
            (cb)=>{
                this.modelDB.findByIdAndDelete(id, cb);
            }
        ];
        callbacks = await this.prepareCallbacks(callbacks, after);

        let result = await async.series(callbacks);
        return result;
    }
}

module.exports = AbstaractModel;
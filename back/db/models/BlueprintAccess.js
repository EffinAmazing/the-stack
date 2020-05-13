const mongoose = require('mongoose');
const async = require('async');
const AbstaractModel = require('./_abstract');
const ObjectId = mongoose.Schema.Types.ObjectId;

class BluePrintAccessModel extends AbstaractModel{
    constructor(){
        super('blueprint_access');
        this.schema = mongoose.Schema({
            blueprintId: ObjectId,
            providerUser: ObjectId,
            receiverUser: ObjectId,
            level: { type: String, enum: [ 'Full', 'View', 'StackEdit', 'ToolsEdit' ] },
            created: { type: Date, default: Date.now },
        });

        this.initModel();
    }

    async getRelatedIds(userId){
        let result = await this.modelDB.find({ receiverUser: userId });
        const ids = await async.map(result, (item, cb)=> {  cb(null, item.blueprintId) } );
        return ids;
    }

    async hasUserAccess(userId, blueprintId) {
        let result = await this.modelDB.findOne({ receiverUser: userId, blueprintId: blueprintId });
        if (result) {
            return result.level;
        } else {
            return false;
        }
    }
}

module.exports = BluePrintAccessModel;
var mongoose = require('mongoose');
var AbstaractModel = require('./_abstract');
const ObjectId = mongoose.Schema.Types.ObjectId;

class BluePrintModel extends AbstaractModel{
    constructor(){
        super('blueprints');
        this.schema = mongoose.Schema({
            userId: ObjectId,
            domain: String,
            uniqCode: String,
            created: { type: Date, default: Date.now },
            updated: { type: Date, default: Date.now}
        })

        this.initModel();
    }
}

module.exports = BluePrintModel;

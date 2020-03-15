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

    async getByDomain(domain){
        try {
          let blueprint = await this.modelDB.findOne({ domain: domain }).exec();
          console.log(blueprint);
          return this.mapDocument( blueprint );
        } catch (err) {
            let blueprint = await this.create({
                domain: domain,
                uniqCode: ""
            }); 
            return this.mapDocument( blueprint );
        }
    }
}

module.exports = BluePrintModel;

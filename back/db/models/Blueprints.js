const mongoose = require('mongoose');
const AbstaractModel = require('./_abstract');
const async = require('async');
const emailService = require('../../services/email');
const ObjectId = mongoose.Schema.Types.ObjectId;

class BluePrintModel extends AbstaractModel{
    constructor(){
        super('blueprints');
        this.schema = mongoose.Schema({
            userId: ObjectId,
            domain: String,
            uniqCode: String,
            spend: Number,
            created: { type: Date, default: Date.now },
            updated: { type: Date, default: Date.now}
        })

        this.initModel();
    }

    async getByDomain(domain, userId = null){
        try {
          let params = { domain: domain, userId: { $exists: false } };
          if (userId) {
            params['userId'] = userId
          }

          let blueprint = await this.modelDB.findOne(params).exec();
          // console.log(blueprint);
          return this.mapDocument( blueprint );
        } catch (err) {
            let data = {
                domain: domain,
                uniqCode: ""
            }
            if (userId) {
                data['userId'] = userId
            }
            let blueprint = await this.create(data); 
            return this.mapDocument( blueprint );
        }
    }

    async signBluePrintToUser(blueprintId, userId){
        let res = await this.modelDB.updateOne({ _id: blueprintId }, { userId: userId }).exec();

        let doc = await this.modelDB.findById(blueprintId).exec();
        return this.mapDocument(doc);
    }

    async one(id){
        let blueprint = await this.modelDB.findOne({ _id: id }).exec();
        return this.mapDocument( blueprint );
    }

    async getListByUserID( userId ) {
        let blueprints = await this.modelDB.find({ userId: userId }).exec();

        let mapped = await async.map(blueprints, (item, cb) => {  cb(null, this.mapDocument(item)) });
        return mapped;
    }

    async getListByIDs(ids){
        let list = await this.modelDB.find({ _id: { $in: ids } }).exec();

        let mapped = await async.map(list, (item, cb) => {  cb(null, this.mapDocument(item)) });
        return mapped;
    }

    async sendInviteUserToBluePrint( list, path ) {
        await async.each(list, (item, cb)=>{
            emailService.sendInviteForUser(item.email, item.user, path)
            .then(res => {
                
                cb(null);
            })
            .catch(err => {
                console.log(err);
                cb(null);
            });
        })

        return true;
    }
}

module.exports = BluePrintModel;

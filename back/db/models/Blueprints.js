const mongoose = require('mongoose');
const AbstaractModel = require('./_abstract');
const async = require('async');
const emailService = require('../../services/email');
const AccessModel = require('./BlueprintAccess');
const ObjectId = mongoose.Schema.Types.ObjectId;

class BluePrintModel extends AbstaractModel {
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

    async copyBluePrint(blueprintId, userId) {
        const blueprint = await this.getOne(blueprintId);

        let data = {
            domain: blueprint.domain,
            uniqCode: ""
        }

        if (userId) {
            data['userId'] = userId;
        }

        let newDoc = await this.create(data);
        return this.mapDocument(newDoc);
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

    async sendInviteUserToBluePrint( list, path, blueprintId) {
        const blueprint = await this.one(blueprintId);
        await async.each(list, (item, cb)=>{
            emailService.sendInviteForUser(item.email, item.user, path, blueprint)
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

    async getBluePrintConnectedToUsers(providerId, receiverId){
        let access = new AccessModel();

        let list = await this.modelDB.find({ userId: providerId }).exec();

        let proceedList = await async.map(list, (item, cb) => { 
            let mapped = this.mapDocument(item)
            access.hasUserAccess(receiverId, mapped.id).then(result => {
                if (result) {
                    mapped['connected'] = true;
                } else {
                    mapped['connected'] = false;
                }

                cb(null, mapped);
            }).catch(err =>{  console.log(err); cb(err) });

        });

        return proceedList;
    }
}

module.exports = BluePrintModel;

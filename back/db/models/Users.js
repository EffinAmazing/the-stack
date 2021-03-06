const mongoose = require('mongoose');
const AbstaractModel = require('./_abstract');
const bcrypt = require('bcrypt');
const uniqid = require('uniqid');
const BluePrintAccess = require('./BlueprintAccess');
const emailService = require('../../services/email');
const { UserModelError } = require('../../services/custom-errors');
const ObjectId = mongoose.Schema.Types.ObjectId;
const async = require('async');


const SALT_FACTOR = 12;

class UserModel extends AbstaractModel{
    constructor(){
        super('users');

        this.schema = mongoose.Schema({
            username: String,
            password: String,
            firstName: String,
            lastName: String,
            email: { type: String , unique: true, required: true },
            avatar: String,
            role: { type: Number, default: 1 }, // 0 - Administrator
            verified: { type: Boolean, default: true},
            validationCode: String,
            created: { type: Date, default: Date.now },
            updated: { type: Date, default: Date.now }
        });

        this.schema.pre(['save', 'updateOne', 'update'], function (next) { // handling adding and updating data to db
            let user = this;
            if (this._update) {
                user = this._update;
            }
            // console.log(' ****************** this.schema ******************* ', user, this._update, user.password);
            // if (!user.isModified('password')) { next(); } // check if it senda filed password to saving
      
            // this.updated = Date.now();
            if(!user.password) next();
            if (this.isModified && !user.isModified('password')) {
                next(); 
            } else {          
                if(user.password.indexOf("$" + SALT_FACTOR + "$") > 0){
                    next();
                }
            }

            bcrypt.genSalt(SALT_FACTOR, function (err, salt) {  // ganarate hash for password and save hash in db instead of password
                if (err) {
                return next(err);
                }

                bcrypt.hash(user.password, salt, function (err, hash) {
                if (err) {
                    return next(err);
                }
                user.password = hash;
                next();
                });
            });
        });
      
        this.schema.methods.comparePassword = function (candidatePassword, next) { // add to user model function comparing passwords
            let promise = new Promise((resolve, reject) => {
                bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
                    console.log( 'isMatch', isMatch );
                    if (err)  {
                        reject(err);
                    } else {
                        console.log('resolve');
                        resolve(isMatch)
                    }
                })
            });
            if (next) {
                promise.then(result=>next(null, result)).catch(err=>next(err));
            } else {
                return promise;
            }
        };

        this.initModel();
    }

    async checkCredantial(username, password){
        let user = await this.modelDB.findOne({$or:[{email: username}, { username: username}]});
        console.log(user);
        if (user) {
            let isMatch = await user.comparePassword(password);
            console.log('checkCredantial -> isMatch', isMatch);
            if (isMatch) {
                return user;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }

    async create(data){
        data.validationCode = uniqid.time().substr(-4);
        let user = await this.modelDB.findOne({$or:[{email: data.email}, { username: data.email}]}).where();
        if (!user) {
            data['username'] = data['email'];
            user = super.create(data, []);
            return user;
        } else {
            throw new UserModelError(" User with this email is already registerred ", { data, type: 'EmailDuplication' });
        }
    }

    async getByCode(code) {
        let user = await this.modelDB.findOne({ verified: false,  validationCode: code });
        return user;
    }

    async complete(id, code, data) {
       data['verified'] = true;
       let ok = await this.modelDB.updateOne({ _id: id, verified: false,  validationCode: code }, data).exec();
       return ok;
    }

    async sendResetPass(email, frontUrl) {
        let user = await this.modelDB.findOne({$or:[{email: email}, { username: email}]}).exec();
        if (user) {
            let validationCode = uniqid.time().substr(-4);
            await this.modelDB.updateOne({ _id: user._id }, { validationCode }).exec();
            await emailService.sendResetPassword(email, user, frontUrl, validationCode);
            return true;
        } else {
            throw new UserModelError('User with this email is not found!', { type: 'UserNotFound' });
        }
    }

    async resetPassword(code, password) {
        let user = await this.modelDB.findOne({ verified: true,  validationCode: code });
        if (user) {
            await this.modelDB.updateOne({ _id: user._id }, { password: password, validationCode: '' }).exec();
            return true;
        } else {
            throw new UserModelError('User with this email is not found!', { type: 'UserNotFound' });
        }
    }

    async verifyListBluePrintConnection( emails, blueprintId, providerId ) {
        const access = new BluePrintAccess();
        let result = await async.map(emails, (email, cb) => {
            this.verifyOneUser(email,  blueprintId, providerId, access).then((data)=>{
                cb(null, data);
            }).catch(err => {
                cb(err, null);
            })
        });

        return result;
    }

    async verifyOneUser(email, blueprintId, providerId, access){
        const user = await this.modelDB.findOne({ email: email });
        
        if (user) { 
            const res = await access.hasUserAccess(user._id, blueprintId);
            if (!res) {
                await access.create({ blueprintId: blueprintId,
                    providerUser: providerId,
                    receiverUser: user._id,
                    level: 'Full' });
                return { email: email, user: user, needSendInvite: true, status: 'success' };
            } else return { email: email, user: user, needSendInvite: false, status: 'success' };
        } else {
            try{
                let userDoc = new this.modelDB({
                    email: email,
                    username: email,
                    role: 1,
                    verified: false,
                    validationCode: uniqid.time()
                });
                let user = await userDoc.save();
                
                await access.create({ blueprintId: blueprintId,
                    providerUser: providerId,
                    receiverUser: user._id,
                    level: 'Full' });
                return { email: email, user: user, needSendInvite: true, status: 'success' };
            } catch (err) {
                console.log(err);
                return { email: email, user: null, needSendInvite: false, status: 'fail' };
            }
        }
    }

    async getList(limit, offset) {
        let total = await this.modelDB.countDocuments({}).exec();
        let list = await this.modelDB.find({}).limit(limit).skip(offset).exec();

        let mapped = await async.map(list, (item, cb) => { cb(null, this.mapDocument(item)); });
        return {
            list: mapped,
            total: total,
            offset: offset,
            limit: limit
        }
    }

    async updateOne(id, data) {
        await this.modelDB.update({ _id: id }, data).exec();
        let doc = await this.modelDB.findOne({ _id: id }).exec();

        return this.mapDocument( doc );
    }

    async getListByIDs(ids){
        let list = await this.modelDB.find({ _id: { $in: ids } }).exec();

        let mapped = await async.map(list, (item, cb) => {  cb(null, this.mapDocument(item)) });
        return mapped;
    }

    async reSendInvite(id, url) {
        let user = await this.modelDB.findById({ _id: id }).exec();
        await emailService.sendInviteForUser(user.email, user, url);

        return true;
    }
}

module.exports = UserModel;

var mongoose = require('mongoose');
var AbstaractModel = require('./_abstract');
var bcrypt = require('bcrypt');
var uniqid = require('uniqid');
const ObjectId = mongoose.Schema.Types.ObjectId;

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
            password: { type: String , required: true },
            avatar: String,
            role: { type: Number, default: 1 }, // 0 - Administrator
            verified: { type: Boolean, default: true},
            validationCode: String,
            created: { type: Date, default: Date.now },
            updated: { type: Date, default: Date.now }
        });

        this.schema.pre(['save', 'updateOne', 'update'], function (next) { // handling adding and updating data to db
            const user = this;
      
            if (!user.isModified('password')) { next(); } // check if it senda filed password to saving
      
            this.updated = Date.now();
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
            return user;
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
            throw new Error(" User with this email is already registerred ");
        }
    }
}

module.exports = UserModel;

const UserModel = require('../../db/models/Users');
const passport = require('passport');
const jwt = require('jsonwebtoken');

const JWT_SECRET_KEY = process.env.AUTH_SECRET_KEY || "stack-builder";

class Users {
    constructor(){
        this.model = new UserModel();
    }

    signin(req, res, next) {
        passport.authenticate('local', {session: false}, (err, user, info) => {
            console.log('err, user, info', err, user, info);
            if (err || !user) {
                res.json({
                    result: 'Error',
                    message: err ? err.message : 'User is not found'
                })
            } else {
                req.login(user, {session: false}, (err) => {
                    if (err) {
                        return res.json({
                            result: 'Error',
                            message: err ? err.message : 'User is not found'
                        })
                    }

                    const token = jwt.sign(user.toJSON(), JWT_SECRET_KEY);
                    delete user.password;
                    res.json({
                        result: {
                            user: user,
                            token: token
                        }
                    })
                });
            }

        })(req, res, next);
    }

    signup(req, res, next) {
        let data = req.body.data;

        if (data) {
            this.model.create(data).then((user)=>{
                res.json({
                    result: user
                })
            }).catch(err=>{
                console.log(err);
                res.status(500).json({
                    result: 'Error',
                    message: 'Someting went wrong'
                })
            });
        } else {
            res.status(200).json({
                result: 'Error',
                message: 'Bad request'
            })
        }
    }

}

module.exports = Users;
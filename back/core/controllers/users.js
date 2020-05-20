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
            res.status(400).json({
                result: 'Error',
                message: 'Bad request'
            })
        }
    }

    getUserByCode(req, res, next) {
        let code = req.query.code;

        if ( code ) {
            this.model.getByCode(code)
            .then((result) => {
                res.json({
                    result: result
                });
            })
            .catch(err => {
                console.log(err);
                res.status(500).json({
                    result: 'Error',
                    message: 'Someting went wrong'
                })
            })
        } else {
            res.status(400).json({
                result: 'Error',
                message: 'Bad request'
            }); 
        }
    }

    completeRegistration(req, res, next) {
        let data = req.body.data;
        let code = req.body.code;
        let id = req.params.id

        if (data) {
            this.model.complete(id, code, data)
            .then(result => {
                res.json({
                    result: result
                })
            })
            .catch(err => {
                console.log(err);
                res.status(500).json({
                    result: 'Error',
                    message: 'Server error'
                }); 
            });
        } else {
            res.status(400).json({
                result: 'Error',
                message: 'Bad request'
            }); 
        }
    }

    getList(req, res, next) {
        let limit = 10;
        let offset = 0;
        if (req.query.limit) {
            limit = parseInt( req.query.limit );
        }
        if (req.query.offset) {
            offset = parseInt( req.query.offset );
        }

        this.model.getList(limit, offset)
        .then(data => {
            res.json({
                result: data
            })
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                result: 'Error',
                message: 'Server error'
            }); 
        });
    }

    update(req, res, next) {
        let id = req.params.id;
        let data = req.body.data;
        const user = req.user;

        if (user) {
            this.model.updateOne(id, data)
            .then(doc => {
                res.json({
                    result: doc
                })
            })
            .catch(err => {
                console.log(err);
                res.status(500).json({
                    result: 'Error',
                    message: 'Server error'
                }); 
            });
        } else {
            res.status(401).json({
                result: 'Error',
                message: 'You need to be registered'
            }); 
        }
    }

    delete(req, res, next) {
        let id = req.params.id;
        const user = req.user;

        if (user) { 
            if (user.role !== 0) {
                return res.status(403).json({
                    result: 'Error',
                    message: 'Forbidden'
                });
            }

            this.model.delete(id, [], [])
            .then(done => {
                res.json({
                    result: "Ok"
                })
            })
            .catch(err =>{
                console.log(err);
                res.status(500).json({
                    result: 'Error',
                    message: 'Server error'
                })
            })
        } else {
            res.status(401).json({
                result: 'Error',
                message: 'You need to be registered'
            });   
        }

    }

    resendInvite(req, res, next) {
        const id = req.params.id;
        const url = req.body.path;

        if (id) {
            this.model.reSendInvite(id, url).then(data => {
                res.json({
                    result: data
                })
            })
            .catch(err => {
                console.log(err);
                res.status(500).json({
                    result: 'Error',
                    message: 'Server error'
                })
            })
        } else {
            res.status(400).json({
                result: "Error",
                message: 'bad request'
            })
        }
    }

}

module.exports = Users;
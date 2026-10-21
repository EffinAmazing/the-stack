const UserModel = require('../../db/models/Users');
const BluePrintModel = require('../../db/models/Blueprints');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const { sanitizeUserUpdate, sanitizeSignupData } = require('../../services/user-update');

const JWT_SECRET_KEY = process.env.AUTH_SECRET_KEY || "stack-builder";

class Users {
    constructor(){
        this.model = new UserModel();
        this.blueprints = new BluePrintModel();
    }

    signin(req, res, next) {
        passport.authenticate('local', {session: false}, (err, user, info) => {
            console.log('err, info', err, info);
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

                    // The JWT strategy only reads _id from the token (services/passport.js).
                    const token = jwt.sign({ _id: String(user._id) }, JWT_SECRET_KEY);
                    const sessionUser = user.toJSON();
                    delete sessionUser.password;
                    delete sessionUser.validationCode;
                    delete sessionUser.__v;
                    res.json({
                        result: {
                            user: sessionUser,
                            token: token
                        }
                    })
                });
            }

        })(req, res, next);
    }

    signup(req, res, next) {
        const parsed = sanitizeSignupData(req.body.data);

        if (!parsed.error) {
            this.model.create(parsed.data).then((user)=>{
                res.json({
                    result: {
                        _id: user._id,
                        email: user.email,
                        firstName: user.firstName,
                        lastName: user.lastName
                    }
                })
            }).catch(err=>{
                console.log(err);
                res.status(500).json({
                    result: 'Error',
                    type: err.type ? err.type : 'ServerError',
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

        if ( typeof code === 'string' && code ) {
            this.model.getByCode(code)
            .then((result) => {
                // The invite sign-up page only needs the id (for complete) and the email (prefill).
                res.json({
                    result: result ? { _id: result._id, email: result.email } : null
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
        const parsed = sanitizeSignupData(req.body.data);
        let code = req.body.code;
        let id = req.params.id

        if (!parsed.error && typeof code === 'string' && code) {
            this.model.complete(id, code, parsed.data)
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
        const user = req.user;

        const parsed = sanitizeUserUpdate(req.body.data, user._id, id);
        if (parsed.error) {
            return res.status(400).json({
                result: 'Error',
                message: parsed.error
            });
        }

        this.model.updateOne(id, parsed.data)
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

    sendResetPass(req, res, next) {
        const { email, url } = req.body;

        if (email && url) {
            this.model.sendResetPass(email, url).then(result => {
                res.json({
                    result: result
                })
            }).catch(err => {
                console.log(' send ');
                console.log(err, err.response ? err.response.body : '');
                res.status(500).json({
                    result: 'Error',
                    type: err.type ? err.type : 'ServerError',
                    message: err.message
                });
            })
        } else {
            res.status(400).json({
                result: "Error",
                type: 'BadRequest',
                message: 'bad request'
            });
        }
    }

    resetPassword(req, res, next) {
        const { password, code } = req.body;

        if (password && code) {
            this.model.resetPassword(code, password).then(result => {
                res.json({
                    result: 'Ok'
                })
            }).catch(err => {
                console.log(' send ');
                console.log(err, err.response);
                res.status(500).json({
                    result: 'Error',
                    type: err.type ? err.type : 'ServerError',
                    message: err.message
                });
            })
        } else {
            res.status(400).json({
                result: "Error",
                type: 'BadRequest',
                message: 'bad request'
            });
        }
    }

    getUserByBluePrint(req, res, next) {
        const id = req.params.id;
        const userId = req.query.userId;

        if (id && userId) {
            this.blueprints.getBluePrintConnectedToUsers(id, userId)
            .then(list => {
                res.json({
                    result: list
                })
            })
            .catch(err =>{
                res.status(500).json({
                    result: 'Error',
                    message: 'Bad Request'
                });
            })
        } else {
            res.status(400).json({
                result: "Error",
                message: 'Bad request'
            })
        }
    }

}

module.exports = Users;
const passport =  require('passport');
const Strategy =  require('passport-local');
const passportJWT =  require('passport-jwt');
const UserModel = require('../db/models/Users');
const ExtractJWT  = passportJWT.ExtractJwt;
const JWTStrategy = passportJWT.Strategy;

const JWT_SECRET_KEY = process.env.AUTH_SECRET_KEY || "stack-builder";

exports.initPassport = function(){
    passport.use(new Strategy(  
      function(username, password, done) {
        // database dummy - find user and verify password
        
  
        console.log("initPassport Strategy", username, password);
        let dbModel = new UserModel();
           dbModel.checkCredantial(username, password)
               .then((user)=>{
                 console.log( 'done', user);
                 done(null,user);
               })
               .catch((err)=>{
                   done(null, false);
               });
    }));
    
    passport.use(new JWTStrategy({
            jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
            secretOrKey   : JWT_SECRET_KEY
        },
        function (jwtPayload, callback) {
            let dbModel = new UserModel();
            dbModel.getOne(jwtPayload._id)
              .then((user)=>{
                  callback(null, user);
              })
              .catch((err)=>{
                  callback(err, null);
              });
        }
    ));
  
    return passport;
  }
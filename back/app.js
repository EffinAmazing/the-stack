const express = require('express')
const config = require('./config');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const router = require('./core/router');
const mongoose = require('mongoose');
const path = require('path');

const app = express();

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use("/", router);

app.use(function(err, req, res, next){
    if(err){
        console.error(err.stack);
        res.status(500);
        let response = {
            status: 500,
            data: null,
            errors: [err.message]
        }
        res.json(response);
    }else{
        next();
    }
})

app.listen(config.PORT, () =>{
    console.log(`App listening on port ${config.PORT}!`);
});

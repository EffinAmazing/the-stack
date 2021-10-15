const express = require('express')
const config = require('./config');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const router = require('./core/router');
const mongoose = require('mongoose');
const https = require('https');
const cors = require('cors');
const path = require('path');
const os = require("os");
const fs = require('fs');
const formData = require("express-form-data");
const initPassport = require('./services/passport').initPassport;

const app = express();

const options = {
    uploadDir: os.tmpdir(),
    autoClean: true
};

let optionsSSL = {
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem')
}

if(process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'prod') {
    // Certificate
    const privateKey = fs.readFileSync('/etc/letsencrypt/live/mtsb-api.mcgaw.io/privkey.pem', 'utf8');
    const certificate = fs.readFileSync('/etc/letsencrypt/live/mtsb-api.mcgaw.io/cert.pem', 'utf8');
    const ca = fs.readFileSync('/etc/letsencrypt/live/mtsb-api.mcgaw.io/chain.pem', 'utf8');

    optionsSSL = {
        key: privateKey,
        cert: certificate,
        ca: [ca]
    };
} 

// console.log(optionsSSL);

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.connect(config.MONGOURI + config.DB_NAME , {useNewUrlParser: true,  useUnifiedTopology: true });

app.use(cors());
// parse data with connect-multiparty. 
app.use(formData.parse(options));
// delete from the request all empty files (size == 0)
app.use(formData.format());
// change the file objects to fs.ReadStream 
app.use(formData.stream());
// union the body and the files
app.use(formData.union());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public'), { dotfiles: 'allow' }));
initPassport();
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

https.createServer(optionsSSL, app).listen(443);
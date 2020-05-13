

var dotenv = require("dotenv");
var path = require('path');
var configs = Object.create(null);

let data = {
    PORT: 9000,
    MONGOURI: 'mongodb://localhost:27017/',
    DB_NAME: 'marchtach',
    SENDGRID_API_KEY: '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' 
}

if (process.env.NODE_ENV === "prod") {
    data.PORT = 80;
}

//configs = dotenv.config({path: path.resolve("./server/.env.development")});
//console.log(configs);

// exports.config = configs.parsed;

module.exports = data
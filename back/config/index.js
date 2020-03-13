

var dotenv = require("dotenv");
var path = require('path');
var configs = Object.create(null);

if (process.env.NODE_ENV !== "development") {

}

//configs = dotenv.config({path: path.resolve("./server/.env.development")});
//console.log(configs);

// exports.config = configs.parsed;

module.exports = {
    PORT: 9000,
    MONGOURI: 'mongodb://localhost:27017/',
    DB_NAME: 'marchtool'
}
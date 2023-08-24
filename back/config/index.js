

var dotenv = require("dotenv");
var path = require('path');
var configs = Object.create(null);

// let configs = dotenv.config();
let data = {
    PORT: 9000,
    PORT_V2: 4000,
    PORT_DEV: 4100,
    MONGOURI: 'mongodb://localhost:27017/',
    DB_NAME: 'marchtach',
    DEV_DB_NAME: 'marchtachdev'
}

if (process.env.NODE_ENV === "prod" || process.env.NODE_ENV === "production") {
    data.PORT = 80;
}

//configs = dotenv.config({path: path.resolve("./server/.env.development")});
configs = dotenv.config();
data = Object.assign({}, data, configs.parsed );

// exports.config = configs.parsed;

module.exports = data
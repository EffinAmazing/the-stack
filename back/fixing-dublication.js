const config = require('./config');
const mongoose = require('mongoose');
const ToolsModel = require('./db/models/Tools');
const async = require('async');
const service = require('./services/sitetechonlogies');


mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.connect(config.MONGOURI + config.DB_NAME , {useNewUrlParser: true});


async function findDuplication() {
    let model = new ToolsModel();
    let documents =  model.modelDB.countDocuments({});
}
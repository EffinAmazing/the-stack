const ToolsModule = require('./db/models/Tools');
const CategoriesModule = require('./db/models/Categories');
// const NodesModule = require('./db/models/ToolsNodes');
const async = require('async');
const mongoose = require('mongoose');
const config = require('./config');

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.connect(config.MONGOURI + config.DB_NAME , {useNewUrlParser: true,  useUnifiedTopology: true });

function reloadCategoriesForTool() {
    const tools = new ToolsModule();
    const categories = new CategoriesModule()
    
    console.log("start loading");
    tools.getList({}, []).then((list) => {
        async.eachSeries(list, (item, cb) => { 
            categories.proceedList(item.categories).then((res) => {
                cb(null, res);
            }).catch((err)=> { 
                console.log(err);
            })
        }, function(err, res) {
            console.log("completed loading");
            console.log(err, res);
        })
    });
}

reloadCategoriesForTool();




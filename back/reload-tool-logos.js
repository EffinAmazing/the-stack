const config = require('./config');
const mongoose = require('mongoose');
const ToolsModel = require('./db/models/Tools');
const async = require('async');
const service = require('./services/sitetechonlogies');


mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.connect(config.MONGOURI + config.DB_NAME , {useNewUrlParser: true});

async function toolLogoUpdate(item, icon, model) {
    const dirpath = await service.saveLogo(item._id, icon)
    const res = await model.updateTool(item._id, { logo: '/tools-logos/' + item._id  + '.png'});
}

function reloadImageForTool (){
    const model = new ToolsModel();
    console.log("start loading");

    model.getList({}, []).then((list) => {
        async.eachSeries(list, (item, cb) => { 
            console.log(' -------------- ');
            if (item.logo && item.name && item.logo.indexOf('https://') !== -1) {
                toolLogoUpdate(item, item.logo, model).then((result) => {
                    console.log(item.name, ' - loaded ');
                    setTimeout(() => { cb(null) }, 300);
                }).catch(err=>{
                    console.log(item.name, ' - fail ', err);
                    setTimeout(() => { cb(null) }, 300);
                })
            } else {
                console.log(item.name, ' - passed ');
                cb(null)
            }
        }, function(err, res) {
            console.log("completed loading");
            console.log(err, res);
        });
    })
}
 
setTimeout(reloadImageForTool, 1000);

//reloadImageForTool();
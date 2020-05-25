const ToolsModule = require('./db/models/Tools');
const NodesModule = require('./db/models/ToolsNodes');
const async = require('async');
const mongoose = require('mongoose');
const config = require('./config');

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.connect(config.MONGOURI + config.DB_NAME , {useNewUrlParser: true,  useUnifiedTopology: true });

const tools = new ToolsModule();
const nodes = new NodesModule();

async function getAllList() {
    let count = await tools.modelDB.countDocuments({}).exec();

    let pages = Math.ceil( count / 100 );
    let duplicates = {};

    let all = [];
    for (let i = 0; i < pages; i++) {
        let r = await tools.modelDB.find({}).limit(100).skip( i * 100).exec();
        // console.log();
        let mapped = await async.map(r, (item, cb)=>{  
            let mappedItem = tools.mapDocument(item); 
            all.push(mappedItem);

            if (duplicates[mappedItem.name]) {
                duplicates[mappedItem.name].push(mappedItem);
            } else {
                duplicates[mappedItem.name] = [mappedItem];
            }
            cb(null, mappedItem);
            
        });

        // all.push(mapped);

    }

    let counter = 0;
    for (const key in duplicates) {
        if (duplicates.hasOwnProperty(key)) {
            if (duplicates[key].length > 1) {
                counter++;
                console.log(counter, key, duplicates[key].length);
                
                let sliced = duplicates[key].slice(1);
                let mappedSliced = await async.map(sliced, (item, cb) => { cb(null, item.id) });
                console.log(" ******* base ****** ", duplicates[key][0].id);
                console.log(' **************** mappedSliced **************** ', mappedSliced);

                let res = await nodes.modelDB.updateMany({ toolId: { $in: mappedSliced } }, { toolId: duplicates[key][0].id } ).exec();
                await tools.modelDB.deleteMany({ _id: { $in: mappedSliced  } }).exec();
            }
        }
    }
    
    console.log(count, all.length);
    return all.length;
}


getAllList().then(res => {
    console.log(res);
}).catch(err => {
    console.log(err);
})
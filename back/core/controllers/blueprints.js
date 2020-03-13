const fs = require('fs');
const path = require('path');
const async = require('async');

class BluePrints {
    constructor(){

    }

    getDomainTools(req, res, next) {
        let pathURI = path.resolve("../test-data/", 'effinamazing.com.json');
        //console.log(pathURI);
        fs.readFile(pathURI,'utf8', function(err, data){
            if (err) {
                res.json({
                    result: "Error",
                    message: err.message
                })
            } else {
                let A = JSON.parse(data)
                let Technologies = A.Results[0].Result.Paths[0].Technologies;

                async.map(Technologies, (item, cb)=>{
                    cb(null, { 
                        categories: item.Categories,
                        name: item.Name,
                        description: item.Description,
                        link: item.Link,
                        tag: item.Tag
                    })

                }, function(err, results){

                    if(err){
                        res.json({
                            result: "Error",
                            message: err.message
                        })
                    } else res.json({
                        result: results
                    });

                })
            }
        });
    }

    createBlueprint(req, res, next) {
        res.json({
            result: "Ok"
        })
    }

    updateBlueprint(req, res, next) {
        res.json({
            result: "Ok"
        })
    }
}


module.exports = BluePrints;
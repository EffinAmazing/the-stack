const fs = require('fs');
const path = require('path');
const async = require('async');

function getTestDataFromFile(){
    
    let pathURI = path.resolve("../test-data/", 'effinamazing.com.json');

    let promise = new Promise((resolve, reject)=>{
        fs.readFile(pathURI,'utf8', function(err, data){
            if(err){
                reject(err);
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
                        reject(err);
                    } else {
                        resolve(results);
                    }                    
                })
            }
        });
    });

    return promise;
}

exports.getToolsOfDomain = async function(domain){

    let data = await getTestDataFromFile();

    return data
    /*fs.readFile(pathURI,'utf8', function(err, data){
        if (err) {
            
        } else {
            
        }
    });*/
}
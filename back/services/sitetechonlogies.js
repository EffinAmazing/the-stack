const fs = require('fs');
const path = require('path');
const async = require('async');
const axios = require('axios');
const download = require('./download');
const configs = require('../config');

const API_KEY = configs.BUILTWIDTH_API_KEY;

async function getTestDataFromFile(domain){
    let url = `https://api.builtwith.com/v14/api.json?KEY=${API_KEY}&LOOKUP=${domain}`;

   if (process.env.NODE_ENV !== "production") {
        //url = `http://localhost:9000/cashed/effinamazing.com.json`;
        // url = `http://localhost:9000/cashed/forum.xda-developers.com-error.json`;
        // url = `http://localhost:9000/cashed/zulily.com.json`;
        // url = `http://localhost:9000/cashed/bitbucket.org.json`;
    }

    // let pathURI = path.resolve("../test-data/", 'effinamazing.com.json');
    let response = await axios({
        method: 'GET',
        url:   url,
        responseType: "text/json"
    });

  
    let A = response.data;
    let Technologies = [];

    if (A.Results.length == 0) {
        //BuiltWith returned no results
        const errorCode = A.Errors && A.Errors.length > 0 ? A.Errors[0].Code : null;
        const errorMessage = A.Errors && A.Errors.length > 0 ? A.Errors[0].Message : null;
        return { 
            tech: [], 
            spend: 0,
            errorCode: errorCode,
            errorMessage: errorMessage
        };      
    } 

    Technologies = A.Results[0].Result.Paths[0].Technologies;

    const results = await async.map(Technologies, (item, cb)=>{        
        cb(null, { 
            categories: item.Categories,
            name: item.Name,
            description: item.Description,
            link: item.Link,
            tag: item.Tag,
            start: item.FirstDetected,
            end: item.LastDetected
        })
    });
            
    return  { 
        tech: results, 
        spend: A.Results[0].Result.Spend,
    };
}

exports.getDomainTool = async function(domain) {
    const _path = path.resolve(__dirname, '../public/domain-logos', domain + '.png');
    let  tool;
    
    try {
        let data = await download.downloadImage(_path, 'https://logo.clearbit.com/' + domain);
        
        tool = {
            categories: ['WebSite'],
            name: domain,
            logo: '/domain-logos/' + domain + '.png',
            description: "WebSite",
            link: 'http://' + domain,
            tag: "domain"
        }
    } catch(err){
        tool = {
            categories: ['WebSite'],
            name: domain,
            logo: '',
            description: "WebSite",
            link: 'http://' + domain,
            tag: "domain"
        }
    }

    return tool;
}

exports.loadToolLogo = async function(name){
    let response = await axios({
        method: 'GET',
        url:   `https://api.builtwith.com/trends/v6/api.json?KEY=${API_KEY}&TECH=${name}`,
        responseType: "text/json"
    });

    let tech = response.data.Tech;

    return tech.Icon;
}

exports.saveLogo = async function(id, url) {
    const _path = path.resolve(__dirname, '../public/tools-logos', id + '.png');
    let  tool;
    
    let data = await download.downloadImage(_path, url);

    return data;
}

exports.getToolsOfDomain = async function(domain){

    let data = await getTestDataFromFile(domain);

    return data
    /* */
}
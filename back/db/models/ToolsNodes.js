var mongoose = require('mongoose');
var async = require('async');
var AbstaractModel = require('./_abstract');
const ObjectId = mongoose.Schema.Types.ObjectId;

const BlockedCategories = [
    'Copyright',
    'CSS Media Queries',
    'Document Encoding',
    'Browser Specific',
    'Compatibility',
    'CSS',
    'Design Framework',
    'DocType Declaration',
    'Meta Tags',
    'Mobile Specific',
    'SSL Seals',
    'Domain Parking',
    'Application',
    'Controls',
    'Magento Theme',
    'Node.js',
    'NodeJS',
    'PHP Theme',
    'Plugin',
    'Programming Language',
    'Schema',
    'Theme',
    'Web App',
    'WordPress Theme',
    'AJAX',
    'Animation',
    'Charting',
    'Compatibility',
    'Cookie Management',
    'Error Tracking',
    'Fingerprint',
    'fingerprinting',
    'Forms and Surveys',
    'Framework',
    'Image Library',
    'JavaScript Library',
    'jQuery Plugin',
    'Lightbox',
    'Media',
    'Slider',
    'UI',
    'Language',
    'DDoS Protection',
    'Enterprise DNS',
    'SaaS DNS',
    'Module',
    'Operating System',
    'Protocol',
    'Robots.txt',
    'SEO Header Tag',
    'SEO Meta Tag',
    'SEO Title Tag',
    'Shipping Providers',
    'Extended Validation',
    'Multi Domain',
    'Not Trusted',
    'Root Authority',
    'Server Gated Cryptography',
    'Wildcard',
    'Syndication Techniques',
    'Edge Delivery Network',
    'Advertising',
    'Bookings',
    'Homepage Link',
    'Web Master Registration',
    'Application Server',
    'Caching Proxy',
    'Linux Web Server',
    'Windows Web Server',
    'WordPress Plugins',
    'Video Players',
    'Standard',
    'Fonts',
    'Digital Video Ads',
    'Audience Targetg',
    'Facebook Exchange',
    'Data Management Platform',
    'Demand-side Platform',
    'Ad network',
    'Ad Exchange',
    'Multi-channel',
    'Payment Currency',
    'Open source',
    'Plug in / Module',
    'Transaction email',
    'Ad server',
    'Application Performance',
    'Site Search',
    'Social Sharing',
    'Business Email Hosting',
    'Fraud Prevention',
    'Transactional Email',
    'Login',
    'Visitor Count Tracking'
]

class ToolsNodesModel extends AbstaractModel {
    constructor(){
        super('blueprints_tools');

        this.schema = mongoose.Schema({
            blueprintId: ObjectId,
            toolId: ObjectId,
            position: { x: Number, y: Number },
            start: Date,
            end: Date,
            cost: Number,
            owner: String,
            trainedOn: String,
            hide: Boolean,
            dependencies: [{
                input: { type: String, enum: [ 'Left', 'Right', 'LeftTop', 'RightTop', 'MiddleTop', 'LeftBottom', 'RightBottom', 'MiddleBottom' ] },
                itemId: ObjectId,
                direction: { type: String, enum: [ "Inner", "Outer"] }
            } ],
            domain: String
        });

        this.initModel();
    }

    async getNodesByBlueprint(blueprintId){
        let docs = await this.modelDB.find({ blueprintId: blueprintId }).exec();
        let mappedDocs = await async.map(docs, (item, cb)=>{ cb( null, this.mapDocument(item) ); });
        return mappedDocs;
    }

    async createNodesForTool(blueprintId, tool) {
        let data = {
            blueprintId: blueprintId,
            toolId: tool.id
        }
        
        if(tool.start) data['start'] = new Date(tool.start);
        if(tool.end) data['end'] = new Date(tool.end);

        let item = await this.modelDB.find({ blueprintId: blueprintId, toolId: tool.id });
        if (item) {
            let doc = await this.modelDB.create(data);
            return this.mapDocument(doc);
        } else {
            return false;
        }

    }

    async createNodesForTools(blueprintId, tools, domain = '') {
        let arrIds = [];
        let dataList = await async.map(tools, (item, cb)=>{ 
            let data = {
                blueprintId: blueprintId,
                toolId: item.id
            }
            arrIds.push(item.id);
            if (domain) {
                data['domain'] = domain;
            }
            if(item.start) data['start'] = new Date(item.start);
            if(item.end) data['end'] = new Date(item.end);
            cb(null, data);
        });

        
        let list = await this.modelDB.find({ blueprintId: blueprintId, toolId: { $in: arrIds } });
        // console.log(list);
        if (list.length > 0) {
            dataList = await async.filter(dataList, (item, cb)=>{
                let index = list.findIndex((ulI) =>{
                    return ulI.toolId === item.toolId;
                });
                
                return index === -1;
            })
        }

        let docs = await this.modelDB.create(dataList);
        let mappedDocs = await async.map(docs, (item, cb)=>{ cb( null, this.mapDocument(item) ); });
        return mappedDocs;
    }

    async isBlockedCat(categories) {
        let isInArray = false;
        if (!categories) return true;
        if ( categories && categories.length === 0 )  return true;

        for await (const cat of BlockedCategories) {
            if (categories.includes(cat)) {
                isInArray = true;
                break;
            }
        }

        return isInArray;
    }

    async filterToolsByNodes(blueprintId, tools, domain = '') {
        let filteredTools = [];
        let filteredNodes = [];
        const self = this;
        let counter = 0;
        let dataList = await async.map(tools, (item, cb)=>{ 
            self.modelDB.find({ blueprintId: blueprintId, toolId: item.id }).then((docs) => {
                // console.log('find node for tool: ' + item.name, doc );
                if (docs.length > 0) {
                    cb(null, docs);
                } else {
                    
                    self.isBlockedCat(item.categories).then(isInArray =>{
                        let data = {
                            blueprintId: blueprintId,
                            toolId: item.id,
                            hide: isInArray
                        }
                        console.log(' -------------- save  ------------- ', counter);
                        if(domain) data['domain'] = domain;
                        if(item.start) data['start'] = new Date(item.start);
                        if(item.end) data['end'] = new Date(item.end);
                        self.modelDB.create(data).then((docN) => {
                            let node = self.mapDocument(docN);
                            console.log(' create node ' + docN._id + ' for tool: ' + item.name);
                            // console.log(docN);
                            node.tool = item;
                            filteredNodes.push( node );
                            cb(null, docN);
                        }).catch(error => {
                            console.log(' create error ', error );
                            cb(error, null);
                        });
                    }).catch(err=>{
                        console.log(' create error ', err );
                        cb(err, null);
                    })
                }
            }).catch(err => {
                let data = {
                    blueprintId: blueprintId,
                    toolId: item.id
                }
                console.log(' find error ', err, counter);
                
                if(item.start) data['start'] = new Date(item.start);
                if(item.end) data['end'] = new Date(item.end);
                self.modelDB.create(data).then((docN) => {
                    let node = self.mapDocument(docN);
                    console.log(' create node ' + docN._id + ' for tool: ' + item.name);
                    // console.log(docN);
                    node.tool = item;
                    filteredNodes.push( node );
                }).catch(error => {
                    console.log(' create error ', error );
                    cb(error, null);
                });
            });
            counter++;
        });

        return filteredNodes;
    }

    async updateOne(id, data){
        let doc = await super.updateOne(id, data);
        return this.mapDocument(doc);
    }

    async hideList(ids) {
        let res = await async.every(ids, (item, callback) => {
            this.modelDB.update({ _id: item }, { hide: true }, callback);
        });

        return res;
    }

    async unhideList(ids) {
        let res = await async.every(ids, (item, callback) => {
            this.modelDB.update({ _id: item }, { hide: false }, callback);
        });

        return res;
    }

    async removeAllForBlueprintId(blueprintId){
        let result = await this.modelDB.deleteMany({ blueprintId: blueprintId }).exec();
        return result;
    }

    async addOne(data){
        let doc = await this.modelDB.create(data);
        const mapped = this.mapDocument(doc);
        return mapped;
    }

    async addListNodes(datList){
        let docs = await this.modelDB.create(datList);
        let mappedDocs = await async.map(docs, (item, cb)=>{ cb( null, this.mapDocument(item) ); });
        return mappedDocs;
    }

    /*
    DEPRECATED: INEFFICIENT
    async getNodesIdForTools(tools, blueprintId) {
        // 1 get ids of tools
        
        let mappedTool = await async.map(tools, (item, cb) => { 
            this.modelDB.findOne({ toolId: item.id, blueprintId:  blueprintId}, (err, doc) => {
                if (err || !doc) {
                    cb(null, item )
                } else {
                    item['nodeId'] = doc._id
                    cb(null, item)
                }
            }) 
        });
        
        console.log(tools);
        return tools
    }
    */

    
    async getNodesIdForTools(tools, blueprintId) {

        const toolIds = tools.map(item => item.id);

        const query = {
            toolId: { $in: toolIds },
            blueprintId: blueprintId
        };

        const matchingDocs = await this.modelDB.find(query);

        const toolIdToNode = {};
        matchingDocs.forEach(doc => {
            toolIdToNode[doc.toolId] = doc._id;
        });

        tools.forEach(tool => {
            if (toolIdToNode.hasOwnProperty(tool.id)) {
                tool.nodeId = toolIdToNode[tool.id];
            }
        });

        console.log(tools);
        return tools;
    }
    

    async copyNodes(formId, newId) {
        let list = await this.getNodesByBlueprint(formId);
        let keysTable = {};

        let nodes = await async.map(list, (item, callback)=> {
            let data = {
                blueprintId: newId,
                toolId: item.toolId,
                position: item.position,
                start: item.start,
                end: item.end,
                cost: item.cost,
                hide: item.hide
            }
            this.addOne(data).then(mappedDoc => {
                keysTable[item.id] = mappedDoc.id;
                callback(null, mappedDoc);
            }).catch(err => { callback(err, null) });
        });

        return keysTable;
    }
}

module.exports = ToolsNodesModel;
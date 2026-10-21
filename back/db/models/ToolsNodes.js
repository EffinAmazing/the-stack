var mongoose = require('mongoose');
var async = require('async');
var AbstaractModel = require('./_abstract');
var CategoriesModel = require('./Categories');
var TagsModel = require('./Tags');
const { decideTool, isStale, loadRules } = require('../../services/visibility-rules');

// New stacks keep at least this many tools visible when admin rules hide tools (same as the old first-load pass).
const MIN_VISIBLE = 5;
const ObjectId = mongoose.Schema.Types.ObjectId;

/*
 * DEPRECATED (2026-10) — no longer used. Category/tag visibility rules now live in the database
 * (categories.status, tags.status), managed on the admin Categories page and seeded by
 * back/migrate-visibility-rules.js from back/db/seed/visibility-rules-2026-10.json.
 * Kept commented out for reference only.
 *
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
*/

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
            nickname: String,
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

    // Admin visibility rules for nodes being created now. Returns { [toolId]: 'show' | 'hide' | null }.
    async decideNewNodes(tools) {
        const rules = await loadRules(new CategoriesModel(), new TagsModel());
        const decisions = {};
        tools.forEach((tool) => {
            decisions[String(tool.id)] = decideTool(tool, rules, isStale(tool.end)).state;
        });
        return decisions;
    }

    async createNodesForTools(blueprintId, tools, domain = '') {
        const decisions = await this.decideNewNodes(tools);
        // New stack: like the old first-load pass, rule hides never leave fewer than MIN_VISIBLE tools visible.
        let hiddenCount = 0;
        let arrIds = [];
        let dataList = await async.map(tools, (item, cb)=>{ 
            let hide = false;
            if (decisions[String(item.id)] === 'hide' && tools.length - hiddenCount > MIN_VISIBLE) {
                hide = true;
                hiddenCount++;
            }
            let data = {
                blueprintId: blueprintId,
                toolId: item.id,
                hide: hide
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
        let mappedDocs = await async.map(docs, (item, cb)=>{
            const node = this.mapDocument(item);
            node.rule = decisions[String(node.toolId)] || null;
            cb( null, node );
        });
        return mappedDocs;
    }

    async filterToolsByNodes(blueprintId, tools, domain = '') {
        
        const existingDocs = await this.modelDB.find({
            blueprintId,
            toolId: { $in: tools.map(t => t.id) }
        });
        const existingToolIds = new Set(existingDocs.map(doc => doc.toolId.toString()));

        const toolsToCreate = tools.filter(tool => !existingToolIds.has(tool.id.toString()));
        const decisions = await this.decideNewNodes(toolsToCreate);

        //console.log('toolsToCreate',toolsToCreate);

        const newNodes = await Promise.all(toolsToCreate.map(async (tool) => {
            try {
                const rule = decisions[String(tool.id)] || null;
                const data = {
                    blueprintId,
                    toolId: tool.id,
                    hide: rule === 'hide',
                    ...(domain && { domain }),
                    ...(tool.start && { start: new Date(tool.start) }),
                    ...(tool.end && { end: new Date(tool.end) }),
                };

                const doc = await this.modelDB.create(data);
                const node = this.mapDocument(doc);
                node.tool = tool;
                node.rule = rule;
                return node;
            } catch (err) {
                console.error(`Failed to create node for tool "${tool.name}":`, err);
                return null;
            }
        }));

        return newNodes.filter(Boolean);
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
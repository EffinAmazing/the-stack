var mongoose = require('mongoose');
var async = require('async');
var AbstaractModel = require('./_abstract');
const ObjectId = mongoose.Schema.Types.ObjectId;

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
            } ]
        });

        this.initModel();
    }

    async getNodesByBlueprint(blueprintId){
        let docs = await this.modelDB.find({ blueprintId: blueprintId }).exec();
        let mappedDocs = await async.map(docs, (item, cb)=>{ cb( null, this.mapDocument(item) ); });
        return mappedDocs;
    }

    async createNodesForTools(blueprintId, tools){
        let arrIds = [];
        let dataList = await async.map(tools, (item, cb)=>{ 
            let data = {
                blueprintId: blueprintId,
                toolId: item.id
            }
            arrIds.push(item.id);
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

        return tools
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
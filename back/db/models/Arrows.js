var mongoose = require('mongoose');
var async = require('async');
var AbstaractModel = require('./_abstract');
const ObjectId = mongoose.Schema.Types.ObjectId;


class ArrowsModel extends AbstaractModel { 
    constructor(){
        super('arrows');

        this.schema = mongoose.Schema({
            start: { nodeId: String, x: Number, y: Number, pos: String, offset: Number },
            end: { nodeId: String, x: Number, y: Number, pos: String, offset: Number },
            lineId: String,
            blueprintId: ObjectId,
            created: { type: Date, default: Date.now },
            updated: { type: Date, default: Date.now}
        });

        this.initModel();
    }

    async createArrowForBluePrint(blueprintId, arrowData) {
        arrowData['blueprintId'] = blueprintId;
        let arrow = await this.create(arrowData);

        return this.mapDocument( arrow );
    }

    async updateOne(id, data){
        let doc = await super.updateOne(id, data);
        // console.log(doc);
        return this.mapDocument(doc);
    }

    async getArrowsByBluePrintId(blueprintId){
        let listArrows = await this.modelDB.find({ blueprintId: blueprintId }).exec();
        let mapped = await async.map(listArrows, (item, cb)=>{
            cb(null, this.mapDocument(item));
        });

        return mapped;
    }

    async copyArrows(fromId, newId, keysTable) {
        let list = await this.modelDB.find({ blueprintId: fromId }).exec();

        let arrows = await async.map(list, (item, callback) => {
            const startNode = item.start.nodeId;
            const endNode = item.end.nodeId;

            let start = Object.assign({}, item.start, { nodeId: keysTable[startNode] });
            let end = Object.assign({}, item.end, { nodeId: keysTable[endNode] });

            let lineId = item.lineId.replace(startNode, keysTable[startNode]).replace(endNode, keysTable[endNode]);

            this.createArrowForBluePrint(newId, {
                start: start,
                end: end,
                lineId: lineId
            }).then(document => {
                callback(null, document);
            }).catch(err => { callback(err, null); });
        });

        return arrows;
    }

    async removeAllByBlueprintId(blueprintId){
        let result = await this.modelDB.deleteMany({ blueprintId: blueprintId }).exec();
        return result;
    }

    async removeArrows(arrowsList){
        let result = await this.modelDB.remove({ lineId: { $in: arrowsList } }).exec()

        return result;
    }
}

module.exports = ArrowsModel;
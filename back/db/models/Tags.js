const mongoose = require('mongoose');
const NamedRulesModel = require('./_named-rules');
const { APP_TAGS } = require('../../services/visibility-rules');

// BuiltWith tag rules. Block-only: tags are never whitelisted.
class TagsModel extends NamedRulesModel {
    constructor() {
        super('tags', ['blocked'], APP_TAGS);

        this.schema = mongoose.Schema({
            name: String,
            status: String,
            firstSeen: Date
        });

        this.initModel();
    }

    async getBlocked() {
        return this.namesWithStatus('blocked');
    }
}

module.exports = TagsModel;

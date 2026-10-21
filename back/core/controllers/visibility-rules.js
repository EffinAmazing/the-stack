const ToolsModel = require('../../db/models/Tools');
const CategoriesModel = require('../../db/models/Categories');
const TagsModel = require('../../db/models/Tags');
const { buildRuleList } = require('../../services/rule-lists');
const { NO_CATEGORY, APP_TAGS } = require('../../services/visibility-rules');

const MAX_NAME_LENGTH = 200;

function badRequest(res, message) {
    return res.status(400).json({ result: 'Error', message });
}

function serverError(res, err) {
    console.log(err);
    return res.status(500).json({ result: 'Error', message: 'Server error' });
}

function validName(name) {
    return typeof name === 'string' && name.trim() !== '' && name.length <= MAX_NAME_LENGTH;
}

// Admin endpoints for category and tag rules (Categories page, both tabs).
class VisibilityRules {
    constructor() {
        this.tools = new ToolsModel();
        this.categories = new CategoriesModel();
        this.tags = new TagsModel();
    }

    async getCategories(req, res) {
        try {
            const results = await Promise.all([this.tools.getCategoryCounts(), this.categories.getMeta()]);
            const counts = results[0];
            const meta = results[1];
            const data = buildRuleList(counts.rows, meta, {
                search: req.query.search,
                status: req.query.status,
                offset: req.query.offset,
                limit: req.query.limit,
                statuses: ['whitelisted', 'blocked'],
                exclude: [NO_CATEGORY]
            });
            const noCategoryMeta = meta.get(NO_CATEGORY);
            data.noCategory = {
                name: NO_CATEGORY,
                tools: counts.noCategory.tools,
                examples: counts.noCategory.examples,
                status: noCategoryMeta && noCategoryMeta.status ? noCategoryMeta.status : 'normal',
                isNew: false
            };
            res.json({ result: data });
        } catch (err) {
            serverError(res, err);
        }
    }

    async setCategoryStatus(req, res) {
        const name = req.body.name;
        const status = req.body.status === undefined ? null : req.body.status;
        if (!validName(name)) return badRequest(res, 'Invalid name');
        if (status !== null && status !== 'whitelisted' && status !== 'blocked') return badRequest(res, 'Invalid status');
        try {
            await this.categories.setStatus(name, status);
            res.json({ result: 'Ok' });
        } catch (err) {
            serverError(res, err);
        }
    }

    async getTags(req, res) {
        try {
            const results = await Promise.all([this.tools.getTagCounts(), this.tags.getMeta()]);
            const data = buildRuleList(results[0], results[1], {
                search: req.query.search,
                status: req.query.status,
                offset: req.query.offset,
                limit: req.query.limit,
                statuses: ['blocked'],
                exclude: APP_TAGS.concat([''])
            });
            res.json({ result: data });
        } catch (err) {
            serverError(res, err);
        }
    }

    async setTagStatus(req, res) {
        const name = req.body.name;
        const status = req.body.status === undefined ? null : req.body.status;
        if (!validName(name) || APP_TAGS.includes(name)) return badRequest(res, 'Invalid name');
        if (status !== null && status !== 'blocked') return badRequest(res, 'Invalid status');
        try {
            await this.tags.setStatus(name, status);
            res.json({ result: 'Ok' });
        } catch (err) {
            serverError(res, err);
        }
    }

    async getBlockImpact(req, res) {
        const category = req.query.category;
        const tag = req.query.tag;
        if (!validName(category) && !validName(tag)) return badRequest(res, 'category or tag is required');
        try {
            const rules = await this.categories.getRules();
            const match = validName(category) ? { category } : { tag };
            res.json({ result: await this.tools.getBlockImpact(match, rules.whitelisted) });
        } catch (err) {
            serverError(res, err);
        }
    }
}

module.exports = VisibilityRules;

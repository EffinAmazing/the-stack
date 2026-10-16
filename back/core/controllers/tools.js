const mongoose = require('mongoose');
const ToolsModels = require('../../db/models/Tools');
const CategoriesModel = require('../../db/models/Categories');
const TagsModel = require('../../db/models/Tags');
const { loadRules, decideTool } = require('../../services/visibility-rules');

const STATES = ['default', 'show', 'hide'];
const MAX_BULK_IDS = 500;

class Tools {
    constructor(){
        this.model = new ToolsModels();    
        this.categories = new CategoriesModel();
        this.tags = new TagsModel();
    }

    // Builder's per-node "hide globally" toggle (admins only): flag true = Hide, false = Show
    // (hidden true/false, same values it wrote before). App tools are skipped by the model.
    async updateVisibility(req, res, next){
        const toolId = req.body.node && req.body.node.tool && req.body.node.tool.id;
        const flag = req.body.flag;

        if (!toolId || typeof flag !== 'boolean' || !mongoose.Types.ObjectId.isValid(toolId)) {
            return res.status(400).json({ result: "Error", message: "incorrect data" });
        }

        try {
            const out = await this.model.bulkSetVisibility([String(toolId)], flag ? 'hide' : 'show');
            res.json({ result: out.tools[0] || null });
        } catch (err) {
            console.log(err);
            res.status(500).json({ result: "Error", message: err.message });
        }
    }

    async bulkSetVisibility(req, res, next) {
        const ids = req.body.ids;
        const state = req.body.state;

        if (!Array.isArray(ids) || ids.length === 0 || ids.length > MAX_BULK_IDS) {
            return res.status(400).json({ result: 'Error', message: 'ids must be an array of 1-' + MAX_BULK_IDS + ' tool ids' });
        }
        if (!ids.every(id => typeof id === 'string' && mongoose.Types.ObjectId.isValid(id))) {
            return res.status(400).json({ result: 'Error', message: 'Invalid tool id' });
        }
        if (!STATES.includes(state)) {
            return res.status(400).json({ result: 'Error', message: 'Invalid state' });
        }

        try {
            const result = await this.model.bulkSetVisibility(Array.from(new Set(ids)), state);
            result.tools = await this.withResults(result.tools);
            res.json({ result });
        } catch (err) {
            console.log(err);
            res.status(500).json({ result: 'Error', message: 'Server error' });
        }
    }

    async listTools(req, res, name) {
        try {
            const data = await this.model.queryTools({
                name,
                category: req.query.category,
                tag: req.query.tag,
                setting: req.query.setting,
                offset: req.query.offset,
                limit: req.query.limit
            });
            const rules = await loadRules(this.categories, this.tags);
            data.list = this.attachResults(data.list, rules);
            data.rules = rules;
            res.json({ result: data });
        } catch (err) {
            console.log(err);
            res.status(500).json({ result: 'Error', message: 'Server error' });
        }
    }

    // "Result on new stacks" for the Tools page — what decideTool would do at node creation
    // (ignoring staleness, which depends on the stack).
    attachResults(tools, rules) {
        return tools.map(tool => Object.assign({}, tool, { result: decideTool(tool, rules) }));
    }

    async withResults(tools) {
        return this.attachResults(tools, await loadRules(this.categories, this.tags));
    }

    getTools(req, res, next) {
        const name = typeof req.query.name === 'string' ? req.query.name.trim() : '';
        return this.listTools(req, res, name);
    }

    getByName(req, res, next) {
        const name = typeof req.query.name === 'string' ? req.query.name.trim() : '';
        if (!name) {
            return res.status(400).json({ result: 'Error', message: 'Bad Request' });
        }
        return this.listTools(req, res, name);
    }
}

module.exports = Tools;

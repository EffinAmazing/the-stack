const { test, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const { connect, disconnect } = require('./helpers/db');
const ToolsNodesModel = require('../db/models/ToolsNodes');
const CategoriesModel = require('../db/models/Categories');
const TagsModel = require('../db/models/Tags');

let nodes, categories, tags;
const blueprintId = new mongoose.Types.ObjectId();
const tool = (name, extra) => Object.assign({ id: new mongoose.Types.ObjectId(), name }, extra);
const old = new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString();

before(async () => {
    await connect('tools_nodes');
    nodes = new ToolsNodesModel(); categories = new CategoriesModel(); tags = new TagsModel();
});
after(disconnect);
beforeEach(async () => {
    await nodes.modelDB.deleteMany({}); await categories.modelDB.deleteMany({}); await tags.modelDB.deleteMany({});
    await categories.setStatus('Email Security', 'blocked');
    await categories.setStatus('Marketing Automation', 'whitelisted');
    await categories.setStatus('(No category)', 'blocked');
    await tags.setStatus('cms', 'blocked');
});

const sample = () => [
    tool('Agari', { categories: ['Email Security'], tag: 'mx' }),
    tool('Klaviyo', { categories: ['Email Security', 'Marketing Automation'], tag: 'mx' }),
    tool('Mailchimp', { categories: ['Email Security'], tag: 'mx', hidden: false }),
    tool('Webflow', { categories: ['Simple Website Builder'], tag: 'cms' }),
    tool('Calendly', { categories: ['Scheduling'], tag: 'widgets' }),
    tool('Orphan', { categories: [], tag: 'widgets' }),
    tool('Hidden One', { categories: ['Scheduling'], hidden: true }),
    tool('Old Whitelisted', { categories: ['Marketing Automation'], tag: 'widgets', end: old }),
    tool('site.io', { categories: ['WebSite'], tag: 'domain' })
];
const expected = {
    'Agari': [true, 'hide'], 'Klaviyo': [false, 'show'], 'Mailchimp': [false, 'show'], 'Webflow': [true, 'hide'],
    'Calendly': [false, null], 'Orphan': [true, 'hide'], 'Hidden One': [true, 'hide'],
    'Old Whitelisted': [false, null], 'site.io': [false, null]
};
const summary = (created, list) => Object.fromEntries(created.map((n) => {
    const t = list.find(x => String(x.id) === String(n.toolId));
    return [t.name, [n.hide, n.rule]];
}));

test('createNodesForTools (new stack) saves hide and returns rule per node', async () => {
    const list = sample();
    const created = await nodes.createNodesForTools(blueprintId, list, 'site.io');
    assert.deepEqual(summary(created, list), expected);
    const saved = await nodes.modelDB.find({ blueprintId }).lean();
    assert.equal(saved.filter(d => d.hide === true).length, 4);
    assert.ok(saved.every(d => !('rule' in d)));
});

test('createNodesForTools never rule-hides below 5 visible (in tool order)', async () => {
    const list = ['A', 'B', 'C', 'D', 'E', 'F', 'G'].map(n => tool(n, { categories: ['Email Security'], tag: 'mx' }));
    list.push(tool('Calendly', { categories: ['Scheduling'], tag: 'widgets' }));
    const created = await nodes.createNodesForTools(blueprintId, list);
    const s = summary(created, list);
    // 8 tools, 7 blocked: hide while more than 5 visible -> 3 hidden (A, B, C), 5 visible.
    assert.deepEqual(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'Calendly'].map(n => s[n][0]), [true, true, true, false, false, false, false, false]);
    assert.equal(s['D'][1], 'hide'); // spared by the minimum, decision still reported
});

test('filterToolsByNodes (domain added) applies the same rules, no minimum', async () => {
    const blocked = ['A', 'B', 'C', 'D', 'E', 'F'].map(n => tool(n, { categories: ['Email Security'], tag: 'mx' }));
    const added = await nodes.filterToolsByNodes(blueprintId, blocked, 'other.io');
    assert.ok(added.every(n => n.hide === true));
    await nodes.modelDB.deleteMany({});

    const list = sample();
    const created = await nodes.filterToolsByNodes(blueprintId, list, 'other.io');
    assert.deepEqual(summary(created, list), expected);
});

test('existing nodes are never re-evaluated or duplicated', async () => {
    const agari = tool('Agari', { categories: ['Email Security'] });
    await nodes.modelDB.create({ blueprintId, toolId: agari.id, hide: false });

    const created = await nodes.filterToolsByNodes(blueprintId, [agari]);
    assert.equal(created.length, 0);
    const docs = await nodes.modelDB.find({ blueprintId }).lean();
    assert.equal(docs.length, 1);
    assert.equal(docs[0].hide, false);
});

test('no category rules in the DB means nothing is hidden by rules', async () => {
    await categories.modelDB.deleteMany({}); await tags.modelDB.deleteMany({});
    const created = await nodes.createNodesForTools(blueprintId, [tool('Orphan', { categories: [] })]);
    assert.equal(created[0].hide, false);
    assert.equal(created[0].rule, null);
});

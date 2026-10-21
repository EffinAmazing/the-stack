const { test, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const { connect, disconnect } = require('./helpers/db');
const ToolsModel = require('../db/models/Tools');
const CategoriesModel = require('../db/models/Categories');
const TagsModel = require('../db/models/Tags');

let tools;
before(async () => { await connect('tools_model'); tools = new ToolsModel(); });
after(disconnect);
beforeEach(async () => {
    await tools.modelDB.deleteMany({});
    await tools.modelDB.create([
        { name: 'HubSpot', tag: 'analytics', categories: ['Marketing Automation', 'CRM'] },
        { name: 'Mailchimp', tag: 'mx', categories: ['Email Marketing', 'Email Security'], hidden: false },
        { name: 'Agari', tag: 'mx', categories: ['Email Security'] },
        { name: 'Drift', tag: 'widgets', categories: ['Live Chat', 'Marketing Automation'], hidden: true },
        { name: 'C++ Runtime', tag: 'framework', categories: ['A/B Testing'] },
        { name: 'Orphan', tag: 'widgets', categories: [] },
        { name: 'NoField', tag: 'widgets' },
        { name: 'example.com', tag: 'domain', categories: ['WebSite'] }
    ]);
});

test('bulkSetVisibility applies the three states', async () => {
    const ids = (await tools.modelDB.find({ name: { $in: ['Agari', 'Drift', 'Mailchimp'] } })).map(d => String(d._id));

    let out = await tools.bulkSetVisibility(ids, 'show');
    assert.equal(out.matched, 3);
    assert.equal(out.tools.length, 3);
    assert.ok(out.tools.every(t => t.hidden === false));

    await tools.bulkSetVisibility(ids, 'hide');
    let docs = await tools.modelDB.find({ _id: { $in: ids } }).lean();
    assert.ok(docs.every(d => d.hidden === true));

    await tools.bulkSetVisibility(ids, 'default');
    docs = await tools.modelDB.find({ _id: { $in: ids } }).lean();
    assert.ok(docs.every(d => !('hidden' in d)));
});

test('app tools are never listed or updated', async () => {
    const site = await tools.modelDB.findOne({ name: 'example.com' });
    const out = await tools.bulkSetVisibility([String(site._id)], 'hide');
    assert.equal(out.matched, 0);
    assert.deepEqual(out.tools, []);
    assert.equal((await tools.modelDB.findById(site._id).lean()).hidden, undefined);
    assert.equal((await tools.queryTools({ name: 'example' })).total, 0);
    assert.equal((await tools.queryTools({ tag: 'domain' })).total, 0);
    assert.ok(!(await tools.getCategoryCounts()).rows.some(r => r.name === 'WebSite'));
});

test('bulkSetVisibility rejects an unknown state', async () => {
    await assert.rejects(tools.bulkSetVisibility([], 'maybe'), /Invalid state/);
});

test('queryTools filters by name literally (regex metacharacters)', async () => {
    assert.deepEqual((await tools.queryTools({ name: 'c++' })).list.map(t => t.name), ['C++ Runtime']);
    assert.equal((await tools.queryTools({ name: '.*' })).total, 0);
});

test('queryTools filters by category, no-category, tag and admin setting', async () => {
    const names = async (p) => (await tools.queryTools(p)).list.map(t => t.name);
    assert.deepEqual(await names({ category: 'Email Security' }), ['Agari', 'Mailchimp']);
    assert.deepEqual(await names({ category: 'A/B Testing' }), ['C++ Runtime']);
    assert.deepEqual(await names({ category: '(No category)' }), ['NoField', 'Orphan']);
    assert.deepEqual(await names({ tag: 'mx' }), ['Agari', 'Mailchimp']);
    assert.deepEqual(await names({ setting: 'show' }), ['Mailchimp']);
    assert.deepEqual(await names({ setting: 'hide' }), ['Drift']);
    assert.equal((await tools.queryTools({ setting: 'default' })).total, 5);
    assert.deepEqual(await names({ category: 'Email Security', setting: 'default' }), ['Agari']);
});

test('setting filter: explicit null counts as Default, false as Show', async () => {
    await tools.modelDB.collection.insertOne({ name: 'Nulled', tag: 'widgets', categories: ['Scheduling'], hidden: null });
    const names = async (p) => (await tools.queryTools(p)).list.map(t => t.name);
    assert.ok((await names({ setting: 'default' })).includes('Nulled'));
    assert.ok(!(await names({ setting: 'show' })).includes('Nulled'));
    assert.deepEqual(await names({ setting: 'show' }), ['Mailchimp']);
});

test('categories stored as null count as (No category) in filters, counts and impact', async () => {
    // BuiltWith items without Categories end up stored as categories: null (Mongoose writes undefined as null).
    await tools.modelDB.collection.insertOne({ name: 'Null Cats', tag: 'widgets', categories: null });
    assert.deepEqual((await tools.queryTools({ category: '(No category)' })).list.map(t => t.name), ['NoField', 'Null Cats', 'Orphan']);
    assert.equal((await tools.getCategoryCounts()).noCategory.tools, 3);
    assert.deepEqual(await tools.getBlockImpact({ category: '(No category)' }, []), { tools: 3, alsoWhitelisted: 0 });
});

test('queryTools paginates and clamps bad numbers', async () => {
    const page = await tools.queryTools({ offset: '2', limit: '3' });
    assert.equal(page.total, 7); // example.com (domain) is excluded
    assert.deepEqual(page.list.map(t => t.name), ['Drift', 'HubSpot', 'Mailchimp']);
    const bad = await tools.queryTools({ offset: 'x', limit: '-4' });
    assert.equal(bad.offset, 0);
    assert.equal(bad.limit, 10);
});

test('getCategoryCounts counts tools per category and no-category tools', async () => {
    const out = await tools.getCategoryCounts();
    const row = out.rows.find(r => r.name === 'Marketing Automation');
    assert.equal(row.tools, 2);
    assert.deepEqual(row.examples.sort(), ['Drift', 'HubSpot']);
    assert.equal(out.noCategory.tools, 2);
    assert.ok(!out.rows.some(r => r.name === '(No category)'));
});

test('getTagCounts excludes app tags', async () => {
    const out = await tools.getTagCounts();
    assert.deepEqual(out.map(r => r.name).sort(), ['analytics', 'framework', 'mx', 'widgets']);
    assert.equal(out.find(r => r.name === 'widgets').tools, 3);
});

test('getBlockImpact counts tools that stay visible via a whitelisted category', async () => {
    assert.deepEqual(await tools.getBlockImpact({ category: 'Email Security' }, ['Marketing Automation']), { tools: 2, alsoWhitelisted: 0 });
    assert.deepEqual(await tools.getBlockImpact({ category: 'Live Chat' }, ['Marketing Automation']), { tools: 1, alsoWhitelisted: 1 });
    assert.deepEqual(await tools.getBlockImpact({ tag: 'analytics' }, ['CRM']), { tools: 1, alsoWhitelisted: 1 });
    assert.deepEqual(await tools.getBlockImpact({ tag: 'widgets' }, []), { tools: 3, alsoWhitelisted: 0 });
});

test('proceedTools registers new categories and tags without blocking', async () => {
    const categories = new CategoriesModel();
    const tags = new TagsModel();
    await categories.modelDB.deleteMany({});
    await tags.modelDB.deleteMany({});
    tools.updateInBackground = () => {}; // no logo downloads in tests

    await tools.proceedTools([
        { name: 'HubSpot', tag: 'analytics', categories: ['CRM', 'Brand New Cat'] },
        { name: 'Fresh Tool', tag: 'newtag', categories: ['Another New Cat'] },
        { name: 'site.io', tag: 'domain', categories: ['WebSite'] }
    ]);
    // registration is fire-and-forget; poll until it lands (fixed sleeps flake under a parallel suite)
    const landed = async () => (await categories.modelDB.countDocuments({})) >= 4 && (await tags.modelDB.countDocuments({})) >= 2;
    for (let i = 0; i < 50 && !(await landed()); i++) {
        await new Promise(r => setTimeout(r, 100));
    }

    const catNames = (await categories.modelDB.find({}).lean()).map(d => d.name).sort();
    assert.deepEqual(catNames, ['Another New Cat', 'Brand New Cat', 'CRM', 'WebSite']);
    assert.ok((await categories.modelDB.find({}).lean()).every(d => d.firstSeen && !d.status));
    assert.deepEqual((await tags.modelDB.find({}).lean()).map(d => d.name).sort(), ['analytics', 'newtag']);
});

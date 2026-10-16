const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { connect, disconnect } = require('./helpers/db');
const { migrate } = require('../migrate-visibility-rules');
const CategoriesModel = require('../db/models/Categories');
const TagsModel = require('../db/models/Tags');
const ToolsModel = require('../db/models/Tools');

const snapshot = {
    whitelistedCategories: ['CRM', 'Visitor Count Tracking'],
    blockedCategories: ['Fonts', 'Visitor Count Tracking', 'Email Security', 'Fonts'],
    blockedTags: ['cms', 'hosting'],
    droppedTags: ['feed'],
    hiddenToolNames: ['Facebook Signal', 'Admin Shown', 'Whitelisted Listed', 'Not In DB', 'Facebook Signal']
};
const silent = () => {};
let categories, tags, tools;

before(async () => {
    await connect('migrate');
    categories = new CategoriesModel(); tags = new TagsModel(); tools = new ToolsModel();
    await categories.modelDB.create([{ name: 'Fonts', toolsCount: 9 }, { name: 'Email Security', status: 'whitelisted' }]);
    await tools.modelDB.create([
        { name: 'Facebook Signal', tag: 'analytics', categories: ['Advertising'] },
        { name: 'Facebook Signal', tag: 'analytics', categories: ['Advertising'] },
        { name: 'Admin Shown', tag: 'cms', categories: ['Fonts'], hidden: false },
        { name: 'Whitelisted Listed', tag: 'widgets', categories: ['CRM'] },
        { name: 'Other', tag: 'feeds', categories: [] },
        { name: 'site.io', tag: 'domain', categories: ['WebSite'] }
    ]);
});
after(disconnect);

test('dry run reports and writes nothing', async () => {
    const out = await migrate({ snapshot, apply: false, log: silent });
    assert.deepEqual(out.categoryWrites.map(w => w.name + ':' + w.status).sort(),
        ['(No category):blocked', 'CRM:whitelisted', 'Fonts:blocked', 'Visitor Count Tracking:whitelisted']);
    assert.deepEqual(out.tagWrites.sort(), ['cms', 'hosting']);
    assert.deepEqual(out.tagRegistrations.sort(), ['analytics', 'feeds', 'widgets']);
    assert.deepEqual(out.unmatched, ['Not In DB']);
    assert.deepEqual(out.skippedShow, ['Admin Shown']);
    assert.deepEqual(out.inWhitelisted, ['Whitelisted Listed']);
    assert.equal(await categories.modelDB.countDocuments({ status: { $exists: true } }), 1);
    assert.equal(await tags.modelDB.countDocuments({}), 0);
    assert.equal(await tools.modelDB.countDocuments({ hidden: true }), 0);
});

test('apply writes, never overwrites an admin status, skips Show tools', async () => {
    const out = await migrate({ snapshot, apply: true, log: silent });
    const rules = await categories.getRules();
    assert.deepEqual(rules.whitelisted, ['CRM', 'Email Security', 'Visitor Count Tracking']);
    assert.deepEqual(rules.blocked, ['(No category)', 'Fonts']);
    assert.equal((await categories.modelDB.findOne({ name: 'Fonts' }).lean()).toolsCount, 9);
    assert.deepEqual(await tags.getBlocked(), ['cms', 'hosting']);
    assert.ok((await tags.modelDB.find({ name: { $in: ['analytics', 'feeds', 'widgets'] } }).lean()).every(d => !d.status && !d.firstSeen));
    assert.equal(await tools.modelDB.countDocuments({ name: 'Facebook Signal', hidden: true }), 2);
    assert.equal(await tools.modelDB.countDocuments({ name: 'Whitelisted Listed', hidden: true }), 1);
    assert.equal((await tools.modelDB.findOne({ name: 'Admin Shown' }).lean()).hidden, false); // Show kept
    assert.deepEqual(out.verify.actual, { blockedCategories: 1, whitelistedCategories: 3, blockedTags: 2 });
});

test('rerun is a no-op', async () => {
    const out = await migrate({ snapshot, apply: true, log: silent });
    assert.equal(out.categoryWrites.length, 0);
    assert.equal(out.tagWrites.length, 0);
    assert.equal(out.tagRegistrations.length, 0);
    assert.equal(out.toHide.length, 0);
    assert.equal(await tags.modelDB.countDocuments({}), 5);
});

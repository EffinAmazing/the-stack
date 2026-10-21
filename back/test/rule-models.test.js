const { test, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const { connect, disconnect } = require('./helpers/db');
const CategoriesModel = require('../db/models/Categories');
const TagsModel = require('../db/models/Tags');

let categories, tags;
before(async () => { await connect('rule_models'); categories = new CategoriesModel(); tags = new TagsModel(); });
after(disconnect);
beforeEach(async () => { await categories.modelDB.deleteMany({}); await tags.modelDB.deleteMany({}); });

test('setStatus upserts, updates every duplicate, and clears', async () => {
    await categories.modelDB.create([{ name: 'Fonts', toolsCount: 3 }, { name: 'Fonts' }]);
    await categories.setStatus('Fonts', 'blocked');
    await categories.setStatus('Email Security', 'blocked');
    assert.deepEqual(await categories.getRules(), { whitelisted: [], blocked: ['Email Security', 'Fonts'] });
    const fonts = await categories.modelDB.find({ name: 'Fonts' }).lean();
    assert.equal(fonts.length, 2);
    assert.ok(fonts.every(d => d.status === 'blocked'));
    assert.equal(fonts.find(d => d.toolsCount === 3).toolsCount, 3); // existing fields untouched

    await categories.setStatus('Fonts', null);
    assert.equal(await categories.modelDB.countDocuments({ name: 'Fonts', status: { $exists: true } }), 0);
    assert.equal(await categories.modelDB.countDocuments({ name: 'Fonts' }), 2);
});

test('setStatus(null) on an unknown name does not insert', async () => {
    await categories.setStatus('Nope', null);
    assert.equal(await categories.modelDB.countDocuments({}), 0);
});

test('setStatus rejects unknown statuses', async () => {
    await assert.rejects(categories.setStatus('Fonts', 'hidden'), /Invalid status/);
    await assert.rejects(tags.setStatus('cms', 'whitelisted'), /Invalid status/);
});

test('registerSeen inserts only new names with firstSeen and never touches existing docs', async () => {
    await categories.modelDB.create({ name: 'Old', toolsCount: 5 });
    await categories.setStatus('Blocked One', 'blocked');
    const now = new Date('2026-10-16T12:00:00Z');
    await categories.registerSeen(['Old', 'Blocked One', 'Brand New', 'Brand New', '', null], now);

    const docs = await categories.modelDB.find({}).lean();
    assert.equal(docs.length, 3);
    const byName = Object.fromEntries(docs.map(d => [d.name, d]));
    assert.equal(byName['Old'].firstSeen, undefined);
    assert.equal(byName['Blocked One'].status, 'blocked');
    assert.equal(byName['Blocked One'].firstSeen, undefined);
    assert.equal(byName['Brand New'].firstSeen.toISOString(), now.toISOString());
    assert.equal(byName['Brand New'].status, undefined);
});

test('getMeta merges duplicates (status wins, earliest firstSeen)', async () => {
    await categories.modelDB.create([
        { name: 'Dup', firstSeen: new Date('2026-10-10') },
        { name: 'Dup', status: 'whitelisted', firstSeen: new Date('2026-10-01') }
    ]);
    const meta = await categories.getMeta();
    assert.equal(meta.get('Dup').status, 'whitelisted');
    assert.equal(meta.get('Dup').firstSeen.toISOString(), new Date('2026-10-01').toISOString());
});

test('tags: block-only, app tags never registered', async () => {
    await tags.registerSeen(['cms', 'domain', 'customApp', 'custom', '', 'feeds']);
    assert.deepEqual((await tags.modelDB.find({}).lean()).map(d => d.name).sort(), ['cms', 'feeds']);
    await tags.setStatus('cms', 'blocked');
    assert.deepEqual(await tags.getBlocked(), ['cms']);
});

test('tag and category names do not collide', async () => {
    await categories.setStatus('mobile', 'blocked');
    assert.deepEqual(await tags.getBlocked(), []);
});

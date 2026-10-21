const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { connect, disconnect } = require('./helpers/db');
const { fakeRes } = require('./helpers/http');
const VisibilityController = require('../core/controllers/visibility-rules');

let c;
before(async () => {
    await connect('visibility_controller');
    c = new VisibilityController();
    await c.tools.modelDB.create([
        { name: 'Agari', tag: 'mx', categories: ['Email Security'] },
        { name: 'Klaviyo', tag: 'mx', categories: ['Email Security', 'Marketing Automation'] },
        { name: 'Orphan', tag: 'widgets', categories: [] },
        { name: 'site.io', tag: 'domain', categories: ['WebSite'] }
    ]);
});
after(disconnect);

const call = async (method, req) => { const res = fakeRes(); await c[method](Object.assign({ query: {}, body: {} }, req), res); return res; };

test('set and list category statuses', async () => {
    assert.equal((await call('setCategoryStatus', { body: { name: 'Marketing Automation', status: 'whitelisted' } })).body.result, 'Ok');
    await call('setCategoryStatus', { body: { name: '(No category)', status: 'blocked' } });

    const res = await call('getCategories', { query: { status: 'all' } });
    const r = res.body.result;
    assert.deepEqual(r.list.map(x => [x.name, x.tools, x.status]), [
        ['Email Security', 2, 'normal'], ['Marketing Automation', 1, 'whitelisted']
    ]); // site.io (domain) is not counted, so WebSite isn't listed
    assert.deepEqual(r.noCategory, { name: '(No category)', tools: 1, examples: ['Orphan'], status: 'blocked', isNew: false });
    assert.equal(r.counts.whitelisted, 1);
});

test('category status validation', async () => {
    for (const body of [{ name: '', status: 'blocked' }, { name: 'X', status: 'hidden' }, { name: 'x'.repeat(201), status: 'blocked' }, { name: ['X'], status: 'blocked' }, { status: 'blocked' }]) {
        assert.equal((await call('setCategoryStatus', { body })).statusCode, 400);
    }
    assert.equal((await call('setCategoryStatus', { body: { name: 'Email Security', status: null } })).statusCode, 200);
});

test('tags: block-only, app tags rejected, listed without app tags', async () => {
    assert.equal((await call('setTagStatus', { body: { name: 'mx', status: 'whitelisted' } })).statusCode, 400);
    assert.equal((await call('setTagStatus', { body: { name: 'domain', status: 'blocked' } })).statusCode, 400);
    assert.equal((await call('setTagStatus', { body: { name: 'mx', status: 'blocked' } })).statusCode, 200);
    const r = (await call('getTags', {})).body.result;
    assert.deepEqual(r.list.map(x => [x.name, x.status]), [['mx', 'blocked'], ['widgets', 'normal']]);
    assert.deepEqual(r.counts, { all: 2, new: 0, blocked: 1, normal: 1 });
});

test('block impact', async () => {
    let res = await call('getBlockImpact', { query: { category: 'Email Security' } });
    assert.deepEqual(res.body.result, { tools: 2, alsoWhitelisted: 1 });
    res = await call('getBlockImpact', { query: { tag: 'mx' } });
    assert.deepEqual(res.body.result, { tools: 2, alsoWhitelisted: 1 });
    res = await call('getBlockImpact', { query: {} });
    assert.equal(res.statusCode, 400);
});

const { test } = require('node:test');
const assert = require('node:assert/strict');
const ToolsController = require('../core/controllers/tools');
const { fakeRes } = require('./helpers/http');

const validId = '5f2b6c7d8e9fa0b1c2d3e4f5';

function controllerWithFakeModel() {
    const c = new ToolsController();
    c.calls = [];
    c.model = {
        bulkSetVisibility: async (ids, state) => {
            c.calls.push([ids, state]);
            const hidden = state === 'default' ? undefined : state === 'hide';
            return { matched: ids.length, modified: ids.length, tools: ids.map(id => ({ id, categories: ['CRM'], hidden })) };
        }
    };
    c.categories = { getRules: async () => ({ whitelisted: ['CRM'], blocked: [] }) };
    c.tags = { getBlocked: async () => [] };
    return c;
}

const bad = [
    ['ids missing', { state: 'hide' }],
    ['ids not array', { ids: validId, state: 'hide' }],
    ['ids empty', { ids: [], state: 'hide' }],
    ['ids too many', { ids: Array(501).fill(validId), state: 'hide' }],
    ['invalid ObjectId', { ids: [validId, 'nope'], state: 'hide' }],
    ['non-string id', { ids: [{ $gt: '' }], state: 'hide' }],
    ['unknown state', { ids: [validId], state: 'maybe' }]
];

for (const [name, body] of bad) {
    test('bulkSetVisibility 400: ' + name, async () => {
        const c = controllerWithFakeModel();
        const res = fakeRes();
        await c.bulkSetVisibility({ body, user: { role: 0 } }, res);
        assert.equal(res.statusCode, 400);
        assert.equal(c.calls.length, 0);
    });
}

test('bulkSetVisibility de-duplicates ids and writes once', async () => {
    const c = controllerWithFakeModel();
    const res = fakeRes();
    await c.bulkSetVisibility({ body: { ids: [validId, validId], state: 'show' }, user: { role: 0 } }, res);
    assert.equal(res.statusCode, 200);
    assert.deepEqual(c.calls, [[[validId], 'show']]);
    assert.equal(res.body.result.matched, 1);
    assert.deepEqual(res.body.result.tools[0].result, { state: 'show', reason: 'admin-show' });
});

test('bulkSetVisibility default: result comes from category rules', async () => {
    const c = controllerWithFakeModel();
    const res = fakeRes();
    await c.bulkSetVisibility({ body: { ids: [validId], state: 'default' }, user: { role: 0 } }, res);
    assert.deepEqual(res.body.result.tools[0].result, { state: 'show', reason: 'whitelisted', detail: 'CRM' });
});

test('updateVisibility maps flag to hide/show and returns the tool', async () => {
    const c = controllerWithFakeModel();
    let res = fakeRes();
    await c.updateVisibility({ params: { id: validId }, body: { node: { tool: { id: validId } }, flag: true } }, res);
    assert.deepEqual(c.calls[0], [[validId], 'hide']);
    assert.equal(res.body.result.id, validId);
    assert.equal(res.body.result.hidden, true);

    res = fakeRes();
    await c.updateVisibility({ params: { id: validId }, body: { node: { tool: { id: validId } }, flag: false } }, res);
    assert.deepEqual(c.calls[1], [[validId], 'show']);
    assert.equal(res.body.result.hidden, false);
});

function controllerWithFakeCreate() {
    const c = new ToolsController();
    c.created = [];
    c.model = {
        createOne: async (data, icon) => {
            c.created.push([data, icon]);
            return Object.assign({ id: validId, logo: '/tools-logos/' + validId + '.png' }, data, { tag: 'custom' });
        }
    };
    return c;
}

for (const [name, body] of [
    ['tool missing', {}],
    ['name missing', { tool: { categories: 'CRM' } }],
    ['name blank', { tool: { name: '   ' } }],
    ['name not a string', { tool: { name: ['a'] } }]
]) {
    test('createTool 400: ' + name, async () => {
        const c = controllerWithFakeCreate();
        const res = fakeRes();
        await c.createTool({ body, files: {} }, res);
        assert.equal(res.statusCode, 400);
        assert.equal(c.created.length, 0);
    });
}

test('createTool saves only tool fields and passes the icon', async () => {
    const c = controllerWithFakeCreate();
    const res = fakeRes();
    const icon = { path: '/tmp/icon.png' };
    await c.createTool({
        body: { tool: { name: ' SalesMSG ', categories: 'CRM,Live Chat', description: 'd', link: 'https://salesmsg.com', hidden: true, tag: 'analytics' } },
        files: { icon }
    }, res);
    assert.equal(res.statusCode, 200);
    assert.deepEqual(c.created, [[{ name: 'SalesMSG', categories: 'CRM,Live Chat', description: 'd', link: 'https://salesmsg.com' }, icon]]);
    assert.equal(res.body.result.name, 'SalesMSG');
    assert.equal(res.body.result.tag, 'custom');
});

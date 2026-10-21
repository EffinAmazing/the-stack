const { test } = require('node:test');
const assert = require('node:assert/strict');
const BluePrints = require('../core/controllers/blueprints');
const ToolsNodes = require('../core/controllers/toolsnodes');
const { fakeRes } = require('./helpers/http');

function respond(handler, req) {
    return new Promise((resolve) => {
        const res = fakeRes();
        const json = res.json;
        res.json = (body) => { json(body); resolve(res); return res; };
        handler(req, res);
    });
}

test('blueprints/tools rejects a missing or non-string domain with 400', async () => {
    const ctl = new BluePrints();
    for (const req of [{ query: { domain: {} }, body: {} }, { query: { domain: ['a.com'] }, body: {} }, { query: {}, body: {} }]) {
        const res = await respond(ctl.getDomainTools.bind(ctl), req);
        assert.equal(res.statusCode, 400);
        assert.deepEqual(res.body, { result: 'Error', message: 'Bad Request' });
    }
});

test('tools/categories rejects a non-string name and still accepts strings', async () => {
    const ctl = new ToolsNodes();
    const names = [];
    ctl.categories = { getList: (name) => { names.push(name); return Promise.resolve({ list: [] }); } };
    const handler = ctl.getListOfCategories.bind(ctl);

    let res = await respond(handler, { query: { name: {} } });
    assert.equal(res.statusCode, 400);
    res = await respond(handler, { query: {} });
    assert.equal(res.statusCode, 400);

    res = await respond(handler, { query: { name: '' } });
    assert.equal(res.statusCode, 200);
    res = await respond(handler, { query: { name: 'analytics' } });
    assert.equal(res.statusCode, 200);
    assert.deepEqual(names, ['', 'analytics']);
});

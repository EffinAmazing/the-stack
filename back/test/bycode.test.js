const { test } = require('node:test');
const assert = require('node:assert/strict');
const Users = require('../core/controllers/users');
const { fakeRes } = require('./helpers/http');

// Resolves once the controller has sent its response.
function call(users, query) {
    return new Promise((resolve) => {
        const res = fakeRes();
        const json = res.json;
        res.json = (body) => { json(body); resolve(res); return res; };
        users.getUserByCode({ query: query }, res);
    });
}

function withUser(doc) {
    const users = new Users();
    users.lookups = [];
    users.model = { getByCode: (code) => { users.lookups.push(code); return Promise.resolve(doc); } };
    return users;
}

test('returns only _id and email for a known code', async () => {
    const users = withUser({
        _id: 'id1', email: 'a@b.co', username: 'a@b.co', role: 1, verified: false,
        validationCode: 'abc123', password: '$2b$12$hash', __v: 0
    });
    const res = await call(users, { code: 'abc123' });
    assert.equal(res.statusCode, 200);
    assert.deepEqual(res.body, { result: { _id: 'id1', email: 'a@b.co' } });
    assert.deepEqual(users.lookups, ['abc123']);
});

test('unknown code still returns { result: null }', async () => {
    const res = await call(withUser(null), { code: 'BB_TEST_NONEXISTENT' });
    assert.equal(res.statusCode, 200);
    assert.deepEqual(res.body, { result: null });
});

test('non-string or missing code is a 400 and never queries', async () => {
    for (const query of [{ code: { $ne: 'x' } }, { code: {} }, { code: ['a', 'b'] }, { code: '' }, {}]) {
        const users = withUser({ _id: 'id1', email: 'a@b.co' });
        const res = await call(users, query);
        assert.equal(res.statusCode, 400);
        assert.deepEqual(users.lookups, []);
    }
});

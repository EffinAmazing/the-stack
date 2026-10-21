const { test } = require('node:test');
const assert = require('node:assert/strict');
const { sanitizeSignupData } = require('../services/user-update');
const Users = require('../core/controllers/users');
const { fakeRes } = require('./helpers/http');

const form = { email: 'a@b.co', firstName: 'A', lastName: 'B', password: 'secret123' };

// Resolves once the controller has sent its response (they respond inside .then/.catch).
function call(handler, req) {
    return new Promise((resolve) => {
        const res = fakeRes();
        const json = res.json;
        res.json = (body) => { json(body); resolve(res); return res; };
        handler(req, res);
    });
}

test('sanitizeSignupData keeps the four form fields and drops the rest', () => {
    const out = sanitizeSignupData(Object.assign({}, form, {
        repeatPassword: 'secret123', role: 0, verified: true, validationCode: 'x', username: 'admin'
    }));
    assert.deepEqual(out, { data: form });
});

test('sanitizeSignupData rejects non-object data and non-string form fields', () => {
    assert.ok(sanitizeSignupData(undefined).error);
    assert.ok(sanitizeSignupData('x').error);
    assert.ok(sanitizeSignupData([form]).error);
    assert.ok(sanitizeSignupData(Object.assign({}, form, { password: {} })).error);
    assert.ok(sanitizeSignupData(Object.assign({}, form, { email: ['a@b.co'] })).error);
});

test('signup ignores role and returns only safe fields', async () => {
    const users = new Users();
    let saved;
    users.model = { create: (data) => { saved = data; return Promise.resolve(Object.assign({
        _id: 'id1', role: 1, password: '$2b$12$hash', validationCode: 'abcd', __v: 0
    }, data)); } };

    const res = await call(users.signup.bind(users), {
        body: { data: Object.assign({}, form, { role: 0, repeatPassword: 'secret123' }) }
    });

    assert.deepEqual(saved, form);
    assert.equal(res.statusCode, 200);
    assert.deepEqual(res.body, { result: { _id: 'id1', email: 'a@b.co', firstName: 'A', lastName: 'B' } });
});

test('signup without data is a 400', async () => {
    const users = new Users();
    users.model = { create: () => { throw new Error('should not be called'); } };
    const res = await call(users.signup.bind(users), { body: {} });
    assert.equal(res.statusCode, 400);
});

test('complete passes only form fields and requires a string code', async () => {
    const users = new Users();
    const calls = [];
    users.model = { complete: (id, code, data) => { calls.push({ id, code, data }); return Promise.resolve({ n: 1 }); } };
    const handler = users.completeRegistration.bind(users);

    let res = await call(handler, { params: { id: 'id1' }, body: { code: 'abc123', data: Object.assign({}, form, { role: 0 }) } });
    assert.equal(res.statusCode, 200);
    assert.deepEqual(calls, [{ id: 'id1', code: 'abc123', data: form }]);

    res = await call(handler, { params: { id: 'id1' }, body: { code: {}, data: form } });
    assert.equal(res.statusCode, 400);
    res = await call(handler, { params: { id: 'id1' }, body: { data: form } });
    assert.equal(res.statusCode, 400);
    assert.equal(calls.length, 1);
});

test('UserModel.complete marks verified and clears the code', async () => {
    const UserModel = require('../db/models/Users');
    const model = new UserModel();
    let filter, update;
    model.modelDB = { updateOne: (f, u) => { filter = f; update = u; return { exec: () => Promise.resolve({ n: 1 }) }; } };

    await model.complete('id1', 'abc123', { email: 'a@b.co', password: 'p' });

    assert.deepEqual(filter, { _id: 'id1', verified: false, validationCode: 'abc123' });
    assert.deepEqual(update, { email: 'a@b.co', password: 'p', verified: true, validationCode: '' });
});

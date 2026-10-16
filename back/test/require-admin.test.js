const { test } = require('node:test');
const assert = require('node:assert/strict');
const requireAdmin = require('../core/middleware/require-admin');
const { fakeRes } = require('./helpers/http');

test('401 when no user is attached', () => {
    const res = fakeRes();
    let called = false;
    requireAdmin({}, res, () => { called = true; });
    assert.equal(res.statusCode, 401);
    assert.equal(called, false);
});

test('403 for a non-admin user', () => {
    const res = fakeRes();
    let called = false;
    requireAdmin({ user: { role: 1 } }, res, () => { called = true; });
    assert.equal(res.statusCode, 403);
    assert.deepEqual(res.body, { result: 'Error', message: 'Forbidden' });
    assert.equal(called, false);
});

test('403 when role is missing or a string', () => {
    for (const user of [{}, { role: '0' }, { role: null }]) {
        const res = fakeRes();
        requireAdmin({ user }, res, () => assert.fail('next called'));
        assert.equal(res.statusCode, 403);
    }
});

test('calls next for an admin', () => {
    const res = fakeRes();
    let called = false;
    requireAdmin({ user: { role: 0 } }, res, () => { called = true; });
    assert.equal(called, true);
    assert.equal(res.body, undefined);
});

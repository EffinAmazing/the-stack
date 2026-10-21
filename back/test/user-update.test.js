const { test } = require('node:test');
const assert = require('node:assert/strict');
const { sanitizeUserUpdate } = require('../services/user-update');

const admin = 'aaaaaaaaaaaaaaaaaaaaaaaa';
const other = 'bbbbbbbbbbbbbbbbbbbbbbbb';

test('keeps only editable fields', () => {
    const out = sanitizeUserUpdate({
        email: 'a@b.co', firstName: 'A', lastName: 'B', role: 1, verified: true,
        password: 'x', validationCode: 'y', _id: 'z', created: 'now'
    }, admin, other);
    assert.deepEqual(out, { data: { email: 'a@b.co', firstName: 'A', lastName: 'B', role: 1, verified: true } });
});

test('rejects non-object data', () => {
    assert.ok(sanitizeUserUpdate(null, admin, other).error);
    assert.ok(sanitizeUserUpdate('role=0', admin, other).error);
});

test('rejects invalid role and verified values', () => {
    assert.ok(sanitizeUserUpdate({ role: 2 }, admin, other).error);
    assert.ok(sanitizeUserUpdate({ role: '0' }, admin, other).error);
    assert.ok(sanitizeUserUpdate({ verified: 'yes' }, admin, other).error);
});

test('an admin cannot remove their own admin role', () => {
    const out = sanitizeUserUpdate({ role: 1 }, admin, admin);
    assert.equal(out.error, 'You cannot remove your own administrator role');
});

test('an admin can save their own profile with role 0 unchanged', () => {
    assert.deepEqual(sanitizeUserUpdate({ firstName: 'Me', role: 0 }, admin, admin), { data: { firstName: 'Me', role: 0 } });
});

test('ObjectId-like editor ids are compared as strings', () => {
    const editorId = { toString: () => admin };
    assert.ok(sanitizeUserUpdate({ role: 1 }, editorId, admin).error);
});

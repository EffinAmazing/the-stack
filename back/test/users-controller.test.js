const { test } = require('node:test');
const assert = require('node:assert/strict');
const UsersController = require('../core/controllers/users');
const { fakeRes } = require('./helpers/http');

const adminId = 'aaaaaaaaaaaaaaaaaaaaaaaa';
const otherId = 'bbbbbbbbbbbbbbbbbbbbbbbb';

function controllerWithFakeModel() {
    const c = new UsersController();
    c.deleted = [];
    c.model = { delete: async (id) => { c.deleted.push(id); return true; } };
    return c;
}

test('an admin cannot delete their own account', async () => {
    const c = controllerWithFakeModel();
    const res = fakeRes();
    await c.delete({ params: { id: adminId }, user: { _id: { toString: () => adminId }, role: 0 } }, res);
    assert.equal(res.statusCode, 400);
    assert.deepEqual(c.deleted, []);
});

test('an admin can delete another user', async () => {
    const c = controllerWithFakeModel();
    const res = fakeRes();
    c.delete({ params: { id: otherId }, user: { _id: adminId, role: 0 } }, res);
    await new Promise(r => setImmediate(r));
    assert.deepEqual(c.deleted, [otherId]);
    assert.deepEqual(res.body, { result: 'Ok' });
});

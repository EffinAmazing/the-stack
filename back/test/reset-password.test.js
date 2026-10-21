const { test } = require('node:test');
const assert = require('node:assert/strict');
const emailService = require('../services/email');
const UserModel = require('../db/models/Users');

const user = { _id: 'id1', email: 'a@b.co', verified: true };

function modelWith(found) {
    const model = new UserModel();
    model.finds = [];
    model.updates = [];
    model.modelDB = {
        findOne: (filter) => {
            model.finds.push(filter);
            const result = Promise.resolve(found);
            result.exec = () => result;
            return result;
        },
        updateOne: (filter, update) => { model.updates.push({ filter, update }); return { exec: () => Promise.resolve({ n: 1 }) }; }
    };
    return model;
}

test('sendResetPass stores and emails a 32-character hex code', async () => {
    const original = emailService.sendResetPassword;
    let emailed;
    emailService.sendResetPassword = (email, u, url, code) => { emailed = code; return Promise.resolve(); };
    try {
        const model = modelWith(user);
        assert.equal(await model.sendResetPass('a@b.co', 'https://mcgaw.io/app/'), true);
        assert.match(emailed, /^[0-9a-f]{32}$/);
        assert.deepEqual(model.updates, [{ filter: { _id: 'id1' }, update: { validationCode: emailed } }]);
    } finally {
        emailService.sendResetPassword = original;
    }
});

test('resetPassword rejects old short codes and non-strings without querying', async () => {
    const model = modelWith(user);
    for (const code of ['ab12', 'm1x2y3z4', '', {}, ['a'.repeat(32)], 'a'.repeat(31), 'a'.repeat(33)]) {
        await assert.rejects(model.resetPassword(code, 'newpass123'), { message: 'User with this email is not found!' });
    }
    await assert.rejects(model.resetPassword('a'.repeat(32), { $ne: null }));
    assert.deepEqual(model.finds, []);
    assert.deepEqual(model.updates, []);
});

test('resetPassword with a valid code sets the password and clears the code', async () => {
    const model = modelWith(user);
    const code = 'f'.repeat(32);
    assert.equal(await model.resetPassword(code, 'newpass123'), true);
    assert.deepEqual(model.finds, [{ verified: true, validationCode: code }]);
    assert.deepEqual(model.updates, [{ filter: { _id: 'id1' }, update: { password: 'newpass123', validationCode: '' } }]);
});

test('resetPassword with an unknown 32-character code fails', async () => {
    const model = modelWith(null);
    await assert.rejects(model.resetPassword('0'.repeat(32), 'newpass123'), { message: 'User with this email is not found!' });
    assert.deepEqual(model.updates, []);
});

test('forgot-password with an unknown email responds 500 instead of crashing', async () => {
    const Users = require('../core/controllers/users');
    const { UserModelError } = require('../services/custom-errors');
    const { fakeRes } = require('./helpers/http');
    const users = new Users();
    users.model = { sendResetPass: () => Promise.reject(new UserModelError('User with this email is not found!', { type: 'UserNotFound' })) };
    const res = await new Promise((resolve) => {
        const r = fakeRes();
        const json = r.json;
        r.json = (body) => { json(body); resolve(r); return r; };
        users.sendResetPass({ body: { email: 'nobody@example.com', url: 'x' } }, r);
    });
    assert.equal(res.statusCode, 500);
    assert.deepEqual(res.body, { result: 'Error', type: 'UserNotFound', message: 'User with this email is not found!' });
});

const { test } = require('node:test');
const assert = require('node:assert/strict');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const jwt = require('jsonwebtoken');
const Users = require('../core/controllers/users');
const UserModel = require('../db/models/Users');
const { fakeRes } = require('./helpers/http');

const stored = {
    _id: 'aaaaaaaaaaaaaaaaaaaaaaaa', email: 'a@b.co', username: 'a@b.co', firstName: 'A', lastName: 'B',
    role: 0, verified: true, avatar: 'x.png', created: '2020-01-01T00:00:00.000Z',
    password: '$2b$12$hash', validationCode: 'abcd', __v: 0
};

function signin(body) {
    passport.use(new LocalStrategy((username, password, done) => {
        done(null, { _id: stored._id, toJSON: () => Object.assign({}, stored) });
    }));
    return new Promise((resolve) => {
        const res = fakeRes();
        const json = res.json;
        res.json = (out) => { json(out); resolve(res); return res; };
        const req = { body: body, query: {}, login: (user, opts, cb) => cb() };
        new Users().signin(req, res, () => {});
    });
}

test('signin response user has no password, validationCode or __v; other fields kept', async () => {
    const res = await signin({ username: 'a@b.co', password: 'secret123' });
    const user = res.body.result.user;
    const expected = Object.assign({}, stored);
    delete expected.password;
    delete expected.validationCode;
    delete expected.__v;
    assert.deepEqual(user, expected);
});

test('signin token carries only _id', async () => {
    const res = await signin({ username: 'a@b.co', password: 'secret123' });
    const payload = jwt.decode(res.body.result.token);
    delete payload.iat;
    assert.deepEqual(payload, { _id: stored._id });
});

test('checkCredantial rejects non-string username or password without querying', async () => {
    const model = new UserModel();
    let queried = false;
    model.modelDB = { findOne: () => { queried = true; return Promise.resolve(null); } };
    assert.equal(await model.checkCredantial({}, 'p'), false);
    assert.equal(await model.checkCredantial('a@b.co', { $ne: null }), false);
    assert.equal(await model.checkCredantial(['a@b.co'], 'p'), false);
    assert.equal(queried, false);
});

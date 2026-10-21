const { test } = require('node:test');
const assert = require('node:assert/strict');
const BluePrints = require('../core/controllers/blueprints');
const { fakeRes } = require('./helpers/http');

const OWNER = 'aaaaaaaaaaaaaaaaaaaaaaaa';
const INVITED = 'bbbbbbbbbbbbbbbbbbbbbbbb';
const STRANGER = 'cccccccccccccccccccccccc';
const ADMIN = 'dddddddddddddddddddddddd';

function controller(blueprint, options) {
    options = options || {};
    const ctl = new BluePrints();
    ctl.removed = [];
    const track = (name) => () => { ctl.removed.push(name); return Promise.resolve(); };
    ctl._bluePrints = {
        one: () => blueprint ? Promise.resolve(blueprint) : Promise.reject(new TypeError('not found')),
        delete: options.deleteFails ? () => Promise.reject(new Error('db down')) : track('blueprint')
    };
    ctl._bluePrintsAccess = {
        hasUserAccess: (userId) => Promise.resolve(String(userId) === INVITED ? 'Full' : false),
        removeAllByBlueprintId: track('access')
    };
    ctl._arrows = { removeAllByBlueprintId: track('arrows') };
    ctl._toolsNodes = { removeAllForBlueprintId: track('nodes') };
    return ctl;
}

function remove(ctl, userId, role) {
    return new Promise((resolve) => {
        const res = fakeRes();
        const json = res.json;
        res.json = (body) => { json(body); resolve(res); return res; };
        ctl.removeBluePrint({ params: { id: 'bp1' }, user: { _id: userId, role: role } }, res);
    });
}

const owned = { id: 'bp1', userId: OWNER, domain: 'example.com' };
const unowned = { id: 'bp1', domain: 'example.com' };
const everything = ['arrows', 'nodes', 'access', 'blueprint'];

test('owner, invited user and admin can delete', async () => {
    for (const [userId, role, bp] of [[OWNER, 1, owned], [INVITED, 1, owned], [ADMIN, 0, owned], [ADMIN, 0, unowned]]) {
        const ctl = controller(bp);
        const res = await remove(ctl, userId, role);
        assert.equal(res.statusCode, 200);
        assert.deepEqual(res.body, { result: 'Ok' });
        assert.deepEqual(ctl.removed, everything);
    }
});

test('other users get 403 and nothing is removed', async () => {
    for (const bp of [owned, unowned, null]) {
        const ctl = controller(bp);
        const res = await remove(ctl, STRANGER, 1);
        assert.equal(res.statusCode, 403);
        assert.deepEqual(ctl.removed, []);
    }
});

test('a failing delete responds 500 instead of throwing', async () => {
    const ctl = controller(owned, { deleteFails: true });
    const res = await remove(ctl, OWNER, 1);
    assert.equal(res.statusCode, 500);
    assert.deepEqual(res.body, { result: 'Error', message: 'db down' });
});

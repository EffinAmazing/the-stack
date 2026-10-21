const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const stripMongoOperators = require('../core/middleware/strip-mongo-operators');

function run(req) {
    let called = false;
    stripMongoOperators(req, {}, () => { called = true; });
    assert.equal(called, true);
    return req;
}

test('removes $ keys from query and body, nested and in arrays', () => {
    const req = run({
        query: { code: { $ne: 'x' }, offset: '0' },
        body: { code: { $gt: '' }, data: { email: 'a@b.c', role: { $exists: true } }, ids: [{ $where: '1' }, 'id1'] }
    });
    assert.deepEqual(req.query, { code: {}, offset: '0' });
    assert.deepEqual(req.body, { code: {}, data: { email: 'a@b.c', role: {} }, ids: [{}, 'id1'] });
});

test('leaves normal values, dotted keys and bracket keys alone', () => {
    const req = run({
        query: { domain: 'example.com', name: '$weird value' },
        body: { 'tool[name]': 'Acme', 'a.b': 1, n: null, flag: false, list: ['x', 2] }
    });
    assert.deepEqual(req.query, { domain: 'example.com', name: '$weird value' });
    assert.deepEqual(req.body, { 'tool[name]': 'Acme', 'a.b': 1, n: null, flag: false, list: ['x', 2] });
});

test('does not walk into non-plain objects such as upload streams', () => {
    const stream = fs.createReadStream(__filename);
    stream.$marker = 'kept';
    const req = run({ query: {}, body: { file: stream } });
    assert.equal(req.body.file, stream);
    assert.equal(stream.$marker, 'kept');
    stream.destroy();
});

test('handles missing query or body', () => {
    run({});
    run({ query: undefined, body: 'text' });
});

test('strips operators from a real Express query string and JSON body', async () => {
    const app = express();
    app.use(bodyParser.json());
    app.use(stripMongoOperators);
    app.all('/echo', (req, res) => res.json({ query: req.query, body: req.body }));
    const server = app.listen(0);
    const base = 'http://127.0.0.1:' + server.address().port;
    try {
        let res = await fetch(base + '/echo?code%5B%24ne%5D=x&ok=1');
        assert.deepEqual((await res.json()).query, { code: {}, ok: '1' });

        res = await fetch(base + '/echo', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: { $ne: null }, password: 'p' })
        });
        assert.deepEqual((await res.json()).body, { username: {}, password: 'p' });
    } finally {
        server.close();
    }
});

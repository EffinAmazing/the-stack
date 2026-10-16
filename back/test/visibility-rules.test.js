const { test } = require('node:test');
const assert = require('node:assert/strict');
const fixture = require('./fixtures/visibility-decisions.json');
const rules = require('../services/visibility-rules');

for (const c of fixture.cases) {
    test('decideTool: ' + c.name, () => {
        const out = rules.decideTool(c.tool, fixture.rules, !!c.stale);
        const expected = Object.assign({ detail: undefined }, c.expected);
        assert.deepEqual({ state: out.state, reason: out.reason, detail: out.detail }, expected);
    });
}

test('isStale: older than 90 days only', () => {
    const now = Date.parse('2026-10-16T00:00:00Z');
    assert.equal(rules.isStale(null, now), false);
    assert.equal(rules.isStale('not a date', now), false);
    assert.equal(rules.isStale('2026-07-18T00:00:00Z', now), false); // 90 days
    assert.equal(rules.isStale('2026-07-17T00:00:00Z', now), true);
});

test('loadRules returns DB rules as-is, even when empty', async () => {
    const categories = { getRules: async () => ({ whitelisted: ['CRM'], blocked: [] }) };
    const tags = { getBlocked: async () => ['cms'] };
    assert.deepEqual(await rules.loadRules(categories, tags), { whitelisted: ['CRM'], blocked: [], blockedTags: ['cms'] });

    const none = { getRules: async () => ({ whitelisted: [], blocked: [] }) };
    assert.deepEqual(await rules.loadRules(none, { getBlocked: async () => [] }), { whitelisted: [], blocked: [], blockedTags: [] });
});

test('loadRules propagates DB errors (no hardcoded fallback)', async () => {
    const broken = { getRules: async () => { throw new Error('down'); } };
    await assert.rejects(rules.loadRules(broken, { getBlocked: async () => [] }), /down/);
});

test('escapeRegex makes names literal', () => {
    const re = new RegExp(rules.escapeRegex('(No category) C++ A/B Node.js'));
    assert.ok(re.test('(No category) C++ A/B Node.js'));
    assert.ok(!re.test('No category CC A/B NodeXjs'));
});

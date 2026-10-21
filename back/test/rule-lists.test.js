const { test } = require('node:test');
const assert = require('node:assert/strict');
const { buildRuleList } = require('../services/rule-lists');

const now = new Date('2026-10-16T00:00:00Z');
const rows = [
    { name: 'Analytics', tools: 41, examples: ['GA'] },
    { name: 'Email Security', tools: 21, examples: ['Agari'] },
    { name: 'CRM', tools: 121, examples: ['Salesforce'] },
    { name: 'Fonts', tools: 188, examples: ['Google Fonts'] }
];
const meta = new Map([
    ['CRM', { status: 'whitelisted', firstSeen: null }],
    ['Fonts', { status: 'blocked', firstSeen: null }],
    ['Email Security', { status: null, firstSeen: new Date('2026-10-01') }],
    ['Typo Categry', { status: 'blocked', firstSeen: null }],      // status set, no tools
    ['Old New', { status: null, firstSeen: new Date('2026-08-01') }] // older than 30 days, no tools
]);
const opts = (extra) => Object.assign({ now, statuses: ['whitelisted', 'blocked'], exclude: [] }, extra);

test('merges counts with statuses, sorted by tools desc', () => {
    const out = buildRuleList(rows, meta, opts());
    assert.deepEqual(out.list.map(r => [r.name, r.status, r.tools]), [
        ['Fonts', 'blocked', 188], ['CRM', 'whitelisted', 121], ['Analytics', 'normal', 41],
        ['Email Security', 'normal', 21], ['Typo Categry', 'blocked', 0]
    ]);
    assert.deepEqual(out.counts, { all: 5, new: 1, whitelisted: 1, blocked: 2, normal: 2 });
    assert.equal(out.list.find(r => r.name === 'Email Security').isNew, true);
    assert.ok(!out.list.some(r => r.name === 'Old New'));
});

test('filters by status and new, counts ignore the status filter', () => {
    assert.deepEqual(buildRuleList(rows, meta, opts({ status: 'blocked' })).list.map(r => r.name), ['Fonts', 'Typo Categry']);
    assert.deepEqual(buildRuleList(rows, meta, opts({ status: 'new' })).list.map(r => r.name), ['Email Security']);
    assert.equal(buildRuleList(rows, meta, opts({ status: 'normal' })).counts.all, 5);
});

test('search is a literal case-insensitive substring and narrows counts', () => {
    const out = buildRuleList(rows.concat([{ name: 'A/B Testing (beta)', tools: 1, examples: [] }]), meta, opts({ search: 'b test' }));
    assert.deepEqual(out.list.map(r => r.name), ['A/B Testing (beta)']);
    assert.equal(out.counts.all, 1);
});

test('paginates and excludes reserved names', () => {
    const out = buildRuleList(rows, meta, opts({ offset: 1, limit: 2, exclude: ['Fonts'] }));
    assert.equal(out.total, 4);
    assert.deepEqual(out.list.map(r => r.name), ['Analytics', 'Email Security']);
});

test('unknown status filter behaves as all', () => {
    assert.equal(buildRuleList(rows, meta, opts({ status: 'bogus' })).list.length, 5);
});

// Imports the frozen hardcoded visibility lists (db/seed/visibility-rules-2026-10.json) into the DB.
//
//   node migrate-visibility-rules.js --db marchtach_dev            # dry run (default)
//   node migrate-visibility-rules.js --db marchtach_dev --apply    # write
//
// Never overwrites a status an admin already set and skips tools set to Show (hidden: false); safe to rerun.
// Run order: marchtach_dev -> marchtach_staging -> marchtach (after mongodump).
const mongoose = require('mongoose');
const config = require('./config');
const CategoriesModel = require('./db/models/Categories');
const TagsModel = require('./db/models/Tags');
const ToolsModel = require('./db/models/Tools');
const { NO_CATEGORY, APP_TAGS } = require('./services/visibility-rules');
const DEFAULT_SNAPSHOT = require('./db/seed/visibility-rules-2026-10.json');

const uniq = list => Array.from(new Set(list));

async function migrate({ snapshot = DEFAULT_SNAPSHOT, apply = false, log = console.log } = {}) {
    const categories = new CategoriesModel();
    const tags = new TagsModel();
    const tools = new ToolsModel();

    // Categories: whitelist wins over block (e.g. Visitor Count Tracking is in both lists).
    const whitelisted = uniq(snapshot.whitelistedCategories);
    const blocked = uniq(snapshot.blockedCategories).filter(name => !whitelisted.includes(name));
    const categoryTargets = whitelisted.map(name => ({ name, status: 'whitelisted' }))
        .concat(blocked.map(name => ({ name, status: 'blocked' })))
        .concat([{ name: NO_CATEGORY, status: 'blocked' }]);
    const categoriesWithStatus = new Set(await categories.modelDB.distinct('name', { status: { $exists: true } }).exec());
    const categoryWrites = categoryTargets.filter(target => !categoriesWithStatus.has(target.name));

    // Tags: block the listed ones; register every other BuiltWith tag in use as Normal.
    const blockedTags = uniq(snapshot.blockedTags);
    const existingTags = await tags.modelDB.find({}, { name: 1, status: 1 }).lean().exec();
    const tagsWithStatus = new Set(existingTags.filter(doc => doc.status).map(doc => doc.name));
    const knownTags = new Set(existingTags.map(doc => doc.name));
    const tagWrites = blockedTags.filter(name => !tagsWithStatus.has(name));
    const tagsInUse = (await tools.modelDB.distinct('tag').exec()).filter(tag => tag && !APP_TAGS.includes(tag));
    const tagRegistrations = tagsInUse.filter(name => !knownTags.has(name) && !blockedTags.includes(name));

    // Tools: hardcoded names -> Hide, only where the admin setting is Default (hidden unset/null).
    // hidden: false (Show) and hidden: true (already Hide) are left alone.
    const names = uniq(snapshot.hiddenToolNames);
    const matched = await tools.modelDB.find({ name: { $in: names } }, { name: 1, categories: 1, hidden: 1 }).lean().exec();
    const matchedNames = new Set(matched.map(tool => tool.name));
    const unmatched = names.filter(name => !matchedNames.has(name));
    const isDefault = tool => tool.hidden !== true && tool.hidden !== false;
    const skippedShow = uniq(matched.filter(tool => tool.hidden === false).map(tool => tool.name));
    const toHide = uniq(matched.filter(isDefault).map(tool => tool.name));
    const inWhitelisted = uniq(matched
        .filter(tool => tool.hidden !== false && (tool.categories || []).some(cat => whitelisted.includes(cat)))
        .map(tool => tool.name));

    log(apply ? '== APPLY ==' : '== DRY RUN (pass --apply to write) ==');
    log('Category statuses to set (' + categoryWrites.length + '):', categoryWrites.map(w => w.name + ' -> ' + w.status).join(', ') || 'none');
    log('Categories skipped, status already set:', categoryTargets.length - categoryWrites.length);
    log('Tags to block (' + tagWrites.length + '):', tagWrites.join(', ') || 'none');
    log('Tags to register as Normal (' + tagRegistrations.length + '):', tagRegistrations.join(', ') || 'none');
    log('Tool names to set Hide (' + toHide.length + ')');
    log('REVIEW - listed names matching no tool (' + unmatched.length + '):', unmatched.join(', ') || 'none');
    log('REVIEW - listed tools in a whitelisted category, visible today, hidden after (' + inWhitelisted.length + '):', inWhitelisted.join(', ') || 'none');
    log('Listed tools skipped because they are set to Show / hidden: false (' + skippedShow.length + '):', skippedShow.join(', ') || 'none');

    if (apply) {
        for (const write of categoryWrites) {
            await categories.modelDB.updateMany({ name: write.name, status: { $exists: false } }, { $set: { status: write.status } }, { upsert: true }).exec();
        }
        for (const name of tagWrites) {
            await tags.modelDB.updateMany({ name, status: { $exists: false } }, { $set: { status: 'blocked' } }, { upsert: true }).exec();
        }
        if (tagRegistrations.length) {
            await tags.modelDB.insertMany(tagRegistrations.map(name => ({ name })));
        }
        if (toHide.length) {
            await tools.modelDB.updateMany({ name: { $in: toHide }, hidden: null }, { $set: { hidden: true } }).exec();
        }
    }

    const actual = {
        blockedCategories: (await categories.modelDB.distinct('name', { status: 'blocked', name: { $ne: NO_CATEGORY } }).exec()).length,
        whitelistedCategories: (await categories.modelDB.distinct('name', { status: 'whitelisted' }).exec()).length,
        blockedTags: (await tags.modelDB.distinct('name', { status: 'blocked' }).exec()).length
    };
    const expected = { blockedCategories: blocked.length, whitelistedCategories: whitelisted.length, blockedTags: blockedTags.length };
    if (apply) {
        const ok = Object.keys(expected).every(key => actual[key] === expected[key]);
        log('Verify:', JSON.stringify(actual), ok ? 'OK' : 'MISMATCH (expected ' + JSON.stringify(expected) + ' - admin edits since the snapshot can explain this)');
    }

    return { categoryWrites, tagWrites, tagRegistrations, toHide, unmatched, inWhitelisted, skippedShow, verify: { actual, expected } };
}

if (require.main === module) {
    const args = process.argv.slice(2);
    const dbIndex = args.indexOf('--db');
    const dbName = dbIndex !== -1 ? args[dbIndex + 1] : null;
    if (!dbName) {
        console.error('Usage: node migrate-visibility-rules.js --db <name> [--apply]');
        process.exit(1);
    }
    mongoose.set('useFindAndModify', false);
    mongoose.connect(config.MONGOURI + dbName, { useNewUrlParser: true, useUnifiedTopology: true })
        .then(() => migrate({ apply: args.includes('--apply') }))
        .then(() => mongoose.disconnect())
        .catch((err) => { console.error(err); process.exit(1); });
}

module.exports = { migrate };

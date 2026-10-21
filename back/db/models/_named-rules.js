const AbstaractModel = require('./_abstract');

// Base for collections of { name, status?, firstSeen? } rule docs (categories, tags).
// Docs without status are Normal. Duplicate names are tolerated (no unique index on prod):
// writes use updateMany({ name }) and reads merge by name.
class NamedRulesModel extends AbstaractModel {
    constructor(name, statuses, ignoredNames = []) {
        super(name);
        this.statuses = statuses;
        this.ignoredNames = ignoredNames;
    }

    async setStatus(name, status) {
        if (status !== null && !this.statuses.includes(status)) {
            throw new Error('Invalid status');
        }
        if (status) {
            return this.modelDB.updateMany({ name }, { $set: { status } }, { upsert: true }).exec();
        }
        return this.modelDB.updateMany({ name }, { $unset: { status: 1 } }).exec();
    }

    // Insert-only: never modifies an existing doc and never sets status.
    async registerSeen(names, now = new Date()) {
        const unique = Array.from(new Set((names || []).filter(name =>
            typeof name === 'string' && name.trim() !== '' && !this.ignoredNames.includes(name))));
        if (!unique.length) return;

        await this.modelDB.bulkWrite(unique.map(name => ({
            updateOne: { filter: { name }, update: { $setOnInsert: { firstSeen: now } }, upsert: true }
        })), { ordered: false });
    }

    async getMeta() {
        const docs = await this.modelDB.find(
            { $or: [{ status: { $exists: true } }, { firstSeen: { $exists: true } }] },
            { name: 1, status: 1, firstSeen: 1 }
        ).lean().exec();

        const meta = new Map();
        docs.forEach((doc) => {
            const current = meta.get(doc.name) || { status: null, firstSeen: null };
            if (doc.status) current.status = doc.status;
            if (doc.firstSeen && (!current.firstSeen || doc.firstSeen < current.firstSeen)) current.firstSeen = doc.firstSeen;
            meta.set(doc.name, current);
        });
        return meta;
    }

    async namesWithStatus(status) {
        const names = await this.modelDB.distinct('name', { status }).exec();
        return names.sort();
    }
}

module.exports = NamedRulesModel;

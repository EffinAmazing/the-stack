const NEW_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;

function toInt(value, fallback, min) {
    const n = parseInt(value, 10);
    return isNaN(n) || n < min ? fallback : n;
}

// Merge aggregate counts ({ name, tools, examples }) with rule meta (Map name -> { status, firstSeen })
// into the rows the admin Categories/Tags tabs show. Names with a status but no tools are kept
// so an admin can still clear them.
function buildRuleList(rows, meta, options) {
    const now = (options.now || new Date()).getTime();
    const statuses = options.statuses;
    const exclude = options.exclude || [];
    const search = (options.search || '').trim().toLowerCase();
    const filter = ['all', 'new', 'normal'].concat(statuses).includes(options.status) ? options.status : 'all';

    const byName = new Map();
    rows.forEach(row => byName.set(row.name, { name: row.name, tools: row.tools, examples: row.examples || [] }));
    meta.forEach((value, name) => {
        if (!byName.has(name) && value.status) byName.set(name, { name, tools: 0, examples: [] });
    });

    let list = Array.from(byName.values())
        .filter(row => typeof row.name === 'string' && !exclude.includes(row.name))
        .map((row) => {
            const m = meta.get(row.name);
            const status = m && statuses.includes(m.status) ? m.status : 'normal';
            const isNew = !!(m && m.firstSeen && now - new Date(m.firstSeen).getTime() <= NEW_WINDOW_MS);
            return Object.assign(row, { status, isNew });
        });

    if (search) list = list.filter(row => row.name.toLowerCase().includes(search));

    const counts = { all: list.length, new: 0, normal: 0 };
    statuses.forEach(s => { counts[s] = 0; });
    list.forEach((row) => {
        counts[row.status]++;
        if (row.isNew) counts.new++;
    });

    if (filter === 'new') list = list.filter(row => row.isNew);
    else if (filter !== 'all') list = list.filter(row => row.status === filter);

    list.sort((a, b) => b.tools - a.tools || (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));

    const offset = toInt(options.offset, 0, 0);
    const limit = toInt(options.limit, 25, 1);
    return { list: list.slice(offset, offset + limit), total: list.length, counts };
}

module.exports = { buildRuleList };

// Tool visibility precedence, evaluated once when a tool node is created on a stack
// (ToolsNodes.createNodesForTools / filterToolsByNodes). Saved nodes are never re-evaluated.

const NO_CATEGORY = '(No category)';
// Tags set by the app, not BuiltWith (domain nodes, custom apps). No visibility rules apply
// to these at all, not even admin Show/Hide.
const APP_TAGS = ['domain', 'customApp', 'custom'];
// Same threshold the stack builder uses for stale ("old") tools: 90 days.
const STALE_MS = 7776000000;

function isStale(end, now = Date.now()) {
    if (!end) return false;
    const time = new Date(end).getTime();
    if (isNaN(time)) return false;
    return now - time > STALE_MS;
}

// tool.hidden is the admin setting: true = Hide, false = Show, absent/null = Default.
function decideTool(tool, rules, stale = false) {
    if (APP_TAGS.includes(tool.tag)) return { state: null, reason: 'app-tool' };
    if (tool.hidden === false) return { state: 'show', reason: 'admin-show' };
    if (tool.hidden === true) return { state: 'hide', reason: 'admin-hide' };

    const categories = (tool.categories && tool.categories.length) ? tool.categories : [NO_CATEGORY];

    const whitelisted = categories.find(cat => rules.whitelisted.includes(cat));
    if (whitelisted) {
        // Whitelisted tools are exempt from auto-hide unless stale (existing behaviour).
        return stale ? { state: null, reason: 'auto' } : { state: 'show', reason: 'whitelisted', detail: whitelisted };
    }

    const blocked = categories.find(cat => rules.blocked.includes(cat));
    if (blocked) return { state: 'hide', reason: 'blocked-category', detail: blocked };

    if (tool.tag && rules.blockedTags.includes(tool.tag)) {
        return { state: 'hide', reason: 'blocked-tag', detail: tool.tag };
    }

    return { state: null, reason: 'auto' };
}

async function loadRules(categoriesModel, tagsModel) {
    const results = await Promise.all([categoriesModel.getRules(), tagsModel.getBlocked()]);
    return { whitelisted: results[0].whitelisted, blocked: results[0].blocked, blockedTags: results[1] };
}

function escapeRegex(str) {
    return String(str).replace(/[.*+?^${}()|[\]\\\/]/g, '\\$&');
}

module.exports = { NO_CATEGORY, APP_TAGS, STALE_MS, isStale, decideTool, loadRules, escapeRegex };

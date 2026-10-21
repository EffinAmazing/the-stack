# Tools Visibility Rules + Admin Route Security — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Admins control which tools appear on new stacks — per-tool Default/Show/Hide with bulk actions, admin-managed category (Whitelisted/Normal/Blocked) and tag (Normal/Blocked) rules applied when a tool is added to a stack — with every hardcoded list migrated to the DB, and admin endpoints actually enforced server-side.

**Architecture:** One precedence function (`decideTool`, backend only, `back/services/visibility-rules.js`). The backend applies it at the only two places nodes are created — `createNodesForTools` (new stack) and `filterToolsByNodes` (domain/app added to a stack) — saving `hide` and returning each new node's decision as `node.rule` (`'show' | 'hide' | null`). The frontend keeps its existing first-load soft logic (stale, other-domain, analytics exemption, 5-minimum, 50-cap) and add-domain 40-cap, with the hardcoded-list checks swapped for `node.rule`; the first-load pass runs only when the server says the stack was just created (`isNew`). Rules are stored as optional `status` fields on the existing `categories` collection and a new tiny `tags` collection. The per-tool admin setting is the existing `tools.hidden` field used three ways: `true` = Hide, `false` = Show, absent/null = Default.

**Tech Stack:** Express 4 + Mongoose 5.12.3 (prod MongoDB 3.6.3, local 4.4.5), Angular 9 / Material 9 / TypeScript 3.7.7, `node:test`.

**Spec:** `docs/superpowers/specs/2026-08-17-tools-management-bulk-visibility-design.md` (approved 2026-10-16). Mockups: `docs/superpowers/mockups/*.jpg`.

**Branch:** `tools-management-visibility-rules` (from `master` @ `aed1335`).

## Decisions made while reviewing this plan (2026-10-16)

- **Rules touch only new nodes:** a new stack's first load and a domain/app added to a stack. Existing stacks and their saved nodes are never re-evaluated. No `RULES_START_DATE`.
- **No fallback** to the hardcoded lists. The migration runs before the code is deployed. The hardcoded arrays stay in the source **commented out** with a DEPRECATED note (config.ts can't be renamed — it holds other live config).
- **No frontend copy of the rules**, no frontend rules service. The backend decides; the Tools page's "Result" column is computed by the backend.
- **`tools.hidden` three-state:** `true` Hide, `false` Show, absent/null Default. New tools start as Default. Existing `hidden: false` values (tools an admin un-hid) become Show — intended. The builder's per-node "hide globally" toggle keeps writing `true`/`false`.
- **Domain and custom-app tools** (tags `domain`, `customApp`, `custom`) are outside the rules entirely — no Show/Hide/category/tag rule applies, they are not listed on the admin pages, and visibility writes skip them. Pre-existing soft logic that hides *other* domains' nodes on big new stacks is unchanged.
- **Soft pass and caps are kept as-is** (first load: stale/other-domain/analytics, never below 5 visible, then trim to 50; add-domain: max 40 newly visible). Tools the rules mark Show (admin Show or whitelisted) are never hidden by them.
- **5-visible minimum applies to rule hides on a new stack too** (user, 2026-10-16 — same as today, where the first-load pass applied every list check under `all - hidden > 5`). `createNodesForTools` hides rule-`'hide'` tools in tool order only while more than 5 tools stay visible; the spared ones keep `rule: 'hide'` but `hide: false`. Adding a domain/app (`filterToolsByNodes`) has no minimum, as today.

## Global Constraints

- App runtime is **Node 16** locally (`PATH=~/.nvm/versions/node/v16.15.0/bin:$PATH`). Backend code must not use syntax newer than Node 14 (no `??=`, no top-level await, no `Array.prototype.at`).
- Backend tests run on the shell default **Node 24** (`node --test`). Tests are dev-only.
- Frontend code must compile with **TypeScript 3.7.7** (no `import type`, no `satisfies`, no optional chaining `?.` / `??` in templates).
- MongoDB features must work on **3.6**: `updateMany`, `bulkWrite`, `$unwind`/`$group`/`$slice`, `insertMany` only. In upserts **never repeat the filter field inside `$setOnInsert`**.
- `front/dist/` is tracked in git. **Never** run `ng build` without `--output-path=<scratchpad>` and never `git add front/dist`. Commit with explicit paths, never `git add -A`/`.`.
- Matching of category and tag names is **exact and case-sensitive** (spec: quirks preserved as-is).
- Reserved category name: `(No category)` (exact string). App-set tags: `domain`, `customApp`, `custom` (plus empty tag `""`) — never listed as blockable tags.
- Response envelope stays `{ result: ... }` (frontend `ResponseMappers.mapResponse` unwraps `result`); errors are `{ result: 'Error', message }` with a 4xx/5xx status.
- Rules are evaluated **once at node creation**; existing `blueprints_tools` documents are never updated by this feature.
- "Default" in queries is `{ hidden: null }` (matches absent **and** null); never `{ hidden: { $exists: false } }`.
- Test DBs are `marchtach_test_<suite>` on `mongodb://localhost:27017/` and are dropped before and after each suite; the helper refuses any name not starting with `marchtach_test_`.
- Commit messages end with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Review Focus

1. **App-created tools are outside the rules entirely** — domain nodes (tag `domain`, category `WebSite`) and custom apps (tags `customApp`/`custom`, category `CustomApp`): `decideTool` returns `app-tool` before even admin Show/Hide; they never appear on the Tools page, in category/tag counts or block-impact counts; bulk/builder visibility writes skip them. Pinned by fixture cases `app-*` (Task 3) and `back/test/tools-model.test.js` (Task 4).
2. **Admin locks themselves out** — an admin editing their own user with `role: 1` must get 400, not lose access to the only admin account. Pinned in `back/test/user-update.test.js` (Task 1).
3. **Names with regex metacharacters** — `A/B Testing`, `(No category)`, `C++`, `Node.js` in the tool search box or in `?category=` must match literally, never throw or over-match. Pinned in `back/test/tools-model.test.js` (Task 4).
4. **Three-state `hidden`** — `false` must mean Show (not "not hidden"), and both a missing field and an explicit `null` must mean Default in decisions, filters and the migration. Pinned by fixture cases `admin-show-*`/`hidden-null-is-default` (Task 3), `back/test/tools-model.test.js` (Task 4) and `back/test/migrate-visibility-rules.test.js` (Task 7).
5. **Malformed bulk requests** — `ids` not an array, empty, >500, invalid ObjectIds, or an unknown `state` must return 400 with no write. Pinned in `back/test/tools-controller.test.js` (Task 6).

---

## File Structure

**Backend — create**
- `back/core/middleware/require-admin.js` — 401/403 gate for routes after `passport.authenticate('jwt')`.
- `back/services/user-update.js` — allowlist + validation for `PUT /users/:id`.
- `back/services/visibility-rules.js` — `decideTool`, `isStale`, `loadRules`, `escapeRegex`, constants.
- `back/services/rule-lists.js` — pure merge/filter/paginate for the admin Categories/Tags lists.
- `back/db/models/_named-rules.js` — base model for name+status docs (`setStatus`, `registerSeen`, `getMeta`, `namesWithStatus`).
- `back/db/models/Tags.js` — `tags` collection.
- `back/core/controllers/visibility-rules.js` — admin categories/tags/impact endpoints.
- `back/db/seed/visibility-rules-2026-10.json` — frozen hardcoded lists.
- `back/migrate-visibility-rules.js` — import script (dry-run default).
- `back/test/helpers/db.js`, `back/test/helpers/http.js`, `back/test/fixtures/visibility-decisions.json`, `back/test/*.test.js`.

**Backend — modify**
- `back/package.json` (test script), `back/core/router.js`, `back/core/controllers/users.js`, `back/core/controllers/tools.js`, `back/core/controllers/blueprints.js` (`isNew`, `categoryRules`), `back/db/models/Categories.js`, `back/db/models/Tools.js`, `back/db/models/ToolsNodes.js` (rules at node creation; `BlockedCategories` commented out).

**Frontend — create**
- `front/src/app/core/guards/admin.guard.ts`
- `front/src/app/modules/profile/pages/categories-managment/categories-managment.component.{ts,html,scss}`
- `front/src/app/modules/profile/components/block-rule-dialog/block-rule-dialog.component.{ts,html,scss}`

**Frontend — modify**
- `front/src/app/core/config.ts` (four arrays commented out), `shared/models/tool.ts`, `modules/blueprint/pages/build-stack/build-stack.component.{ts,html}`, `modules/blueprint/components/tools-list/tools-list.component.ts`, `core/services/blueprints.service.ts`, `core/services/tools.service.ts`, `modules/profile/pages/tools-managment/tools-managment.component.{ts,html,scss}`, `modules/profile/profile-routing.module.ts`, `modules/profile/profile.module.ts`, `shared/components/header/header.component.html`.

---

### Task 1: Admin route security + backend test harness

**Files:**
- Create: `back/core/middleware/require-admin.js`, `back/services/user-update.js`, `back/test/helpers/http.js`, `back/test/require-admin.test.js`, `back/test/user-update.test.js`, `front/src/app/core/guards/admin.guard.ts`
- Modify: `back/package.json`, `back/core/router.js:55-75`, `back/core/controllers/users.js:146-171`, `front/src/app/modules/profile/profile-routing.module.ts:24-34`

**Interfaces:**
- Produces: `requireAdmin(req, res, next)` (CommonJS default export); `sanitizeUserUpdate(data, editorId, targetId) → { data } | { error }`; `fakeRes()` test helper returning `{ statusCode, body, status(code), json(body) }`; Angular `AdminGuard` (`providedIn: 'root'`).

- [ ] **Step 1: Add the test script**

In `back/package.json` replace the `"test"` script:

```json
    "test": "node --test test/*.test.js",
```

- [ ] **Step 2: Write the test helper**

`back/test/helpers/http.js`:

```js
// Minimal Express response double for controller/middleware tests.
function fakeRes() {
    const res = { statusCode: 200, body: undefined };
    res.status = (code) => { res.statusCode = code; return res; };
    res.json = (body) => { res.body = body; return res; };
    return res;
}

module.exports = { fakeRes };
```

- [ ] **Step 3: Write failing tests**

`back/test/require-admin.test.js`:

```js
const { test } = require('node:test');
const assert = require('node:assert/strict');
const requireAdmin = require('../core/middleware/require-admin');
const { fakeRes } = require('./helpers/http');

test('401 when no user is attached', () => {
    const res = fakeRes();
    let called = false;
    requireAdmin({}, res, () => { called = true; });
    assert.equal(res.statusCode, 401);
    assert.equal(called, false);
});

test('403 for a non-admin user', () => {
    const res = fakeRes();
    let called = false;
    requireAdmin({ user: { role: 1 } }, res, () => { called = true; });
    assert.equal(res.statusCode, 403);
    assert.deepEqual(res.body, { result: 'Error', message: 'Forbidden' });
    assert.equal(called, false);
});

test('403 when role is missing or a string', () => {
    for (const user of [{}, { role: '0' }, { role: null }]) {
        const res = fakeRes();
        requireAdmin({ user }, res, () => assert.fail('next called'));
        assert.equal(res.statusCode, 403);
    }
});

test('calls next for an admin', () => {
    const res = fakeRes();
    let called = false;
    requireAdmin({ user: { role: 0 } }, res, () => { called = true; });
    assert.equal(called, true);
    assert.equal(res.body, undefined);
});
```

`back/test/user-update.test.js`:

```js
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { sanitizeUserUpdate } = require('../services/user-update');

const admin = 'aaaaaaaaaaaaaaaaaaaaaaaa';
const other = 'bbbbbbbbbbbbbbbbbbbbbbbb';

test('keeps only editable fields', () => {
    const out = sanitizeUserUpdate({
        email: 'a@b.co', firstName: 'A', lastName: 'B', role: 1, verified: true,
        password: 'x', validationCode: 'y', _id: 'z', created: 'now'
    }, admin, other);
    assert.deepEqual(out, { data: { email: 'a@b.co', firstName: 'A', lastName: 'B', role: 1, verified: true } });
});

test('rejects non-object data', () => {
    assert.ok(sanitizeUserUpdate(null, admin, other).error);
    assert.ok(sanitizeUserUpdate('role=0', admin, other).error);
});

test('rejects invalid role and verified values', () => {
    assert.ok(sanitizeUserUpdate({ role: 2 }, admin, other).error);
    assert.ok(sanitizeUserUpdate({ role: '0' }, admin, other).error);
    assert.ok(sanitizeUserUpdate({ verified: 'yes' }, admin, other).error);
});

test('an admin cannot remove their own admin role', () => {
    const out = sanitizeUserUpdate({ role: 1 }, admin, admin);
    assert.equal(out.error, 'You cannot remove your own administrator role');
});

test('an admin can save their own profile with role 0 unchanged', () => {
    assert.deepEqual(sanitizeUserUpdate({ firstName: 'Me', role: 0 }, admin, admin), { data: { firstName: 'Me', role: 0 } });
});

test('ObjectId-like editor ids are compared as strings', () => {
    const editorId = { toString: () => admin };
    assert.ok(sanitizeUserUpdate({ role: 1 }, editorId, admin).error);
});
```

- [ ] **Step 4: Run tests to verify they fail**

Run: `cd back && npm test`
Expected: FAIL — `Cannot find module '../core/middleware/require-admin'` and `'../services/user-update'`.

- [ ] **Step 5: Implement**

`back/core/middleware/require-admin.js`:

```js
// Use after passport.authenticate('jwt'): req.user is reloaded from the DB on every request,
// so a role change takes effect immediately.
module.exports = function requireAdmin(req, res, next) {
    if (!req.user) {
        return res.status(401).json({ result: 'Error', message: 'You need to be registered' });
    }
    if (req.user.role !== 0) {
        return res.status(403).json({ result: 'Error', message: 'Forbidden' });
    }
    next();
};
```

`back/services/user-update.js`:

```js
// Fields an admin may change from the Users page (update-user-form). Everything else
// (password, validationCode, created, ...) is dropped.
const EDITABLE_FIELDS = ['email', 'firstName', 'lastName', 'role', 'verified'];

function sanitizeUserUpdate(data, editorId, targetId) {
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
        return { error: 'incorrect data' };
    }

    const clean = {};
    EDITABLE_FIELDS.forEach((key) => {
        if (data[key] !== undefined) clean[key] = data[key];
    });

    if (clean.role !== undefined && clean.role !== 0 && clean.role !== 1) {
        return { error: 'Invalid role' };
    }
    if (clean.verified !== undefined && typeof clean.verified !== 'boolean') {
        return { error: 'Invalid verified flag' };
    }
    if (clean.role === 1 && String(editorId) === String(targetId)) {
        return { error: 'You cannot remove your own administrator role' };
    }

    return { data: clean };
}

module.exports = { sanitizeUserUpdate };
```

In `back/core/controllers/users.js` add at the top (with the other requires):

```js
const { sanitizeUserUpdate } = require('../../services/user-update');
```

and replace the body of `update(req, res, next)` (lines 146–171) with:

```js
    update(req, res, next) {
        let id = req.params.id;
        const user = req.user;

        const parsed = sanitizeUserUpdate(req.body.data, user._id, id);
        if (parsed.error) {
            return res.status(400).json({
                result: 'Error',
                message: parsed.error
            });
        }

        this.model.updateOne(id, parsed.data)
        .then(doc => {
            res.json({
                result: doc
            })
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                result: 'Error',
                message: 'Server error'
            }); 
        });
    }
```

In `back/core/router.js` add after line 9 (`const servicePassport = ...`):

```js
const requireAdmin = require('./middleware/require-admin');
```

and add `requireAdmin` after the `passport.authenticate(...)` argument on exactly these routes:

```js
router.post('/tools/updateVisibility/:id', passport.authenticate('jwt', { session: false }), requireAdmin, tools.updateVisibility.bind(tools));

router.get('/admin/tools', passport.authenticate('jwt', { session: false }), requireAdmin, tools.getTools.bind(tools));
router.get('/admin/tools/search', passport.authenticate('jwt', { session: false }), requireAdmin, tools.getByName.bind(tools));

router.get('/users', passport.authenticate('jwt', { session: false }), requireAdmin, users.getList.bind(users));
router.put('/users/:id', passport.authenticate('jwt', { session: false }), requireAdmin, users.update.bind(users));
router.delete('/users/:id', passport.authenticate('jwt', { session: false }), requireAdmin, users.delete.bind(users));
```

(`/users/:id/reinvite` and `/users/:id/blueprints` are used by stack owners on the Account page — leave them.)

`front/src/app/core/guards/admin.guard.ts`:

```ts
import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

// UI convenience only — the server enforces admin access with requireAdmin.
@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) { }

  canActivate(): boolean | UrlTree {
    const user = this.auth.getCurrentUser();
    if (!user) {
      return this.router.parseUrl('/profile/signin');
    }
    if (user.role !== 0) {
      return this.router.parseUrl('/profile');
    }
    return true;
  }
}
```

In `front/src/app/modules/profile/profile-routing.module.ts` add the import after the AuthGuard import:

```ts
import { AdminGuard } from '../../core/guards/admin.guard';
```

and change the `users` and `tools` routes to `canActivate: [AuthGuard, AdminGuard]`.

- [ ] **Step 6: Run tests to verify they pass**

Run: `cd back && npm test`
Expected: PASS (10 tests).

Run: `cd back && PATH=~/.nvm/versions/node/v16.15.0/bin:$PATH node -e "require('./core/router')" && echo router-ok`
Expected: `router-ok`.

- [ ] **Step 7: Commit**

```bash
git add back/package.json back/core/middleware/require-admin.js back/services/user-update.js back/core/router.js back/core/controllers/users.js back/test/helpers/http.js back/test/require-admin.test.js back/test/user-update.test.js front/src/app/core/guards/admin.guard.ts front/src/app/modules/profile/profile-routing.module.ts
git commit -m "Enforce admin role on admin endpoints and restrict user updates

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Freeze the hardcoded lists into a seed snapshot

**Files:**
- Create: `back/db/seed/visibility-rules-2026-10.json`
- Scratch (not committed): `/private/tmp/claude-501/-Users-joelhatmaker-Work-mcgaw-the-stack-the-stack/5db66b7d-5ec3-44f8-a8c2-09144f5d321e/scratchpad/snapshot-lists.js`

**Interfaces:**
- Produces: JSON `{ _comment, whitelistedCategories: string[], blockedCategories: string[], blockedTags: string[], droppedTags: string[], hiddenToolNames: string[] }` (all de-duplicated, original order).

- [ ] **Step 1: Write the generator (scratchpad)**

```js
// One-off: freeze the hardcoded visibility lists. Usage: node snapshot-lists.js <repoRoot>
const fs = require('fs');
const path = require('path');

const root = process.argv[2];
const cfg = fs.readFileSync(path.join(root, 'front/src/app/core/config.ts'), 'utf8');
const nodes = fs.readFileSync(path.join(root, 'back/db/models/ToolsNodes.js'), 'utf8');

function list(src, name) {
    const start = src.indexOf('const ' + name);
    if (start === -1) throw new Error('missing ' + name);
    const open = src.indexOf('[', start);
    const close = src.indexOf(']', open);
    const body = src.slice(open + 1, close).split('\n').map(l => l.replace(/^\s*\/\/.*$/, '')).join('\n');
    return Array.from(body.matchAll(/'([^']*)'/g), m => m[1]);
}
const uniq = a => Array.from(new Set(a));

const raw = {
    forbiddenTags: list(cfg, 'forbiddenTags'),
    forbiddenTools: list(cfg, 'forbiddenTools'),
    hiddenCategories: list(cfg, 'hiddenCategories'),
    WhitelistCategories: list(cfg, 'WhitelistCategories'),
    BlockedCategories: list(nodes, 'BlockedCategories')
};
for (const [k, v] of Object.entries(raw)) console.log(k, v.length, 'raw /', uniq(v).length, 'unique');
const same = JSON.stringify(uniq(raw.hiddenCategories).sort()) === JSON.stringify(uniq(raw.BlockedCategories).sort());
console.log('hiddenCategories === BlockedCategories:', same);

const snapshot = {
    _comment: 'Frozen copy of the hardcoded visibility lists (front/src/app/core/config.ts, back/db/models/ToolsNodes.js) as of 2026-10-16. Input for back/migrate-visibility-rules.js. Do not edit.',
    whitelistedCategories: uniq(raw.WhitelistCategories),
    blockedCategories: uniq(raw.hiddenCategories),
    blockedTags: uniq(raw.forbiddenTags).filter(t => t !== 'feed'),
    droppedTags: ['feed'],
    hiddenToolNames: uniq(raw.forbiddenTools)
};
fs.mkdirSync(path.join(root, 'back/db/seed'), { recursive: true });
fs.writeFileSync(path.join(root, 'back/db/seed/visibility-rules-2026-10.json'), JSON.stringify(snapshot, null, 2) + '\n');
console.log('written');
```

- [ ] **Step 2: Run it and check counts against the spec**

Run: `node <scratchpad>/snapshot-lists.js /Users/joelhatmaker/Work/mcgaw/the-stack/the-stack`
Expected exactly:
```
forbiddenTags 12 raw / 12 unique
forbiddenTools 347 raw / 335 unique
hiddenCategories 94 raw / 93 unique
WhitelistCategories 7 raw / 7 unique
BlockedCategories 94 raw / 93 unique
hiddenCategories === BlockedCategories: true
written
```
Any other number ⇒ stop and inspect the parser (comment lines, `]` inside a name) before continuing.

Run: `node -e "const s=require('./back/db/seed/visibility-rules-2026-10.json');console.log(s.blockedTags.length, s.blockedCategories.filter(c=>!s.whitelistedCategories.includes(c)).length, s.blockedCategories.includes('Visitor Count Tracking'))"`
Expected: `11 92 true`.

- [ ] **Step 3: Commit**

```bash
git add back/db/seed/visibility-rules-2026-10.json
git commit -m "Add frozen snapshot of hardcoded visibility lists

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Backend rule engine (`decideTool`)

**Files:**
- Create: `back/services/visibility-rules.js`, `back/test/fixtures/visibility-decisions.json`, `back/test/visibility-rules.test.js`

**Interfaces:**
- Produces (CommonJS): `NO_CATEGORY = '(No category)'`, `APP_TAGS = ['domain','customApp','custom']`, `STALE_MS = 7776000000`, `isStale(end, now = Date.now()) → boolean`, `decideTool(tool, rules, stale = false) → { state: 'show'|'hide'|null, reason: 'app-tool'|'admin-show'|'admin-hide'|'whitelisted'|'blocked-category'|'blocked-tag'|'auto', detail?: string }`, `loadRules(categoriesModel, tagsModel) → Promise<{ whitelisted, blocked, blockedTags }>` (DB errors propagate), `escapeRegex(str) → string`.
- `rules` shape everywhere: `{ whitelisted: string[], blocked: string[], blockedTags: string[] }`.
- Tool admin setting: `tool.hidden === true` Hide, `=== false` Show, anything else (absent/null) Default.

- [ ] **Step 1: Write the fixture**

`back/test/fixtures/visibility-decisions.json`:

```json
{
  "rules": {
    "whitelisted": ["CRM", "Marketing Automation"],
    "blocked": ["Email Security", "Advertising", "WebSite", "CustomApp", "(No category)"],
    "blockedTags": ["cms", "hosting", "custom"]
  },
  "cases": [
    { "name": "admin-show-beats-blocked-category", "tool": { "categories": ["Email Security"], "tag": "mx", "hidden": false }, "expected": { "state": "show", "reason": "admin-show" } },
    { "name": "admin-show-beats-blocked-tag", "tool": { "categories": ["Simple Website Builder"], "tag": "cms", "hidden": false }, "expected": { "state": "show", "reason": "admin-show" } },
    { "name": "admin-show-beats-stale", "tool": { "categories": ["Scheduling"], "tag": "widgets", "hidden": false }, "stale": true, "expected": { "state": "show", "reason": "admin-show" } },
    { "name": "admin-hide-beats-whitelist", "tool": { "categories": ["CRM"], "tag": "analytics", "hidden": true }, "expected": { "state": "hide", "reason": "admin-hide" } },
    { "name": "whitelist-beats-blocked-category", "tool": { "categories": ["Email Security", "Marketing Automation"], "tag": "mx" }, "expected": { "state": "show", "reason": "whitelisted", "detail": "Marketing Automation" } },
    { "name": "whitelist-beats-blocked-tag", "tool": { "categories": ["CRM"], "tag": "cms" }, "expected": { "state": "show", "reason": "whitelisted", "detail": "CRM" } },
    { "name": "blocked-category", "tool": { "categories": ["Analytics", "Advertising"], "tag": "ads" }, "expected": { "state": "hide", "reason": "blocked-category", "detail": "Advertising" } },
    { "name": "blocked-tag", "tool": { "categories": ["Simple Website Builder"], "tag": "cms" }, "expected": { "state": "hide", "reason": "blocked-tag", "detail": "cms" } },
    { "name": "empty-categories-are-no-category", "tool": { "categories": [], "tag": "widgets" }, "expected": { "state": "hide", "reason": "blocked-category", "detail": "(No category)" } },
    { "name": "missing-categories-are-no-category", "tool": { "tag": "widgets" }, "expected": { "state": "hide", "reason": "blocked-category", "detail": "(No category)" } },
    { "name": "app-domain-tool-ignores-blocked-category", "tool": { "categories": ["WebSite"], "tag": "domain" }, "expected": { "state": null, "reason": "app-tool" } },
    { "name": "app-custom-tool-ignores-blocked-tag", "tool": { "categories": [], "tag": "custom" }, "expected": { "state": null, "reason": "app-tool" } },
    { "name": "app-tool-ignores-admin-hide", "tool": { "categories": ["CustomApp"], "tag": "customApp", "hidden": true }, "expected": { "state": null, "reason": "app-tool" } },
    { "name": "app-tool-ignores-admin-show", "tool": { "categories": ["WebSite"], "tag": "domain", "hidden": false }, "expected": { "state": null, "reason": "app-tool" } },
    { "name": "normal-tool-is-auto", "tool": { "categories": ["Scheduling"], "tag": "widgets" }, "expected": { "state": null, "reason": "auto" } },
    { "name": "hidden-null-is-default", "tool": { "categories": ["Scheduling"], "tag": "widgets", "hidden": null }, "expected": { "state": null, "reason": "auto" } },
    { "name": "stale-whitelisted-falls-to-soft-rules", "tool": { "categories": ["CRM"], "tag": "widgets" }, "stale": true, "expected": { "state": null, "reason": "auto" } },
    { "name": "matching-is-case-sensitive", "tool": { "categories": ["email security"], "tag": "CMS" }, "expected": { "state": null, "reason": "auto" } },
    { "name": "empty-tag-is-not-app-tag", "tool": { "categories": ["Advertising"], "tag": "" }, "expected": { "state": "hide", "reason": "blocked-category", "detail": "Advertising" } }
  ]
}
```

- [ ] **Step 2: Write the failing tests**

`back/test/visibility-rules.test.js`:

```js
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
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `cd back && node --test test/visibility-rules.test.js`
Expected: FAIL — `Cannot find module '../services/visibility-rules'`.

- [ ] **Step 4: Implement**

`back/services/visibility-rules.js`:

```js
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
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `cd back && npm test`
Expected: PASS (all Task 1 + Task 3 tests; 19 fixture cases).

- [ ] **Step 6: Commit**

```bash
git add back/services/visibility-rules.js back/test/fixtures/visibility-decisions.json back/test/visibility-rules.test.js
git commit -m "Add backend tool visibility rule engine

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: Data models — category/tag rules, three-state `hidden`, queries, auto-registration

**Files:**
- Create: `back/db/models/_named-rules.js`, `back/db/models/Tags.js`, `back/test/helpers/db.js`, `back/test/rule-models.test.js`, `back/test/tools-model.test.js`
- Modify: `back/db/models/Categories.js`, `back/db/models/Tools.js`

**Interfaces:**
- Consumes: `NO_CATEGORY`, `APP_TAGS`, `escapeRegex` (Task 3).
- Produces:
  - `NamedRulesModel` base: `this.statuses: string[]`; `setStatus(name, status|null) → Promise` (throws `Error('Invalid status')`); `registerSeen(names: string[], now = new Date()) → Promise`; `getMeta() → Promise<Map<name, { status: string|null, firstSeen: Date|null }>>`; `namesWithStatus(status) → Promise<string[]>` (sorted).
  - `CategoriesModel.getRules() → { whitelisted: string[], blocked: string[] }`; statuses `['whitelisted','blocked']`.
  - `TagsModel` (collection `tags`): `getBlocked() → string[]`; statuses `['blocked']`; `registerSeen` ignores `APP_TAGS` and empty.
  - `ToolsModel`: `hidden` is three-state (`true` Hide / `false` Show / absent Default); `bulkSetVisibility(ids, state) → { matched, modified, tools }` (`state` `'show'` → `hidden: false`, `'hide'` → `hidden: true`, `'default'` → `$unset`; app tools never matched); `buildToolsFilter({ name, category, tag, setting })`; `queryTools({ name, category, tag, setting, offset, limit }) → { list, total, offset, limit }`; `getCategoryCounts() → { rows: [{ name, tools, examples }], noCategory: { tools, examples } }`; `getTagCounts() → [{ name, tools, examples }]`; `getBlockImpact({ category } | { tag }, whitelisted) → { tools, alsoWhitelisted }`; `proceedTools` registers seen categories/tags.
  - Test helper: `connect(suite) / disconnect()`.

- [ ] **Step 1: Write the DB test helper**

`back/test/helpers/db.js`:

```js
const mongoose = require('mongoose');

const URI = process.env.TEST_MONGOURI || 'mongodb://localhost:27017/';

async function connect(suite) {
    const name = 'marchtach_test_' + suite;
    if (!/^marchtach_test_[a-z_]+$/.test(name)) throw new Error('Refusing to use database ' + name);
    mongoose.set('useCreateIndex', true);
    mongoose.set('useFindAndModify', false);
    await mongoose.connect(URI + name, { useNewUrlParser: true, useUnifiedTopology: true });
    await mongoose.connection.db.dropDatabase();
}

async function disconnect() {
    await mongoose.connection.db.dropDatabase();
    await mongoose.disconnect();
}

module.exports = { connect, disconnect };
```

- [ ] **Step 2: Write failing tests**

`back/test/rule-models.test.js`:

```js
const { test, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const { connect, disconnect } = require('./helpers/db');
const CategoriesModel = require('../db/models/Categories');
const TagsModel = require('../db/models/Tags');

let categories, tags;
before(async () => { await connect('rule_models'); categories = new CategoriesModel(); tags = new TagsModel(); });
after(disconnect);
beforeEach(async () => { await categories.modelDB.deleteMany({}); await tags.modelDB.deleteMany({}); });

test('setStatus upserts, updates every duplicate, and clears', async () => {
    await categories.modelDB.create([{ name: 'Fonts', toolsCount: 3 }, { name: 'Fonts' }]);
    await categories.setStatus('Fonts', 'blocked');
    await categories.setStatus('Email Security', 'blocked');
    assert.deepEqual(await categories.getRules(), { whitelisted: [], blocked: ['Email Security', 'Fonts'] });
    const fonts = await categories.modelDB.find({ name: 'Fonts' }).lean();
    assert.equal(fonts.length, 2);
    assert.ok(fonts.every(d => d.status === 'blocked'));
    assert.equal(fonts.find(d => d.toolsCount === 3).toolsCount, 3); // existing fields untouched

    await categories.setStatus('Fonts', null);
    assert.equal(await categories.modelDB.countDocuments({ name: 'Fonts', status: { $exists: true } }), 0);
    assert.equal(await categories.modelDB.countDocuments({ name: 'Fonts' }), 2);
});

test('setStatus(null) on an unknown name does not insert', async () => {
    await categories.setStatus('Nope', null);
    assert.equal(await categories.modelDB.countDocuments({}), 0);
});

test('setStatus rejects unknown statuses', async () => {
    await assert.rejects(categories.setStatus('Fonts', 'hidden'), /Invalid status/);
    await assert.rejects(tags.setStatus('cms', 'whitelisted'), /Invalid status/);
});

test('registerSeen inserts only new names with firstSeen and never touches existing docs', async () => {
    await categories.modelDB.create({ name: 'Old', toolsCount: 5 });
    await categories.setStatus('Blocked One', 'blocked');
    const now = new Date('2026-10-16T12:00:00Z');
    await categories.registerSeen(['Old', 'Blocked One', 'Brand New', 'Brand New', '', null], now);

    const docs = await categories.modelDB.find({}).lean();
    assert.equal(docs.length, 3);
    const byName = Object.fromEntries(docs.map(d => [d.name, d]));
    assert.equal(byName['Old'].firstSeen, undefined);
    assert.equal(byName['Blocked One'].status, 'blocked');
    assert.equal(byName['Blocked One'].firstSeen, undefined);
    assert.equal(byName['Brand New'].firstSeen.toISOString(), now.toISOString());
    assert.equal(byName['Brand New'].status, undefined);
});

test('getMeta merges duplicates (status wins, earliest firstSeen)', async () => {
    await categories.modelDB.create([
        { name: 'Dup', firstSeen: new Date('2026-10-10') },
        { name: 'Dup', status: 'whitelisted', firstSeen: new Date('2026-10-01') }
    ]);
    const meta = await categories.getMeta();
    assert.equal(meta.get('Dup').status, 'whitelisted');
    assert.equal(meta.get('Dup').firstSeen.toISOString(), new Date('2026-10-01').toISOString());
});

test('tags: block-only, app tags never registered', async () => {
    await tags.registerSeen(['cms', 'domain', 'customApp', 'custom', '', 'feeds']);
    assert.deepEqual((await tags.modelDB.find({}).lean()).map(d => d.name).sort(), ['cms', 'feeds']);
    await tags.setStatus('cms', 'blocked');
    assert.deepEqual(await tags.getBlocked(), ['cms']);
});

test('tag and category names do not collide', async () => {
    await categories.setStatus('mobile', 'blocked');
    assert.deepEqual(await tags.getBlocked(), []);
});
```

`back/test/tools-model.test.js`:

```js
const { test, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const { connect, disconnect } = require('./helpers/db');
const ToolsModel = require('../db/models/Tools');
const CategoriesModel = require('../db/models/Categories');
const TagsModel = require('../db/models/Tags');

let tools;
before(async () => { await connect('tools_model'); tools = new ToolsModel(); });
after(disconnect);
beforeEach(async () => {
    await tools.modelDB.deleteMany({});
    await tools.modelDB.create([
        { name: 'HubSpot', tag: 'analytics', categories: ['Marketing Automation', 'CRM'] },
        { name: 'Mailchimp', tag: 'mx', categories: ['Email Marketing', 'Email Security'], hidden: false },
        { name: 'Agari', tag: 'mx', categories: ['Email Security'] },
        { name: 'Drift', tag: 'widgets', categories: ['Live Chat', 'Marketing Automation'], hidden: true },
        { name: 'C++ Runtime', tag: 'framework', categories: ['A/B Testing'] },
        { name: 'Orphan', tag: 'widgets', categories: [] },
        { name: 'NoField', tag: 'widgets' },
        { name: 'example.com', tag: 'domain', categories: ['WebSite'] }
    ]);
});

test('bulkSetVisibility applies the three states', async () => {
    const ids = (await tools.modelDB.find({ name: { $in: ['Agari', 'Drift', 'Mailchimp'] } })).map(d => String(d._id));

    let out = await tools.bulkSetVisibility(ids, 'show');
    assert.equal(out.matched, 3);
    assert.equal(out.tools.length, 3);
    assert.ok(out.tools.every(t => t.hidden === false));

    await tools.bulkSetVisibility(ids, 'hide');
    let docs = await tools.modelDB.find({ _id: { $in: ids } }).lean();
    assert.ok(docs.every(d => d.hidden === true));

    await tools.bulkSetVisibility(ids, 'default');
    docs = await tools.modelDB.find({ _id: { $in: ids } }).lean();
    assert.ok(docs.every(d => !('hidden' in d)));
});

test('app tools are never listed or updated', async () => {
    const site = await tools.modelDB.findOne({ name: 'example.com' });
    const out = await tools.bulkSetVisibility([String(site._id)], 'hide');
    assert.equal(out.matched, 0);
    assert.deepEqual(out.tools, []);
    assert.equal((await tools.modelDB.findById(site._id).lean()).hidden, undefined);
    assert.equal((await tools.queryTools({ name: 'example' })).total, 0);
    assert.equal((await tools.queryTools({ tag: 'domain' })).total, 0);
    assert.ok(!(await tools.getCategoryCounts()).rows.some(r => r.name === 'WebSite'));
});

test('bulkSetVisibility rejects an unknown state', async () => {
    await assert.rejects(tools.bulkSetVisibility([], 'maybe'), /Invalid state/);
});

test('queryTools filters by name literally (regex metacharacters)', async () => {
    assert.deepEqual((await tools.queryTools({ name: 'c++' })).list.map(t => t.name), ['C++ Runtime']);
    assert.equal((await tools.queryTools({ name: '.*' })).total, 0);
});

test('queryTools filters by category, no-category, tag and admin setting', async () => {
    const names = async (p) => (await tools.queryTools(p)).list.map(t => t.name);
    assert.deepEqual(await names({ category: 'Email Security' }), ['Agari', 'Mailchimp']);
    assert.deepEqual(await names({ category: 'A/B Testing' }), ['C++ Runtime']);
    assert.deepEqual(await names({ category: '(No category)' }), ['NoField', 'Orphan']);
    assert.deepEqual(await names({ tag: 'mx' }), ['Agari', 'Mailchimp']);
    assert.deepEqual(await names({ setting: 'show' }), ['Mailchimp']);
    assert.deepEqual(await names({ setting: 'hide' }), ['Drift']);
    assert.equal((await tools.queryTools({ setting: 'default' })).total, 5);
    assert.deepEqual(await names({ category: 'Email Security', setting: 'default' }), ['Agari']);
});

test('setting filter: explicit null counts as Default, false as Show', async () => {
    await tools.modelDB.collection.insertOne({ name: 'Nulled', tag: 'widgets', categories: ['Scheduling'], hidden: null });
    const names = async (p) => (await tools.queryTools(p)).list.map(t => t.name);
    assert.ok((await names({ setting: 'default' })).includes('Nulled'));
    assert.ok(!(await names({ setting: 'show' })).includes('Nulled'));
    assert.deepEqual(await names({ setting: 'show' }), ['Mailchimp']);
});

test('queryTools paginates and clamps bad numbers', async () => {
    const page = await tools.queryTools({ offset: '2', limit: '3' });
    assert.equal(page.total, 7); // example.com (domain) is excluded
    assert.deepEqual(page.list.map(t => t.name), ['Drift', 'HubSpot', 'Mailchimp']);
    const bad = await tools.queryTools({ offset: 'x', limit: '-4' });
    assert.equal(bad.offset, 0);
    assert.equal(bad.limit, 10);
});

test('getCategoryCounts counts tools per category and no-category tools', async () => {
    const out = await tools.getCategoryCounts();
    const row = out.rows.find(r => r.name === 'Marketing Automation');
    assert.equal(row.tools, 2);
    assert.deepEqual(row.examples.sort(), ['Drift', 'HubSpot']);
    assert.equal(out.noCategory.tools, 2);
    assert.ok(!out.rows.some(r => r.name === '(No category)'));
});

test('getTagCounts excludes app tags', async () => {
    const out = await tools.getTagCounts();
    assert.deepEqual(out.map(r => r.name).sort(), ['analytics', 'framework', 'mx', 'widgets']);
    assert.equal(out.find(r => r.name === 'widgets').tools, 3);
});

test('getBlockImpact counts tools that stay visible via a whitelisted category', async () => {
    assert.deepEqual(await tools.getBlockImpact({ category: 'Email Security' }, ['Marketing Automation']), { tools: 2, alsoWhitelisted: 0 });
    assert.deepEqual(await tools.getBlockImpact({ category: 'Live Chat' }, ['Marketing Automation']), { tools: 1, alsoWhitelisted: 1 });
    assert.deepEqual(await tools.getBlockImpact({ tag: 'analytics' }, ['CRM']), { tools: 1, alsoWhitelisted: 1 });
    assert.deepEqual(await tools.getBlockImpact({ tag: 'widgets' }, []), { tools: 3, alsoWhitelisted: 0 });
});

test('proceedTools registers new categories and tags without blocking', async () => {
    const categories = new CategoriesModel();
    const tags = new TagsModel();
    await categories.modelDB.deleteMany({});
    await tags.modelDB.deleteMany({});
    tools.updateInBackground = () => {}; // no logo downloads in tests

    await tools.proceedTools([
        { name: 'HubSpot', tag: 'analytics', categories: ['CRM', 'Brand New Cat'] },
        { name: 'Fresh Tool', tag: 'newtag', categories: ['Another New Cat'] },
        { name: 'site.io', tag: 'domain', categories: ['WebSite'] }
    ]);
    // registration is fire-and-forget; give it a moment
    await new Promise(r => setTimeout(r, 300));

    const catNames = (await categories.modelDB.find({}).lean()).map(d => d.name).sort();
    assert.deepEqual(catNames, ['Another New Cat', 'Brand New Cat', 'CRM', 'WebSite']);
    assert.ok((await categories.modelDB.find({}).lean()).every(d => d.firstSeen && !d.status));
    assert.deepEqual((await tags.modelDB.find({}).lean()).map(d => d.name).sort(), ['analytics', 'newtag']);
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `cd back && node --test test/rule-models.test.js test/tools-model.test.js`
Expected: FAIL — `Cannot find module '../db/models/Tags'`.

- [ ] **Step 4: Implement the base model and Tags**

`back/db/models/_named-rules.js`:

```js
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
```

`back/db/models/Tags.js`:

```js
const mongoose = require('mongoose');
const NamedRulesModel = require('./_named-rules');
const { APP_TAGS } = require('../../services/visibility-rules');

// BuiltWith tag rules. Block-only: tags are never whitelisted.
class TagsModel extends NamedRulesModel {
    constructor() {
        super('tags', ['blocked'], APP_TAGS);

        this.schema = mongoose.Schema({
            name: String,
            status: String,
            firstSeen: Date
        });

        this.initModel();
    }

    async getBlocked() {
        return this.namesWithStatus('blocked');
    }
}

module.exports = TagsModel;
```

- [ ] **Step 5: Update Categories**

In `back/db/models/Categories.js`: replace `const AbstaractModel = require('./_abstract');` with `const NamedRulesModel = require('./_named-rules');`, change the class header and constructor to:

```js
class CategoriesModel extends NamedRulesModel {
    constructor(){
        super('Categories', ['whitelisted', 'blocked']);

        this.schema = mongoose.Schema({
            name: String,
            toolsCount: Number, // stale snapshot from reload-tools-categories.js; not used for rules
            status: String,     // 'whitelisted' | 'blocked'; absent = Normal
            firstSeen: Date     // set only on categories registered by proceedTools
        });

        
        this.initModel();
    }
```

and add before the closing `}` of the class:

```js
    async getRules() {
        const results = await Promise.all([this.namesWithStatus('whitelisted'), this.namesWithStatus('blocked')]);
        return { whitelisted: results[0], blocked: results[1] };
    }
```

- [ ] **Step 6: Update Tools**

In `back/db/models/Tools.js`:

Add requires after `const CategoriesModel = require('./Categories');`:

```js
const TagsModel = require('./Tags');
const { NO_CATEGORY, APP_TAGS, escapeRegex } = require('../../services/visibility-rules');

const NO_CATEGORY_FILTER = { $or: [{ categories: { $exists: false } }, { categories: { $size: 0 } }] };
// Domain nodes and custom apps are outside visibility rules: never listed, counted or updated here.
const NOT_APP_TOOL = { tag: { $nin: APP_TAGS } };
// tools.hidden is the admin setting: true = Hide, false = Show, unset = Default.
const VISIBILITY_UPDATES = {
    show: { $set: { hidden: false } },
    hide: { $set: { hidden: true } },
    default: { $unset: { hidden: 1 } }
};

function toInt(value, fallback, min) {
    const n = parseInt(value, 10);
    return isNaN(n) || n < min ? fallback : n;
}
```

Schema: change `hidden: Boolean,` to `hidden: Boolean, // admin setting: true = Hide, false = Show, unset = Default (category/tag rules decide)`.

In `proceedTools`: delete `let catModel = new CategoriesModel();` and the dead block

```js
            if (dbItem.categories && dbItem.length) {
                catModel.proceedList(dbItem.categories)
            }
```

and change the end of the method to:

```js
        let res = await Promise.all(toDo);
        this.registerSeenNames(res);
        this.updateInBackground(res);
        return res;
    }

    // Non-blocking: newly seen categories/tags arrive as Normal for admin review.
    registerSeenNames(tools) {
        const categories = [];
        const tags = [];
        tools.forEach((tool) => {
            if (!tool) return;
            if (Array.isArray(tool.categories)) categories.push(...tool.categories);
            if (tool.tag) tags.push(tool.tag);
        });
        Promise.all([new CategoriesModel().registerSeen(categories), new TagsModel().registerSeen(tags)])
            .catch(err => console.error('[proceedTools] failed to register categories/tags', err));
    }
```

Replace `getList(offset, limit)` and `getByName(name, offset, limit)` with:

```js
    buildToolsFilter({ name, category, tag, setting } = {}) {
        const and = [NOT_APP_TOOL];
        if (name) and.push({ name: new RegExp(escapeRegex(name), 'i') });
        if (category === NO_CATEGORY) and.push(NO_CATEGORY_FILTER);
        else if (category) and.push({ categories: category });
        if (tag) and.push({ tag });
        if (setting === 'show') and.push({ hidden: false });
        else if (setting === 'hide') and.push({ hidden: true });
        else if (setting === 'default') and.push({ hidden: null }); // matches unset and null
        return { $and: and };
    }

    async queryTools(params = {}) {
        const offset = toInt(params.offset, 0, 0);
        const limit = toInt(params.limit, 10, 1);
        const filter = this.buildToolsFilter(params);

        const total = await this.modelDB.countDocuments(filter).exec();
        const list = await this.modelDB.find(filter).sort({ name: 1 }).skip(offset).limit(limit).exec();
        return {
            list: list.map(item => this.mapDocument(item)),
            total,
            offset,
            limit
        };
    }

    async getList(offset, limit) {
        return this.queryTools({ offset, limit });
    }

    async getByName(name, offset, limit){
        return this.queryTools({ name, offset, limit });
    }

    async bulkSetVisibility(ids, state) {
        const update = VISIBILITY_UPDATES[state];
        if (!update) throw new Error('Invalid state');

        const withTimestamp = Object.assign({}, update, { $set: Object.assign({}, update.$set, { updated: new Date() }) });
        const filter = { $and: [{ _id: { $in: ids } }, NOT_APP_TOOL] };
        const res = await this.modelDB.updateMany(filter, withTimestamp).exec();
        const tools = (await this.modelDB.find(filter).exec()).map(item => this.mapDocument(item));
        return { matched: res.n, modified: res.nModified, tools };
    }

    async getCategoryCounts() {
        const rows = await this.modelDB.aggregate([
            { $match: NOT_APP_TOOL },
            { $sort: { name: 1 } },
            { $unwind: '$categories' },
            { $group: { _id: '$categories', tools: { $sum: 1 }, examples: { $push: '$name' } } },
            { $project: { _id: 0, name: '$_id', tools: 1, examples: { $slice: ['$examples', 3] } } }
        ]).allowDiskUse(true).exec();

        const noCategoryFilter = this.buildToolsFilter({ category: NO_CATEGORY });
        const noCategoryTotal = await this.modelDB.countDocuments(noCategoryFilter).exec();
        const noCategoryExamples = await this.modelDB.find(noCategoryFilter, { name: 1 }).sort({ name: 1 }).limit(3).lean().exec();

        return {
            rows: rows.filter(row => row.name !== NO_CATEGORY),
            noCategory: { tools: noCategoryTotal, examples: noCategoryExamples.map(t => t.name) }
        };
    }

    async getTagCounts() {
        return this.modelDB.aggregate([
            { $match: { tag: { $nin: APP_TAGS.concat(['', null]) } } },
            { $sort: { name: 1 } },
            { $group: { _id: '$tag', tools: { $sum: 1 }, examples: { $push: '$name' } } },
            { $project: { _id: 0, name: '$_id', tools: 1, examples: { $slice: ['$examples', 3] } } }
        ]).allowDiskUse(true).exec();
    }

    // For the block confirm dialog: how many tools match, and how many stay visible
    // because they're also in a whitelisted category.
    async getBlockImpact(match, whitelisted) {
        const filter = this.buildToolsFilter(match.category ? { category: match.category } : { tag: match.tag });
        const results = await Promise.all([
            this.modelDB.countDocuments(filter).exec(),
            whitelisted.length
                ? this.modelDB.countDocuments({ $and: [filter, { categories: { $in: whitelisted } }] }).exec()
                : Promise.resolve(0)
        ]);
        return { tools: results[0], alsoWhitelisted: results[1] };
    }
```

(`getToolsListByName` is untouched.)

- [ ] **Step 7: Run tests to verify they pass**

Run: `cd back && npm test`
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add back/db/models/_named-rules.js back/db/models/Tags.js back/db/models/Categories.js back/db/models/Tools.js back/test/helpers/db.js back/test/rule-models.test.js back/test/tools-model.test.js
git commit -m "Add category/tag rule storage, three-state tool visibility, and admin tool queries

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: Apply rules at node creation, `isNew`, and category lists for the builder

**Files:**
- Modify: `back/db/models/ToolsNodes.js:1-104,154-238`, `back/core/controllers/blueprints.js:1-22,130-155,308-314`
- Test: `back/test/tools-nodes.test.js`

**Interfaces:**
- Consumes: `decideTool`, `isStale`, `loadRules` (Task 3); `CategoriesModel.getRules`, `TagsModel` (Task 4).
- Produces:
  - `createNodesForTools(blueprintId, tools, domain)` (new stack) and `filterToolsByNodes(blueprintId, tools, domain)` (domain/app added) save `hide: true` for rule-hidden tools and return every **new** node with `rule: 'show' | 'hide' | null` (not stored). `createNodesForTools` keeps at least 5 tools visible (rule hides stop once only 5 would remain, in tool order); `filterToolsByNodes` has no minimum.
  - Blueprint payload (`getDomainTools`, `getBluePrint`) gains `categoryRules: { whitelisted: string[], blocked: string[] }` (sidebar grouping only). `getDomainTools` sets `isNew: true` only in the branch that just called BuiltWith and created the stack's nodes.

- [ ] **Step 1: Write the failing test**

`back/test/tools-nodes.test.js`:

```js
const { test, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const { connect, disconnect } = require('./helpers/db');
const ToolsNodesModel = require('../db/models/ToolsNodes');
const CategoriesModel = require('../db/models/Categories');
const TagsModel = require('../db/models/Tags');

let nodes, categories, tags;
const blueprintId = new mongoose.Types.ObjectId();
const tool = (name, extra) => Object.assign({ id: new mongoose.Types.ObjectId(), name }, extra);
const old = new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString();

before(async () => {
    await connect('tools_nodes');
    nodes = new ToolsNodesModel(); categories = new CategoriesModel(); tags = new TagsModel();
});
after(disconnect);
beforeEach(async () => {
    await nodes.modelDB.deleteMany({}); await categories.modelDB.deleteMany({}); await tags.modelDB.deleteMany({});
    await categories.setStatus('Email Security', 'blocked');
    await categories.setStatus('Marketing Automation', 'whitelisted');
    await categories.setStatus('(No category)', 'blocked');
    await tags.setStatus('cms', 'blocked');
});

const sample = () => [
    tool('Agari', { categories: ['Email Security'], tag: 'mx' }),
    tool('Klaviyo', { categories: ['Email Security', 'Marketing Automation'], tag: 'mx' }),
    tool('Mailchimp', { categories: ['Email Security'], tag: 'mx', hidden: false }),
    tool('Webflow', { categories: ['Simple Website Builder'], tag: 'cms' }),
    tool('Calendly', { categories: ['Scheduling'], tag: 'widgets' }),
    tool('Orphan', { categories: [], tag: 'widgets' }),
    tool('Hidden One', { categories: ['Scheduling'], hidden: true }),
    tool('Old Whitelisted', { categories: ['Marketing Automation'], tag: 'widgets', end: old }),
    tool('site.io', { categories: ['WebSite'], tag: 'domain' })
];
const expected = {
    'Agari': [true, 'hide'], 'Klaviyo': [false, 'show'], 'Mailchimp': [false, 'show'], 'Webflow': [true, 'hide'],
    'Calendly': [false, null], 'Orphan': [true, 'hide'], 'Hidden One': [true, 'hide'],
    'Old Whitelisted': [false, null], 'site.io': [false, null]
};
const summary = (created, list) => Object.fromEntries(created.map((n) => {
    const t = list.find(x => String(x.id) === String(n.toolId));
    return [t.name, [n.hide, n.rule]];
}));

test('createNodesForTools (new stack) saves hide and returns rule per node', async () => {
    const list = sample();
    const created = await nodes.createNodesForTools(blueprintId, list, 'site.io');
    assert.deepEqual(summary(created, list), expected);
    const saved = await nodes.modelDB.find({ blueprintId }).lean();
    assert.equal(saved.filter(d => d.hide === true).length, 4);
    assert.ok(saved.every(d => !('rule' in d)));
});

test('createNodesForTools never rule-hides below 5 visible (in tool order)', async () => {
    const list = ['A', 'B', 'C', 'D', 'E', 'F', 'G'].map(n => tool(n, { categories: ['Email Security'], tag: 'mx' }));
    list.push(tool('Calendly', { categories: ['Scheduling'], tag: 'widgets' }));
    const created = await nodes.createNodesForTools(blueprintId, list);
    const s = summary(created, list);
    // 8 tools, 7 blocked: hide while more than 5 visible -> 3 hidden (A, B, C), 5 visible.
    assert.deepEqual(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'Calendly'].map(n => s[n][0]), [true, true, true, false, false, false, false, false]);
    assert.equal(s['D'][1], 'hide'); // spared by the minimum, decision still reported
});

test('filterToolsByNodes (domain added) applies the same rules, no minimum', async () => {
    const blocked = ['A', 'B', 'C', 'D', 'E', 'F'].map(n => tool(n, { categories: ['Email Security'], tag: 'mx' }));
    const added = await nodes.filterToolsByNodes(blueprintId, blocked, 'other.io');
    assert.ok(added.every(n => n.hide === true));
    await nodes.modelDB.deleteMany({});

    const list = sample();
    const created = await nodes.filterToolsByNodes(blueprintId, list, 'other.io');
    assert.deepEqual(summary(created, list), expected);
});

test('existing nodes are never re-evaluated or duplicated', async () => {
    const agari = tool('Agari', { categories: ['Email Security'] });
    await nodes.modelDB.create({ blueprintId, toolId: agari.id, hide: false });

    const created = await nodes.filterToolsByNodes(blueprintId, [agari]);
    assert.equal(created.length, 0);
    const docs = await nodes.modelDB.find({ blueprintId }).lean();
    assert.equal(docs.length, 1);
    assert.equal(docs[0].hide, false);
});

test('no category rules in the DB means nothing is hidden by rules', async () => {
    await categories.modelDB.deleteMany({}); await tags.modelDB.deleteMany({});
    const created = await nodes.createNodesForTools(blueprintId, [tool('Orphan', { categories: [] })]);
    assert.equal(created[0].hide, false);
    assert.equal(created[0].rule, null);
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `cd back && node --test test/tools-nodes.test.js`
Expected: FAIL — `rule` is `undefined` on every node; `createNodesForTools` hides nothing; `filterToolsByNodes` ignores whitelist/Show/tags/admin Hide.

- [ ] **Step 3: Implement in ToolsNodes**

At the top of `back/db/models/ToolsNodes.js` add after `var AbstaractModel = require('./_abstract');`:

```js
var CategoriesModel = require('./Categories');
var TagsModel = require('./Tags');
const { decideTool, isStale, loadRules } = require('../../services/visibility-rules');
```

Comment out the `BlockedCategories` array (keep the data, make it obviously dead): replace the line `const BlockedCategories = [` with

```js
/*
 * DEPRECATED (2026-10) — no longer used. Category/tag visibility rules now live in the database
 * (categories.status, tags.status), managed on the admin Categories page and seeded by
 * back/migrate-visibility-rules.js from back/db/seed/visibility-rules-2026-10.json.
 * Kept commented out for reference only.
 *
const BlockedCategories = [
```

and the array's closing `]` (the line after `'Visitor Count Tracking'`) with

```js
]
*/
```

Check: `node -e "require('./back/db/models/ToolsNodes')"` must not throw (no `*/` inside the array — confirm with `grep -c '\*/' back/db/models/ToolsNodes.js` → `1`).

Delete the `isBlockedCat` method.

Add a helper method to the class (above `createNodesForTools`):

```js
    // Admin visibility rules for nodes being created now. Returns { [toolId]: 'show' | 'hide' | null }.
    async decideNewNodes(tools) {
        const rules = await loadRules(new CategoriesModel(), new TagsModel());
        const decisions = {};
        tools.forEach((tool) => {
            decisions[String(tool.id)] = decideTool(tool, rules, isStale(tool.end)).state;
        });
        return decisions;
    }
```

In `createNodesForTools`, add as the first lines:

```js
        const decisions = await this.decideNewNodes(tools);
        // New stack: like the old first-load pass, rule hides never leave fewer than 5 tools visible.
        let hiddenCount = 0;
```

change the node data in the first `async.map` from

```js
            let data = {
                blueprintId: blueprintId,
                toolId: item.id
            }
```

to

```js
            let hide = false;
            if (decisions[String(item.id)] === 'hide' && tools.length - hiddenCount > MIN_VISIBLE) {
                hide = true;
                hiddenCount++;
            }
            let data = {
                blueprintId: blueprintId,
                toolId: item.id,
                hide: hide
            }
```

(`async.map` from the `async` package runs the iteratee synchronously here — the callback is called inline — so `hiddenCount` follows tool order. Add `const MIN_VISIBLE = 5;` below the requires.)

and the final mapping from

```js
        let mappedDocs = await async.map(docs, (item, cb)=>{ cb( null, this.mapDocument(item) ); });
```

(the one inside `createNodesForTools`) to

```js
        let mappedDocs = await async.map(docs, (item, cb)=>{
            const node = this.mapDocument(item);
            node.rule = decisions[String(node.toolId)] || null;
            cb( null, node );
        });
```

In `filterToolsByNodes`, after `const toolsToCreate = ...;` add:

```js
        const decisions = await this.decideNewNodes(toolsToCreate);
```

and replace

```js
                const isInArray = await this.isBlockedCat(tool.categories);
                const data = {
                    blueprintId,
                    toolId: tool.id,
                    hide: isInArray,
```

with

```js
                const rule = decisions[String(tool.id)] || null;
                const data = {
                    blueprintId,
                    toolId: tool.id,
                    hide: rule === 'hide',
```

and after `node.tool = tool;` add `node.rule = rule;`.

- [ ] **Step 4: Implement in the blueprints controller**

In `back/core/controllers/blueprints.js` add the require `const CategoriesModel = require('../../db/models/Categories');` and in the constructor `this._categories = new CategoriesModel();`.

Add a method after the constructor:

```js
    // Whitelisted/blocked category names for the builder sidebar (grouping and collapse only;
    // node visibility was decided when the nodes were created).
    attachCategoryRules(data, cb) {
        this._categories.getRules().then((rules) => {
            data.categoryRules = rules;
            cb(null, data);
        }).catch((err) => {
            console.log(err);
            data.categoryRules = { whitelisted: [], blocked: [] };
            cb(null, data);
        });
    }
```

In **both** waterfalls (`getDomainTools` ~line 131 and `getBluePrint` ~line 309), insert directly after the `getHiddenTools()` step:

```js
            (data, cb) => this.attachCategoryRules(data, cb),
```

In `getDomainTools`, in the new-blueprint branch, directly after
`console.log(`[Blueprint] ${domain}: new blueprint — calling BuiltWith API`);` add:

```js
                    // Tells the builder to run its first-load pass. Only set here, so existing stacks are never re-processed.
                    data.isNew = true;
```

- [ ] **Step 5: Run tests**

Run: `cd back && npm test`
Expected: PASS.

Run: `cd back && PATH=~/.nvm/versions/node/v16.15.0/bin:$PATH node -e "require('./core/router')" && echo router-ok`
Expected: `router-ok`.

Run: `grep -n "BlockedCategories\|isBlockedCat" back/db/models/ToolsNodes.js`
Expected: only the commented-out declaration line.

- [ ] **Step 6: Commit**

```bash
git add back/db/models/ToolsNodes.js back/core/controllers/blueprints.js back/test/tools-nodes.test.js
git commit -m "Apply visibility rules when creating stack nodes; flag new stacks for the builder

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6: Admin API — bulk tool visibility, categories, tags, block impact

**Files:**
- Create: `back/services/rule-lists.js`, `back/core/controllers/visibility-rules.js`, `back/test/rule-lists.test.js`, `back/test/tools-controller.test.js`, `back/test/visibility-controller.test.js`
- Modify: `back/core/controllers/tools.js`, `back/core/router.js`

**Interfaces:**
- Consumes: Task 3 + Task 4 model methods.
- Produces (all behind `passport.authenticate('jwt')` + `requireAdmin`):
  - `POST /tools/bulkSetVisibility` body `{ ids: string[] (1–500 ObjectIds), state: 'default'|'show'|'hide' }` → `{ result: { matched, modified, tools } }`; each tool carries `result: { state, reason, detail? }` (from `decideTool`).
  - `GET /admin/tools?name&category&tag&setting&offset&limit` → `{ result: { list, total, offset, limit, rules: { whitelisted, blocked, blockedTags } } }`; each tool in `list` carries `result: { state, reason, detail? }` — the "Result on new stacks" column. `/admin/tools/search` = same with required `name`.
  - `POST /tools/updateVisibility/:id` (existing, builder's global hide toggle) → `flag` true/false = Hide/Show (`hidden: true/false`, as today); returns the updated tool.
  - `GET /admin/categories?search&status=all|new|whitelisted|blocked|normal&offset&limit` → `{ result: { list: Row[], total, counts: { all, new, whitelisted, blocked, normal }, noCategory: Row } }`, `Row = { name, tools, examples: string[], status: 'whitelisted'|'blocked'|'normal', isNew: boolean }`.
  - `POST /admin/categories/status` body `{ name, status: 'whitelisted'|'blocked'|null }` → `{ result: 'Ok' }`.
  - `GET /admin/tags?search&status=all|new|blocked|normal&offset&limit` → `{ result: { list, total, counts: { all, new, blocked, normal } } }`.
  - `POST /admin/tags/status` body `{ name, status: 'blocked'|null }` → `{ result: 'Ok' }`.
  - `GET /admin/block-impact?category=X` or `?tag=X` → `{ result: { tools, alsoWhitelisted } }`.
  - `buildRuleList(rows, meta, { search, status, offset, limit, now, statuses, exclude }) → { list, total, counts }`.

- [ ] **Step 1: Write failing tests**

`back/test/rule-lists.test.js`:

```js
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
```

`back/test/tools-controller.test.js`:

```js
const { test } = require('node:test');
const assert = require('node:assert/strict');
const ToolsController = require('../core/controllers/tools');
const { fakeRes } = require('./helpers/http');

const validId = '5f2b6c7d8e9fa0b1c2d3e4f5';

function controllerWithFakeModel() {
    const c = new ToolsController();
    c.calls = [];
    c.model = {
        bulkSetVisibility: async (ids, state) => {
            c.calls.push([ids, state]);
            const hidden = state === 'default' ? undefined : state === 'hide';
            return { matched: ids.length, modified: ids.length, tools: ids.map(id => ({ id, categories: ['CRM'], hidden })) };
        }
    };
    c.categories = { getRules: async () => ({ whitelisted: ['CRM'], blocked: [] }) };
    c.tags = { getBlocked: async () => [] };
    return c;
}

const bad = [
    ['ids missing', { state: 'hide' }],
    ['ids not array', { ids: validId, state: 'hide' }],
    ['ids empty', { ids: [], state: 'hide' }],
    ['ids too many', { ids: Array(501).fill(validId), state: 'hide' }],
    ['invalid ObjectId', { ids: [validId, 'nope'], state: 'hide' }],
    ['non-string id', { ids: [{ $gt: '' }], state: 'hide' }],
    ['unknown state', { ids: [validId], state: 'maybe' }]
];

for (const [name, body] of bad) {
    test('bulkSetVisibility 400: ' + name, async () => {
        const c = controllerWithFakeModel();
        const res = fakeRes();
        await c.bulkSetVisibility({ body, user: { role: 0 } }, res);
        assert.equal(res.statusCode, 400);
        assert.equal(c.calls.length, 0);
    });
}

test('bulkSetVisibility de-duplicates ids and writes once', async () => {
    const c = controllerWithFakeModel();
    const res = fakeRes();
    await c.bulkSetVisibility({ body: { ids: [validId, validId], state: 'show' }, user: { role: 0 } }, res);
    assert.equal(res.statusCode, 200);
    assert.deepEqual(c.calls, [[[validId], 'show']]);
    assert.equal(res.body.result.matched, 1);
    assert.deepEqual(res.body.result.tools[0].result, { state: 'show', reason: 'admin-show' });
});

test('bulkSetVisibility default: result comes from category rules', async () => {
    const c = controllerWithFakeModel();
    const res = fakeRes();
    await c.bulkSetVisibility({ body: { ids: [validId], state: 'default' }, user: { role: 0 } }, res);
    assert.deepEqual(res.body.result.tools[0].result, { state: 'show', reason: 'whitelisted', detail: 'CRM' });
});

test('updateVisibility maps flag to hide/show and returns the tool', async () => {
    const c = controllerWithFakeModel();
    let res = fakeRes();
    await c.updateVisibility({ params: { id: validId }, body: { node: { tool: { id: validId } }, flag: true } }, res);
    assert.deepEqual(c.calls[0], [[validId], 'hide']);
    assert.equal(res.body.result.id, validId);
    assert.equal(res.body.result.hidden, true);

    res = fakeRes();
    await c.updateVisibility({ params: { id: validId }, body: { node: { tool: { id: validId } }, flag: false } }, res);
    assert.deepEqual(c.calls[1], [[validId], 'show']);
    assert.equal(res.body.result.hidden, false);
});
```

`back/test/visibility-controller.test.js`:

```js
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { connect, disconnect } = require('./helpers/db');
const { fakeRes } = require('./helpers/http');
const VisibilityController = require('../core/controllers/visibility-rules');

let c;
before(async () => {
    await connect('visibility_controller');
    c = new VisibilityController();
    await c.tools.modelDB.create([
        { name: 'Agari', tag: 'mx', categories: ['Email Security'] },
        { name: 'Klaviyo', tag: 'mx', categories: ['Email Security', 'Marketing Automation'] },
        { name: 'Orphan', tag: 'widgets', categories: [] },
        { name: 'site.io', tag: 'domain', categories: ['WebSite'] }
    ]);
});
after(disconnect);

const call = async (method, req) => { const res = fakeRes(); await c[method](Object.assign({ query: {}, body: {} }, req), res); return res; };

test('set and list category statuses', async () => {
    assert.equal((await call('setCategoryStatus', { body: { name: 'Marketing Automation', status: 'whitelisted' } })).body.result, 'Ok');
    await call('setCategoryStatus', { body: { name: '(No category)', status: 'blocked' } });

    const res = await call('getCategories', { query: { status: 'all' } });
    const r = res.body.result;
    assert.deepEqual(r.list.map(x => [x.name, x.tools, x.status]), [
        ['Email Security', 2, 'normal'], ['Marketing Automation', 1, 'whitelisted']
    ]); // site.io (domain) is not counted, so WebSite isn't listed
    assert.deepEqual(r.noCategory, { name: '(No category)', tools: 1, examples: ['Orphan'], status: 'blocked', isNew: false });
    assert.equal(r.counts.whitelisted, 1);
});

test('category status validation', async () => {
    for (const body of [{ name: '', status: 'blocked' }, { name: 'X', status: 'hidden' }, { name: 'x'.repeat(201), status: 'blocked' }, { name: ['X'], status: 'blocked' }, { status: 'blocked' }]) {
        assert.equal((await call('setCategoryStatus', { body })).statusCode, 400);
    }
    assert.equal((await call('setCategoryStatus', { body: { name: 'Email Security', status: null } })).statusCode, 200);
});

test('tags: block-only, app tags rejected, listed without app tags', async () => {
    assert.equal((await call('setTagStatus', { body: { name: 'mx', status: 'whitelisted' } })).statusCode, 400);
    assert.equal((await call('setTagStatus', { body: { name: 'domain', status: 'blocked' } })).statusCode, 400);
    assert.equal((await call('setTagStatus', { body: { name: 'mx', status: 'blocked' } })).statusCode, 200);
    const r = (await call('getTags', {})).body.result;
    assert.deepEqual(r.list.map(x => [x.name, x.status]), [['mx', 'blocked'], ['widgets', 'normal']]);
    assert.deepEqual(r.counts, { all: 2, new: 0, blocked: 1, normal: 1 });
});

test('block impact', async () => {
    let res = await call('getBlockImpact', { query: { category: 'Email Security' } });
    assert.deepEqual(res.body.result, { tools: 2, alsoWhitelisted: 1 });
    res = await call('getBlockImpact', { query: { tag: 'mx' } });
    assert.deepEqual(res.body.result, { tools: 2, alsoWhitelisted: 1 });
    res = await call('getBlockImpact', { query: {} });
    assert.equal(res.statusCode, 400);
});
```

- [ ] **Step 2: Run to verify they fail**

Run: `cd back && node --test test/rule-lists.test.js test/tools-controller.test.js test/visibility-controller.test.js`
Expected: FAIL — missing modules / `c.bulkSetVisibility is not a function`.

- [ ] **Step 3: Implement `rule-lists`**

`back/services/rule-lists.js`:

```js
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
```

- [ ] **Step 4: Implement the visibility-rules controller**

`back/core/controllers/visibility-rules.js`:

```js
const ToolsModel = require('../../db/models/Tools');
const CategoriesModel = require('../../db/models/Categories');
const TagsModel = require('../../db/models/Tags');
const { buildRuleList } = require('../../services/rule-lists');
const { NO_CATEGORY, APP_TAGS } = require('../../services/visibility-rules');

const MAX_NAME_LENGTH = 200;

function badRequest(res, message) {
    return res.status(400).json({ result: 'Error', message });
}

function serverError(res, err) {
    console.log(err);
    return res.status(500).json({ result: 'Error', message: 'Server error' });
}

function validName(name) {
    return typeof name === 'string' && name.trim() !== '' && name.length <= MAX_NAME_LENGTH;
}

// Admin endpoints for category and tag rules (Categories page, both tabs).
class VisibilityRules {
    constructor() {
        this.tools = new ToolsModel();
        this.categories = new CategoriesModel();
        this.tags = new TagsModel();
    }

    async getCategories(req, res) {
        try {
            const results = await Promise.all([this.tools.getCategoryCounts(), this.categories.getMeta()]);
            const counts = results[0];
            const meta = results[1];
            const data = buildRuleList(counts.rows, meta, {
                search: req.query.search,
                status: req.query.status,
                offset: req.query.offset,
                limit: req.query.limit,
                statuses: ['whitelisted', 'blocked'],
                exclude: [NO_CATEGORY]
            });
            const noCategoryMeta = meta.get(NO_CATEGORY);
            data.noCategory = {
                name: NO_CATEGORY,
                tools: counts.noCategory.tools,
                examples: counts.noCategory.examples,
                status: noCategoryMeta && noCategoryMeta.status ? noCategoryMeta.status : 'normal',
                isNew: false
            };
            res.json({ result: data });
        } catch (err) {
            serverError(res, err);
        }
    }

    async setCategoryStatus(req, res) {
        const name = req.body.name;
        const status = req.body.status === undefined ? null : req.body.status;
        if (!validName(name)) return badRequest(res, 'Invalid name');
        if (status !== null && status !== 'whitelisted' && status !== 'blocked') return badRequest(res, 'Invalid status');
        try {
            await this.categories.setStatus(name, status);
            res.json({ result: 'Ok' });
        } catch (err) {
            serverError(res, err);
        }
    }

    async getTags(req, res) {
        try {
            const results = await Promise.all([this.tools.getTagCounts(), this.tags.getMeta()]);
            const data = buildRuleList(results[0], results[1], {
                search: req.query.search,
                status: req.query.status,
                offset: req.query.offset,
                limit: req.query.limit,
                statuses: ['blocked'],
                exclude: APP_TAGS.concat([''])
            });
            res.json({ result: data });
        } catch (err) {
            serverError(res, err);
        }
    }

    async setTagStatus(req, res) {
        const name = req.body.name;
        const status = req.body.status === undefined ? null : req.body.status;
        if (!validName(name) || APP_TAGS.includes(name)) return badRequest(res, 'Invalid name');
        if (status !== null && status !== 'blocked') return badRequest(res, 'Invalid status');
        try {
            await this.tags.setStatus(name, status);
            res.json({ result: 'Ok' });
        } catch (err) {
            serverError(res, err);
        }
    }

    async getBlockImpact(req, res) {
        const category = req.query.category;
        const tag = req.query.tag;
        if (!validName(category) && !validName(tag)) return badRequest(res, 'category or tag is required');
        try {
            const rules = await this.categories.getRules();
            const match = validName(category) ? { category } : { tag };
            res.json({ result: await this.tools.getBlockImpact(match, rules.whitelisted) });
        } catch (err) {
            serverError(res, err);
        }
    }
}

module.exports = VisibilityRules;
```

- [ ] **Step 5: Update the tools controller**

Replace `back/core/controllers/tools.js` with:

```js
const mongoose = require('mongoose');
const ToolsModels = require('../../db/models/Tools');
const CategoriesModel = require('../../db/models/Categories');
const TagsModel = require('../../db/models/Tags');
const { loadRules, decideTool } = require('../../services/visibility-rules');

const STATES = ['default', 'show', 'hide'];
const MAX_BULK_IDS = 500;

class Tools {
    constructor(){
        this.model = new ToolsModels();    
        this.categories = new CategoriesModel();
        this.tags = new TagsModel();
    }

    // Builder's per-node "hide globally" toggle (admins only): flag true = Hide, false = Show
    // (hidden true/false, same values it wrote before). App tools are skipped by the model.
    async updateVisibility(req, res, next){
        const toolId = req.body.node && req.body.node.tool && req.body.node.tool.id;
        const flag = req.body.flag;

        if (!toolId || typeof flag !== 'boolean' || !mongoose.Types.ObjectId.isValid(toolId)) {
            return res.status(400).json({ result: "Error", message: "incorrect data" });
        }

        try {
            const out = await this.model.bulkSetVisibility([String(toolId)], flag ? 'hide' : 'show');
            res.json({ result: out.tools[0] || null });
        } catch (err) {
            console.log(err);
            res.status(500).json({ result: "Error", message: err.message });
        }
    }

    async bulkSetVisibility(req, res, next) {
        const ids = req.body.ids;
        const state = req.body.state;

        if (!Array.isArray(ids) || ids.length === 0 || ids.length > MAX_BULK_IDS) {
            return res.status(400).json({ result: 'Error', message: 'ids must be an array of 1-' + MAX_BULK_IDS + ' tool ids' });
        }
        if (!ids.every(id => typeof id === 'string' && mongoose.Types.ObjectId.isValid(id))) {
            return res.status(400).json({ result: 'Error', message: 'Invalid tool id' });
        }
        if (!STATES.includes(state)) {
            return res.status(400).json({ result: 'Error', message: 'Invalid state' });
        }

        try {
            const result = await this.model.bulkSetVisibility(Array.from(new Set(ids)), state);
            result.tools = await this.withResults(result.tools);
            res.json({ result });
        } catch (err) {
            console.log(err);
            res.status(500).json({ result: 'Error', message: 'Server error' });
        }
    }

    async listTools(req, res, name) {
        try {
            const data = await this.model.queryTools({
                name,
                category: req.query.category,
                tag: req.query.tag,
                setting: req.query.setting,
                offset: req.query.offset,
                limit: req.query.limit
            });
            const rules = await loadRules(this.categories, this.tags);
            data.list = this.attachResults(data.list, rules);
            data.rules = rules;
            res.json({ result: data });
        } catch (err) {
            console.log(err);
            res.status(500).json({ result: 'Error', message: 'Server error' });
        }
    }

    // "Result on new stacks" for the Tools page — what decideTool would do at node creation
    // (ignoring staleness, which depends on the stack).
    attachResults(tools, rules) {
        return tools.map(tool => Object.assign({}, tool, { result: decideTool(tool, rules) }));
    }

    async withResults(tools) {
        return this.attachResults(tools, await loadRules(this.categories, this.tags));
    }

    getTools(req, res, next) {
        const name = typeof req.query.name === 'string' ? req.query.name.trim() : '';
        return this.listTools(req, res, name);
    }

    getByName(req, res, next) {
        const name = typeof req.query.name === 'string' ? req.query.name.trim() : '';
        if (!name) {
            return res.status(400).json({ result: 'Error', message: 'Bad Request' });
        }
        return this.listTools(req, res, name);
    }
}

module.exports = Tools;
```

(`ToolsServices`/`async` requires were unused — removed. Confirm with `grep -n "ToolsServices\|async\." back/core/controllers/tools.js` before deleting.)

- [ ] **Step 6: Routes**

In `back/core/router.js` add `const VisibilityRules = require('./controllers/visibility-rules');` with the other controllers, `const visibilityRules = new VisibilityRules();` after `const users = new Users();`, and after the `/admin/tools/search` route:

```js
router.post('/tools/bulkSetVisibility', passport.authenticate('jwt', { session: false }), requireAdmin, tools.bulkSetVisibility.bind(tools));
router.get('/admin/categories', passport.authenticate('jwt', { session: false }), requireAdmin, visibilityRules.getCategories.bind(visibilityRules));
router.post('/admin/categories/status', passport.authenticate('jwt', { session: false }), requireAdmin, visibilityRules.setCategoryStatus.bind(visibilityRules));
router.get('/admin/tags', passport.authenticate('jwt', { session: false }), requireAdmin, visibilityRules.getTags.bind(visibilityRules));
router.post('/admin/tags/status', passport.authenticate('jwt', { session: false }), requireAdmin, visibilityRules.setTagStatus.bind(visibilityRules));
router.get('/admin/block-impact', passport.authenticate('jwt', { session: false }), requireAdmin, visibilityRules.getBlockImpact.bind(visibilityRules));
```

- [ ] **Step 7: Run tests**

Run: `cd back && npm test`
Expected: PASS.

Run: `cd back && PATH=~/.nvm/versions/node/v16.15.0/bin:$PATH node -e "require('./core/router')" && echo router-ok`
Expected: `router-ok`.

- [ ] **Step 8: Commit**

```bash
git add back/services/rule-lists.js back/core/controllers/visibility-rules.js back/core/controllers/tools.js back/core/router.js back/test/rule-lists.test.js back/test/tools-controller.test.js back/test/visibility-controller.test.js
git commit -m "Add admin API for bulk tool visibility and category/tag rules

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 7: Migration script

**Files:**
- Create: `back/migrate-visibility-rules.js`, `back/test/migrate-visibility-rules.test.js`

**Interfaces:**
- Consumes: seed JSON (Task 2), models (Task 4), `NO_CATEGORY`, `APP_TAGS`.
- Produces: `migrate({ snapshot?, apply = false, log = console.log }) → Promise<{ categoryWrites, tagWrites, tagRegistrations, toHide: string[], unmatched: string[], inWhitelisted: string[], skippedShow: string[], verify }>`; CLI `node migrate-visibility-rules.js --db <name> [--apply]`.

- [ ] **Step 1: Write the failing test**

`back/test/migrate-visibility-rules.test.js`:

```js
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { connect, disconnect } = require('./helpers/db');
const { migrate } = require('../migrate-visibility-rules');
const CategoriesModel = require('../db/models/Categories');
const TagsModel = require('../db/models/Tags');
const ToolsModel = require('../db/models/Tools');

const snapshot = {
    whitelistedCategories: ['CRM', 'Visitor Count Tracking'],
    blockedCategories: ['Fonts', 'Visitor Count Tracking', 'Email Security', 'Fonts'],
    blockedTags: ['cms', 'hosting'],
    droppedTags: ['feed'],
    hiddenToolNames: ['Facebook Signal', 'Admin Shown', 'Whitelisted Listed', 'Not In DB', 'Facebook Signal']
};
const silent = () => {};
let categories, tags, tools;

before(async () => {
    await connect('migrate');
    categories = new CategoriesModel(); tags = new TagsModel(); tools = new ToolsModel();
    await categories.modelDB.create([{ name: 'Fonts', toolsCount: 9 }, { name: 'Email Security', status: 'whitelisted' }]);
    await tools.modelDB.create([
        { name: 'Facebook Signal', tag: 'analytics', categories: ['Advertising'] },
        { name: 'Facebook Signal', tag: 'analytics', categories: ['Advertising'] },
        { name: 'Admin Shown', tag: 'cms', categories: ['Fonts'], hidden: false },
        { name: 'Whitelisted Listed', tag: 'widgets', categories: ['CRM'] },
        { name: 'Other', tag: 'feeds', categories: [] },
        { name: 'site.io', tag: 'domain', categories: ['WebSite'] }
    ]);
});
after(disconnect);

test('dry run reports and writes nothing', async () => {
    const out = await migrate({ snapshot, apply: false, log: silent });
    assert.deepEqual(out.categoryWrites.map(w => w.name + ':' + w.status).sort(),
        ['(No category):blocked', 'CRM:whitelisted', 'Fonts:blocked', 'Visitor Count Tracking:whitelisted']);
    assert.deepEqual(out.tagWrites.sort(), ['cms', 'hosting']);
    assert.deepEqual(out.tagRegistrations.sort(), ['analytics', 'feeds', 'widgets']);
    assert.deepEqual(out.unmatched, ['Not In DB']);
    assert.deepEqual(out.skippedShow, ['Admin Shown']);
    assert.deepEqual(out.inWhitelisted, ['Whitelisted Listed']);
    assert.equal(await categories.modelDB.countDocuments({ status: { $exists: true } }), 1);
    assert.equal(await tags.modelDB.countDocuments({}), 0);
    assert.equal(await tools.modelDB.countDocuments({ hidden: true }), 0);
});

test('apply writes, never overwrites an admin status, skips Show tools', async () => {
    const out = await migrate({ snapshot, apply: true, log: silent });
    const rules = await categories.getRules();
    assert.deepEqual(rules.whitelisted, ['CRM', 'Email Security', 'Visitor Count Tracking']);
    assert.deepEqual(rules.blocked, ['(No category)', 'Fonts']);
    assert.equal((await categories.modelDB.findOne({ name: 'Fonts' }).lean()).toolsCount, 9);
    assert.deepEqual(await tags.getBlocked(), ['cms', 'hosting']);
    assert.ok((await tags.modelDB.find({ name: { $in: ['analytics', 'feeds', 'widgets'] } }).lean()).every(d => !d.status && !d.firstSeen));
    assert.equal(await tools.modelDB.countDocuments({ name: 'Facebook Signal', hidden: true }), 2);
    assert.equal(await tools.modelDB.countDocuments({ name: 'Whitelisted Listed', hidden: true }), 1);
    assert.equal((await tools.modelDB.findOne({ name: 'Admin Shown' }).lean()).hidden, false); // Show kept
    assert.deepEqual(out.verify.actual, { blockedCategories: 1, whitelistedCategories: 3, blockedTags: 2 });
});

test('rerun is a no-op', async () => {
    const out = await migrate({ snapshot, apply: true, log: silent });
    assert.equal(out.categoryWrites.length, 0);
    assert.equal(out.tagWrites.length, 0);
    assert.equal(out.tagRegistrations.length, 0);
    assert.equal(out.toHide.length, 0);
    assert.equal(await tags.modelDB.countDocuments({}), 5);
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `cd back && node --test test/migrate-visibility-rules.test.js`
Expected: FAIL — `Cannot find module '../migrate-visibility-rules'`.

- [ ] **Step 3: Implement**

`back/migrate-visibility-rules.js`:

```js
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
```

Note the test expectation `whitelistedCategories: 3` — `Email Security` was already whitelisted by an "admin" and stays so; `blockedCategories: 1` because `Email Security` is skipped (admin status) and `(No category)` is excluded from the count.

- [ ] **Step 4: Run tests**

Run: `cd back && npm test`
Expected: PASS.

- [ ] **Step 5: Dry-run against the real seed on a throwaway copy of local data**

```bash
mongodump --quiet --db marchtach --out <scratchpad>/dump-marchtach
mongorestore --quiet --nsFrom 'marchtach.*' --nsTo 'marchtach_migrate_check.*' <scratchpad>/dump-marchtach
cd back && PATH=~/.nvm/versions/node/v16.15.0/bin:$PATH node migrate-visibility-rules.js --db marchtach_migrate_check --apply
mongo marchtach_migrate_check --quiet --eval 'db.dropDatabase()'
```
Expected: `Verify: {"blockedCategories":92,"whitelistedCategories":7,"blockedTags":11} OK`.

- [ ] **Step 6: Commit**

```bash
git add back/migrate-visibility-rules.js back/test/migrate-visibility-rules.test.js
git commit -m "Add migration script for hardcoded visibility lists

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 8: Stack builder — run first-load logic only for new stacks, use server rule decisions, retire hardcoded lists

The builder keeps its existing logic. Only three things change: **when** the first-load pass runs (`isNew` instead of `hidden === 0`), **what** it checks (the server's `node.rule` instead of the hardcoded lists), and where the sidebar gets its whitelisted/blocked category names (the blueprint payload instead of `config.ts`).

**Files:**
- Modify: `front/src/app/modules/blueprint/pages/build-stack/build-stack.component.ts:22,40-75,240-317,495-510,1068-1075`, `front/src/app/modules/blueprint/pages/build-stack/build-stack.component.html:164-175`, `front/src/app/modules/blueprint/components/tools-list/tools-list.component.ts:5,19-23,117,145,167,181-182`, `front/src/app/shared/models/tool.ts`, `front/src/app/core/config.ts:1-14,15-~362,365-~460,470-478`

**Interfaces:**
- Consumes (Task 5): `data.isNew?: boolean`, `data.categoryRules: { whitelisted: string[], blocked: string[] }`, new nodes carry `rule: 'show' | 'hide' | null` and server-set `hide`.
- Produces: `ToolsListComponent` `@Input() categoryRules: { whitelisted: string[], blocked: string[] }`; `BluePrintTool.rule?`.

What stays exactly as today: stale (90 days) and other-domain soft hiding, analytics exemption (unless stale), never hiding below 5 visible, the 50-cap trim sparing the stack's own domain, the stack-size gate (soft pass only when more than 10 tools are visible), the add-domain 40-new-visible cap. Tools the server marked `rule === 'show'` (admin Show, or a whitelisted category and not stale) are spared everywhere the whitelist was spared before.

- [ ] **Step 1: Models**

In `front/src/app/shared/models/tool.ts`:
- `Tool`: change `hidden: Boolean;` to `hidden?: boolean | null; // admin setting: true = Hide, false = Show, null/absent = Default`.
- `BluePrintTool`: after `hiddenGlobally?: boolean;` add `rule?: 'show' | 'hide' | null; // admin rule decision, only on nodes the server just created`.
- `BluePrintResp`: after `nodes: BluePrintTool[];` add `isNew?: boolean;` and `categoryRules?: { whitelisted: string[], blocked: string[] };`.

- [ ] **Step 2: build-stack — inputs from the server**

Delete line 22: `import { forbiddenTags, hiddenCategories, forbiddenTools, WhitelistCategories } from '../../../../core/config';`.

Add a property after `globalHiddenTools: Tool[] = [];`:

```ts
  categoryRules: { whitelisted: string[], blocked: string[] } = { whitelisted: [], blocked: [] };
```

In `proceedBluePrintData`, after `this.toolsHiddenGlobally$.next({nodes: data.hiddenTools});` add:

```ts
    this.categoryRules = data.categoryRules || { whitelisted: [], blocked: [] };
```

In `build-stack.component.html`, add to `<app-tools-list ...>` after `[addedNewNode]="addedNewNode$"`:

```html
            [categoryRules]="categoryRules"
```

- [ ] **Step 3: build-stack — first-load trigger**

In `proceedBluePrintData` replace

```ts
    if (data.nodes.length - hidden > 10 && hidden === 0) {
      this.proceedNodes(data.nodes.length, hidden);
    } else {
      this.completedProceedNodes();
    }
```

with

```ts
    // First load of a stack the server just created (isNew). The server already applied the admin
    // rules to its nodes; proceedNodes adds the soft rules. Existing stacks are never re-processed.
    if (data.isNew && data.nodes.length - hidden > 10) {
      this.proceedNodes(data.nodes.length, hidden);
    } else {
      this.completedProceedNodes();
    }
```

- [ ] **Step 4: build-stack — soft rules use the server's decision**

Replace the whole `proceedNodes` method with:

```ts
  // Soft rules for a new stack. Admin rules (Show/Hide, whitelisted/blocked categories, blocked
  // tags) were applied by the server when it created the nodes: node.hide is already set, and
  // node.rule === 'show' marks tools that must stay visible (admin Show or whitelisted).
  private proceedNodes(all, hidden, force?) {

    if (force) {
      // Still more than 50 visible: trim, sparing the stack's own domain and rule-shown tools.
      this.nodesList.forEach((nodeId) => {
        const item = this.nodes[nodeId];
        if (!item.hide && all - hidden > 50 ) {
          if (item.tool.name !== this.domain && item.rule !== 'show') {
            item.hide = true;
            hidden++;
            this.nodesForUpdate.push(item.id);
          }
        }
      });

      this.completedProceedNodes();
    } else {
      this.nodesList.forEach((nodeId) => {
        const item = this.nodes[nodeId];
        let oldTool = false;
        if (item.end) {
          const endDate = new Date(item.end);
          const diff = Date.now() - endDate.getTime();
          if (diff > 7776000000) {
            oldTool = true;
          }
        }

        const otherDomain = item.tool.tag == 'domain'
          && !item.tool.name.replace(/^www\./i, "").toLowerCase().includes(this.blueprint.domain.replace(/^www\./i, "").toLowerCase());

        // Stale tools and other domains' nodes; analytics only when stale; never below 5 visible.
        if (!item.hide && item.rule !== 'show'
          && (oldTool || otherDomain)
          && (item.tool.tag !== 'analytics' || oldTool)
          && all - hidden > 5) {
          item.hide = true;
          this.nodesForUpdate.push(item.id);
          hidden++;
        }
      });

      if (all - hidden <= 50) {
        this.completedProceedNodes();
      } else {
        console.log('force');
        this.proceedNodes(all, hidden, true);
      }
    }
  }
```

Mapping from the old condition, for the reviewer: `verifyOrderToHide` (blocked categories / no category), `forbiddenTools`, `forbiddenTags` and `globalHiddenTools` (admin Hide) are now server-side hard rules, so the node already arrives with `hide: true`; `!isWhitelisted || oldTool` is now `item.rule !== 'show'` (the server returns `null`, not `'show'`, for a stale whitelisted tool).

Delete the `verifyOrderToHide` method (lines ~495–510). Confirm: `grep -n verifyOrderToHide build-stack.component.ts` → only the add-domain line handled in Step 5.

- [ ] **Step 5: build-stack — additional domain/app**

In `handleAddAdditionalDomain`, replace

```ts
          // console.log(this.verifyOrderToHide(nodeItem.tool.categories), forbiddenTags.includes(nodeItem.tool.tag), oldTool, newItems >= maxNewVisibleItems);
          if (( this.verifyOrderToHide(nodeItem.tool.categories) || forbiddenTags.includes(nodeItem.tool.tag) ) || 
              newItems >= maxNewVisibleItems ) {
            nodeItem.hide = true;
            listToHide.push( nodeItem.id );
          } else {
            newItems++;
          }
```

with

```ts
          // node.hide: hidden by admin rules on the server. Otherwise at most maxNewVisibleItems new
          // tools become visible; rule-shown tools (admin Show / whitelisted) are never cut by the cap.
          if (nodeItem.hide || (newItems >= maxNewVisibleItems && nodeItem.rule !== 'show')) {
            nodeItem.hide = true;
            listToHide.push( nodeItem.id );
          } else {
            newItems++;
          }
```

Run: `grep -n "forbiddenTags\|forbiddenTools\|hiddenCategories\|WhitelistCategories\|verifyOrderToHide\|isWhitelisted" front/src/app/modules/blueprint/pages/build-stack/build-stack.component.ts`
Expected: no output (the old commented-out `//console.log('forbidden...` lines went away with the replaced `proceedNodes`).

- [ ] **Step 6: tools-list sidebar**

In `tools-list.component.ts`:
- Delete `import { hiddenCategories, WhitelistCategories } from '../../../../core/config';`.
- After `@Input() addedNewNode: ...;` add:

```ts
  // From the blueprint payload: whitelisted categories are pinned first, blocked ones collapsed.
  @Input() categoryRules: { whitelisted: string[], blocked: string[] } = { whitelisted: [], blocked: [] };
```

- Line ~117: `hiddenCategories.includes(cat)` → `this.categoryRules.blocked.includes(cat)`.
- Line ~145: `hiddenCategories.includes(iterator)` → `this.categoryRules.blocked.includes(iterator)`.
- Line ~167: `WhitelistCategories.includes(iterator)` → `this.categoryRules.whitelisted.includes(iterator)`.
- Lines ~181–182: `WhitelistCategories.indexOf(` → `this.categoryRules.whitelisted.indexOf(` (both).

Run: `grep -n "hiddenCategories\|WhitelistCategories" front/src/app/modules/blueprint/components/tools-list/tools-list.component.ts` — expected: no output.

(`<app-tools-list>` is rendered with `*ngIf="loaded"`, after `proceedBluePrintData`, so the input is set before `ngOnInit` subscribes. Whitelisted categories now sort alphabetically — `getRules` returns sorted names — instead of the old hardcoded order. This is display only and applies to every stack, as the old lists did.)

- [ ] **Step 7: Comment out the hardcoded arrays in `config.ts`**

`config.ts` also exports live config (`treckActions`), so the file stays; the four lists are commented out in place. Directly above `export const forbiddenTags`, insert:

```ts
/*
 * DEPRECATED (2026-10) — forbiddenTags, forbiddenTools, hiddenCategories and WhitelistCategories are
 * no longer used. Visibility rules now live in the database (tools.hidden, categories.status,
 * tags.status), are managed on the admin Tools/Categories pages and were seeded by
 * back/migrate-visibility-rules.js from back/db/seed/visibility-rules-2026-10.json.
 * Kept commented out for reference only.
 *
```

and directly after the closing `];` of `hiddenCategories` (the line before `export const treckActions`), insert ` */`. Then wrap `WhitelistCategories` the same way: insert `/* DEPRECATED (2026-10) — see the note above forbiddenTags.` on the line above `export const WhitelistCategories = [` and ` */` after its closing `];`.

Check nothing inside the commented ranges closes the comment early: `grep -c '\*/' front/src/app/core/config.ts` → `2`.

- [ ] **Step 8: Compile**

Run: `cd front && PATH=~/.nvm/versions/node/v16.15.0/bin:$PATH node node_modules/.bin/ng build --output-path=<scratchpad>/ngbuild 2>&1 | grep -E "ERROR|Hash"`
Expected: a `Hash:` line, no `ERROR`. `git status --short front/dist` shows only the 3 pre-existing modified files.

Run: `grep -rn "forbiddenTags\|forbiddenTools\|hiddenCategories\|WhitelistCategories" front/src --include='*.ts' | grep -v core/config.ts`
Expected: no output.

- [ ] **Step 9: Commit**

```bash
git add front/src/app/modules/blueprint/pages/build-stack/build-stack.component.ts front/src/app/modules/blueprint/pages/build-stack/build-stack.component.html front/src/app/modules/blueprint/components/tools-list/tools-list.component.ts front/src/app/shared/models/tool.ts front/src/app/core/config.ts
git commit -m "Stack builder: first-load rules only for new stacks, use server rule decisions

Retires the hardcoded visibility lists in config.ts (commented out, kept for reference).

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 9: Tools page — Default/Show/Hide, bulk actions, result, filters

**Files:**
- Modify: `front/src/app/core/services/tools.service.ts`, `front/src/app/core/services/blueprints.service.ts`, `front/src/app/modules/profile/pages/tools-managment/tools-managment.component.{ts,html,scss}`

**Interfaces:**
- Consumes: `/admin/tools` (tools carry `result: { state, reason, detail? }`, response has `rules`), `/tools/bulkSetVisibility` (Task 6). No rule logic on the frontend — the Result column only formats the server's `result`.
- Produces: `ToolsService.queryTools(params: { name?, category?, tag?, setting?, offset }) → Observable<{ list, total, offset, limit, rules }>`; `BlueprintsService.bulkSetToolVisibility(ids: string[], state) → Observable<{ matched, modified, tools }>`; route accepts `?category=` / `?tag=` query params (used by Task 10 links).

- [ ] **Step 1: Services**

`tools.service.ts` — add `HttpParams` to the `@angular/common/http` import and add:

```ts
  queryTools(params: { name?: string, category?: string, tag?: string, setting?: string, offset: number }): Observable<any> {
    let httpParams = new HttpParams().set('offset', String(params.offset || 0));
    ['name', 'category', 'tag', 'setting'].forEach((key) => {
      if (params[key]) { httpParams = httpParams.set(key, params[key]); }
    });
    return this.mapper.mapResponse(this.http.get(`${this.serverURI}admin/tools`, { params: httpParams }));
  }
```

`blueprints.service.ts` — add `HttpParams` to the http import and add (the admin rule calls for Task 10 go here too):

```ts
  bulkSetToolVisibility(ids: string[], state: 'default' | 'show' | 'hide'): Observable<any> {
    return this.mapper.mapResponse(this.http.post(`${this.serverURI}tools/bulkSetVisibility`, { ids, state }));
  }

  getAdminCategories(params: { search?: string, status?: string, offset?: number }): Observable<any> {
    return this.mapper.mapResponse(this.http.get(`${this.serverURI}admin/categories`, { params: this.ruleParams(params) }));
  }

  setCategoryStatus(name: string, status: 'whitelisted' | 'blocked' | null): Observable<any> {
    return this.mapper.mapResponse(this.http.post(`${this.serverURI}admin/categories/status`, { name, status }));
  }

  getAdminTags(params: { search?: string, status?: string, offset?: number }): Observable<any> {
    return this.mapper.mapResponse(this.http.get(`${this.serverURI}admin/tags`, { params: this.ruleParams(params) }));
  }

  setTagStatus(name: string, status: 'blocked' | null): Observable<any> {
    return this.mapper.mapResponse(this.http.post(`${this.serverURI}admin/tags/status`, { name, status }));
  }

  getBlockImpact(kind: 'category' | 'tag', name: string): Observable<{ tools: number, alsoWhitelisted: number }> {
    return this.mapper.mapResponse(this.http.get(`${this.serverURI}admin/block-impact`, { params: new HttpParams().set(kind, name) }));
  }

  private ruleParams(params: { search?: string, status?: string, offset?: number, limit?: number }): HttpParams {
    let httpParams = new HttpParams();
    Object.keys(params).forEach((key) => {
      if (params[key] !== undefined && params[key] !== '') { httpParams = httpParams.set(key, String(params[key])); }
    });
    return httpParams;
  }
```

- [ ] **Step 2: Component**

Replace `tools-managment.component.ts` with:

```ts
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SelectionModel } from '@angular/cdk/collections';
import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { MatPaginator } from '@angular/material/paginator';
import { AuthService } from '../../../../core/services/auth.service';
import { ToolsService } from '../../../../core/services/tools.service';
import { BlueprintsService } from '../../../../core/services/blueprints.service';
import { environment } from '../../../../../environments/environment';

const host = environment.serverURI;
const searchDelay = 500;

type AdminSetting = 'default' | 'show' | 'hide';

interface RuleLists { whitelisted: string[]; blocked: string[]; blockedTags: string[]; }

interface ToolRow {
  tool: any;
  setting: AdminSetting;
  result: { kind: 'shown' | 'hidden' | 'auto', label: string, detail: string };
}

@Component({
  selector: 'app-tools-managment',
  templateUrl: './tools-managment.component.html',
  styleUrls: ['./tools-managment.component.scss']
})
export class ToolsManagmentComponent implements OnInit, OnDestroy {
  @ViewChild('paginator') paginator: MatPaginator;
  user: any;
  rows: ToolRow[] = [];
  limit = 10;
  total = 0;
  offset = 0;
  displayedColumns: string[] = ['select', 'name', 'logo', 'categories', 'setting', 'result'];
  toolSearchName = '';
  categoryFilter = '';
  tagFilter = '';
  settingFilter: '' | AdminSetting = '';
  rules: RuleLists = { whitelisted: [], blocked: [], blockedTags: [] };
  selection = new SelectionModel<string>(true, []);
  saving = false;
  errorMessage = '';
  private search$ = new Subject<void>();
  private subscriptions: Subscription[] = [];

  constructor(
    private auth: AuthService,
    private toolsService: ToolsService,
    private blueprintService: BlueprintsService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.user = this.auth.getCurrentUser();
  }

  ngOnInit(): void {
    this.subscriptions.push(this.search$.pipe(debounceTime(searchDelay)).subscribe(() => this.load(0)));
    this.subscriptions.push(this.route.queryParamMap.subscribe((params) => {
      this.categoryFilter = params.get('category') || '';
      this.tagFilter = params.get('tag') || '';
      this.load(0);
    }));
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  load(offset: number) {
    this.offset = offset;
    this.selection.clear();
    if (offset === 0 && this.paginator) { this.paginator.firstPage(); }
    this.toolsService.queryTools({
      name: this.toolSearchName.trim(),
      category: this.categoryFilter,
      tag: this.tagFilter,
      setting: this.settingFilter,
      offset
    }).toPromise().then((res) => {
      this.rules = res.rules || this.rules;
      this.total = res.total;
      this.rows = res.list.map(tool => this.toRow(tool));
    }).catch((err) => {
      console.log(err);
      this.errorMessage = 'Could not load tools.';
    });
  }

  handlePage(evnt) {
    this.load(evnt.pageIndex * this.limit);
  }

  handleInputText() {
    this.search$.next();
  }

  setSettingFilter(value: '' | AdminSetting) {
    this.settingFilter = value;
    this.load(0);
  }

  clearFilter(key: 'category' | 'tag') {
    const queryParams = {};
    queryParams[key] = null;
    this.router.navigate([], { relativeTo: this.route, queryParams, queryParamsHandling: 'merge' });
  }

  categoryStatus(name: string): 'whitelisted' | 'blocked' | 'normal' {
    if (this.rules.whitelisted.indexOf(name) !== -1) { return 'whitelisted'; }
    if (this.rules.blocked.indexOf(name) !== -1) { return 'blocked'; }
    return 'normal';
  }

  tagBlocked(name: string): boolean {
    return this.rules.blockedTags.indexOf(name) !== -1;
  }

  isAllSelected(): boolean {
    return this.rows.length > 0 && this.rows.every(row => this.selection.isSelected(row.tool.id));
  }

  masterToggle() {
    if (this.isAllSelected()) {
      this.selection.clear();
    } else {
      this.rows.forEach(row => this.selection.select(row.tool.id));
    }
  }

  setVisibility(ids: string[], state: AdminSetting) {
    if (!ids.length || this.saving) { return; }
    this.saving = true;
    this.errorMessage = '';
    this.blueprintService.bulkSetToolVisibility(ids, state).toPromise().then((res) => {
      const updated = {};
      res.tools.forEach(tool => { updated[tool.id] = tool; });
      this.rows = this.rows.map(row => updated[row.tool.id]
        ? this.toRow(Object.assign({}, row.tool, { hidden: updated[row.tool.id].hidden, result: updated[row.tool.id].result }))
        : row);
      this.selection.clear();
      this.saving = false;
    }).catch((err) => {
      console.log(err);
      this.errorMessage = 'Could not save. Nothing was changed.';
      this.rows = this.rows.map(row => this.toRow(row.tool)); // reset toggles
      this.saving = false;
    });
  }

  setSelected(state: AdminSetting) {
    this.setVisibility(this.selection.selected, state);
  }

  processImageSrc(link) {
    if (!link) { return ''; }
    if (link.indexOf('http://') !== -1 || link.indexOf('https://') !== -1) {
      return link;
    }
    return host + link;
  }

  // tool.hidden: true = Hide, false = Show, null/absent = Default.
  private toRow(tool: any): ToolRow {
    const setting: AdminSetting = tool.hidden === true ? 'hide' : (tool.hidden === false ? 'show' : 'default');
    return { tool, setting, result: this.describe(tool.result || { state: null, reason: 'auto' }) };
  }

  // Formats the server's decideTool result for the "Result on new stacks" column.
  private describe(decision: { state: string, reason: string, detail?: string }): ToolRow['result'] {
    switch (decision.reason) {
      case 'admin-show': return { kind: 'shown', label: 'Shown', detail: 'Admin exception' };
      case 'admin-hide': return { kind: 'hidden', label: 'Hidden', detail: 'Hidden by admin' };
      case 'whitelisted': return { kind: 'shown', label: 'Shown', detail: 'Whitelisted: ' + decision.detail };
      case 'blocked-category': return { kind: 'hidden', label: 'Hidden', detail: 'Blocked category: ' + decision.detail };
      case 'blocked-tag': return { kind: 'hidden', label: 'Hidden', detail: 'Blocked tag: ' + decision.detail };
      default: return { kind: 'auto', label: 'Auto', detail: 'Standard stack rules' };
    }
  }
}
```

(`UsersService`, `MatDialog`s and `ConfirmActionComponent` were unused here — removed. `getRoleName` was dead code copied from the Users page — removed; confirm with `grep -n getRoleName front/src/app/modules/profile/pages/tools-managment/*.html` → no output.)

- [ ] **Step 3: Template**

Replace `tools-managment.component.html` with:

```html
<div class="main">
  <div class="app-container">
    <div class="stack-section-container">
      <app-header [user]="user"></app-header>
      <div class="mt-container">
        <div class="my-stack-container">
          <div class="stack-container-header">
            <h2> Tools </h2>
            <mat-form-field appearance="none" class="search-full-width">
              <mat-label>Search by Tool name</mat-label>
              <input type="text" matInput [(ngModel)]="toolSearchName" (input)="handleInputText()" cdkFocusInitial>
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>
          </div>

          <div class="filter-bar">
            <span class="filter-label">Filter:</span>
            <span *ngIf="categoryFilter" class="filter-chip active">
              Category: {{ categoryFilter }}
              <span *ngIf="categoryStatus(categoryFilter) !== 'normal'" class="badge" [ngClass]="'badge-' + categoryStatus(categoryFilter)">{{ categoryStatus(categoryFilter) }}</span>
              <mat-icon class="chip-close" (click)="clearFilter('category')">close</mat-icon>
            </span>
            <a *ngIf="!categoryFilter" class="filter-chip" [routerLink]="'/profile/categories'">Category: Any</a>
            <span *ngIf="tagFilter" class="filter-chip active">
              Tag: {{ tagFilter }}
              <span *ngIf="tagBlocked(tagFilter)" class="badge badge-blocked">blocked</span>
              <mat-icon class="chip-close" (click)="clearFilter('tag')">close</mat-icon>
            </span>
            <button class="filter-chip" [class.active]="settingFilter" [matMenuTriggerFor]="settingMenu">
              Admin setting: {{ settingFilter ? (settingFilter | titlecase) : 'Any' }}
            </button>
            <mat-menu #settingMenu="matMenu">
              <button mat-menu-item (click)="setSettingFilter('')">Any</button>
              <button mat-menu-item (click)="setSettingFilter('default')">Default</button>
              <button mat-menu-item (click)="setSettingFilter('show')">Show</button>
              <button mat-menu-item (click)="setSettingFilter('hide')">Hide</button>
            </mat-menu>
            <span *ngIf="categoryFilter && categoryStatus(categoryFilter) === 'blocked'" class="filter-hint">
              Set a tool to <strong class="text-shown">Show</strong> to make an exception to the block.
            </span>
          </div>

          <div class="bulk-bar" *ngIf="selection.hasValue()">
            <strong>{{ selection.selected.length }} selected</strong>
            <button mat-stroked-button class="bulk-show" [disabled]="saving" (click)="setSelected('show')"><mat-icon>visibility</mat-icon> Show Selected</button>
            <button mat-stroked-button class="bulk-hide" [disabled]="saving" (click)="setSelected('hide')"><mat-icon>block</mat-icon> Hide Selected</button>
            <button mat-stroked-button [disabled]="saving" (click)="setSelected('default')"><mat-icon>undo</mat-icon> Reset to Default</button>
            <span class="spacer"></span>
            <button mat-button (click)="selection.clear()">Clear selection</button>
          </div>

          <div class="error-message" *ngIf="errorMessage">{{ errorMessage }}</div>

          <table mat-table [dataSource]="rows" class="tools-table">
            <ng-container matColumnDef="select">
              <th mat-header-cell *matHeaderCellDef>
                <mat-checkbox (change)="$event ? masterToggle() : null"
                              [checked]="isAllSelected()"
                              [indeterminate]="selection.hasValue() && !isAllSelected()"></mat-checkbox>
              </th>
              <td mat-cell *matCellDef="let row">
                <mat-checkbox (click)="$event.stopPropagation()"
                              (change)="$event ? selection.toggle(row.tool.id) : null"
                              [checked]="selection.isSelected(row.tool.id)"></mat-checkbox>
              </td>
            </ng-container>

            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef> Name </th>
              <td mat-cell class="tool-name" [class.muted]="row.result.kind === 'hidden'" *matCellDef="let row"> {{ row.tool.name }} </td>
            </ng-container>

            <ng-container matColumnDef="logo">
              <th mat-header-cell *matHeaderCellDef> Logo </th>
              <td mat-cell *matCellDef="let row">
                <mat-icon mat-list-icon><img class="logo-tool" [src]="processImageSrc(row.tool.logo)"></mat-icon>
              </td>
            </ng-container>

            <ng-container matColumnDef="categories">
              <th mat-header-cell *matHeaderCellDef> Categories </th>
              <td mat-cell *matCellDef="let row">
                <span *ngFor="let cat of row.tool.categories" class="cat-chip" [ngClass]="'cat-' + categoryStatus(cat)">{{ cat }}</span>
              </td>
            </ng-container>

            <ng-container matColumnDef="setting">
              <th mat-header-cell *matHeaderCellDef> Admin setting </th>
              <td mat-cell *matCellDef="let row">
                <mat-button-toggle-group class="setting-toggle" [value]="row.setting" [disabled]="saving"
                                         (change)="setVisibility([row.tool.id], $event.value)">
                  <mat-button-toggle value="default">Default</mat-button-toggle>
                  <mat-button-toggle value="show" class="toggle-show"><mat-icon>visibility</mat-icon> Show</mat-button-toggle>
                  <mat-button-toggle value="hide" class="toggle-hide"><mat-icon>block</mat-icon> Hide</mat-button-toggle>
                </mat-button-toggle-group>
              </td>
            </ng-container>

            <ng-container matColumnDef="result">
              <th mat-header-cell *matHeaderCellDef> Result on new stacks </th>
              <td mat-cell *matCellDef="let row">
                <div class="result" [ngClass]="'result-' + row.result.kind">
                  <mat-icon>{{ row.result.kind === 'shown' ? 'visibility' : (row.result.kind === 'hidden' ? 'block' : 'auto_awesome') }}</mat-icon>
                  <div>
                    <div class="result-label">{{ row.result.label }}</div>
                    <div class="result-detail">{{ row.result.detail }}</div>
                  </div>
                </div>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;" [class.selected-row]="selection.isSelected(row.tool.id)"></tr>
          </table>

          <mat-paginator #paginator [length]="total" [pageSize]="limit" (page)="handlePage($event)"></mat-paginator>
        </div>
      </div>
    </div>
  </div>
</div>
```

If `auto_awesome` renders as text (older Material Icons font), use `autorenew`.

- [ ] **Step 4: Styles**

Append to `tools-managment.component.scss` (colours from the mockups):

```scss
.filter-bar { display: flex; align-items: center; flex-wrap: wrap; gap: 12px; padding: 12px 0; border-bottom: 1px solid #e5e5e5; }
.filter-label { color: #666; font-size: 13px; }
.filter-chip { display: inline-flex; align-items: center; gap: 6px; border: 1px solid #bbb; border-radius: 16px; padding: 4px 14px; background: #fff; color: #444; font-size: 14px; cursor: pointer; text-decoration: none; }
.filter-chip.active { border-color: #e2481e; color: #e2481e; }
.chip-close { font-size: 18px; width: 18px; height: 18px; cursor: pointer; }
.filter-hint { color: #666; font-size: 13px; }
.badge { font-size: 11px; font-weight: 700; text-transform: uppercase; color: #fff; border-radius: 3px; padding: 1px 6px; }
.badge-blocked { background: #c62828; }
.badge-whitelisted { background: #2e7d32; }
.text-shown { color: #2e7d32; }
.bulk-bar { display: flex; align-items: center; gap: 16px; padding: 10px 12px; background: #fdf0ea; }
.bulk-bar .spacer { flex: 1; }
.bulk-show { color: #2e7d32; border-color: #2e7d32; }
.bulk-hide { color: #c62828; border-color: #c62828; }
.error-message { color: #c62828; padding: 8px 0; }
.cat-chip { display: inline-block; margin: 2px 4px 2px 0; padding: 2px 8px; border-radius: 10px; background: #f0f0f0; color: #444; font-size: 13px; }
.cat-chip.cat-blocked { background: #fdecea; color: #c62828; }
.cat-chip.cat-whitelisted { background: #e8f5e9; color: #2e7d32; }
.tool-name.muted { color: #888; }
.setting-toggle mat-icon { font-size: 16px; width: 16px; height: 16px; vertical-align: middle; }
.setting-toggle .mat-button-toggle-checked.toggle-show { background: #e8f5e9; color: #2e7d32; }
.setting-toggle .mat-button-toggle-checked.toggle-hide { background: #fdecea; color: #c62828; }
.result { display: flex; align-items: center; gap: 8px; }
.result-label { font-weight: 600; }
.result-detail { font-size: 13px; color: #666; }
.result-shown { color: #2e7d32; }
.result-hidden { color: #c62828; }
.result-auto { color: #666; }
.selected-row { background: #fafafa; }
```

- [ ] **Step 5: Compile**

Run: `cd front && PATH=~/.nvm/versions/node/v16.15.0/bin:$PATH node node_modules/.bin/ng build --output-path=<scratchpad>/ngbuild 2>&1 | grep -E "ERROR|Hash"`
Expected: `Hash:` line, no `ERROR`. (`titlecase` is in CommonModule; `matMenuTriggerFor`, `mat-button-toggle`, `mat-checkbox` come from `ButtonsIndicatorsModule`/`FormsControlsModule`, already imported by `ProfileModule`.)

- [ ] **Step 6: Commit**

```bash
git add front/src/app/core/services/tools.service.ts front/src/app/core/services/blueprints.service.ts front/src/app/modules/profile/pages/tools-managment/tools-managment.component.ts front/src/app/modules/profile/pages/tools-managment/tools-managment.component.html front/src/app/modules/profile/pages/tools-managment/tools-managment.component.scss
git commit -m "Add three-state visibility, bulk actions and rule results to the Tools page

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 10: Categories page (Categories + Tags tabs) and admin nav

**Files:**
- Create: `front/src/app/modules/profile/pages/categories-managment/categories-managment.component.{ts,html,scss}`, `front/src/app/modules/profile/components/block-rule-dialog/block-rule-dialog.component.{ts,html,scss}`
- Modify: `front/src/app/modules/profile/profile.module.ts`, `front/src/app/modules/profile/profile-routing.module.ts`, `front/src/app/shared/components/header/header.component.html`

**Interfaces:**
- Consumes: `BlueprintsService.getAdminCategories/setCategoryStatus/getAdminTags/setTagStatus/getBlockImpact` (Task 9), `AdminGuard` (Task 1).
- Produces: route `/profile/categories?tab=tags` (optional); `BlockRuleDialogComponent` data `{ kind: 'category'|'tag', name, tools, alsoWhitelisted }`, closes with `true` on confirm.

- [ ] **Step 1: Block confirm dialog (mockup 5)**

`block-rule-dialog.component.ts`:

```ts
import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface BlockRuleDialogData {
  kind: 'category' | 'tag';
  name: string;
  tools: number;
  alsoWhitelisted: number;
}

@Component({
  selector: 'app-block-rule-dialog',
  templateUrl: './block-rule-dialog.component.html',
  styleUrls: ['./block-rule-dialog.component.scss']
})
export class BlockRuleDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<BlockRuleDialogComponent, boolean>,
    @Inject(MAT_DIALOG_DATA) public data: BlockRuleDialogData) { }
}
```

`block-rule-dialog.component.html`:

```html
<h2 mat-dialog-title>Block {{ data.kind }}: {{ data.name }}</h2>
<mat-dialog-content>
  <p>
    The <strong>{{ data.tools }} {{ data.tools === 1 ? 'tool' : 'tools' }}</strong>
    {{ data.kind === 'category' ? 'in this category' : 'with this tag' }}, and any found on future BuiltWith scans,
    will be hidden when they're added to a stack <strong>from now on</strong>.
  </p>
  <p>Existing stacks are not changed. Tools already on a stack keep their current visibility.</p>
  <div class="whitelist-note" *ngIf="data.alsoWhitelisted > 0">
    <mat-icon>verified</mat-icon>
    <span><strong>{{ data.alsoWhitelisted }} of these tools</strong> are also in a whitelisted category and will still be
      added visibly. Hide them individually on the Tools page if needed.</span>
  </div>
</mat-dialog-content>
<mat-dialog-actions align="end">
  <button mat-button [mat-dialog-close]="false">Cancel</button>
  <button mat-flat-button class="block-confirm" [mat-dialog-close]="true">Block {{ data.kind }}</button>
</mat-dialog-actions>
```

`block-rule-dialog.component.scss`:

```scss
.whitelist-note { display: flex; gap: 10px; align-items: flex-start; background: #f5f5f5; padding: 12px; border-radius: 4px; }
.whitelist-note mat-icon { color: #2e7d32; }
.block-confirm { background: #c62828; color: #fff; text-transform: uppercase; }
```

- [ ] **Step 2: Page component (mockups 4, 7)**

`categories-managment.component.ts`:

```ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { AuthService } from '../../../../core/services/auth.service';
import { BlueprintsService } from '../../../../core/services/blueprints.service';
import { BlockRuleDialogComponent } from '../../components/block-rule-dialog/block-rule-dialog.component';

type RuleKind = 'categories' | 'tags';
type RuleStatus = 'whitelisted' | 'normal' | 'blocked';

interface RuleRow {
  name: string;
  tools: number;
  examples: string[];
  status: RuleStatus;
  isNew: boolean;
}

const searchDelay = 400;

@Component({
  selector: 'app-categories-managment',
  templateUrl: './categories-managment.component.html',
  styleUrls: ['./categories-managment.component.scss']
})
export class CategoriesManagmentComponent implements OnInit, OnDestroy {
  user: any;
  kind: RuleKind = 'categories';
  filter = 'all';
  search = '';
  rows: RuleRow[] = [];
  noCategory: RuleRow = null;
  counts: { [key: string]: number } = {};
  tabTotals = { categories: 0, tags: 0 };
  total = 0;
  limit = 25;
  offset = 0;
  displayedColumns = ['name', 'tools', 'examples', 'status'];
  saving: { [name: string]: boolean } = {};
  errorMessage = '';
  private search$ = new Subject<void>();
  private subscriptions: Subscription[] = [];

  constructor(
    private auth: AuthService,
    private service: BlueprintsService,
    private dialog: MatDialog,
    private route: ActivatedRoute
  ) {
    this.user = this.auth.getCurrentUser();
  }

  get filters(): string[] {
    return this.kind === 'categories' ? ['all', 'new', 'whitelisted', 'blocked', 'normal'] : ['all', 'new', 'blocked', 'normal'];
  }

  get statuses(): RuleStatus[] {
    return this.kind === 'categories' ? ['whitelisted', 'normal', 'blocked'] : ['normal', 'blocked'];
  }

  ngOnInit(): void {
    this.subscriptions.push(this.search$.pipe(debounceTime(searchDelay)).subscribe(() => this.load(0)));
    this.kind = this.route.snapshot.queryParamMap.get('tab') === 'tags' ? 'tags' : 'categories';
    this.loadTabTotal(this.kind === 'categories' ? 'tags' : 'categories');
    this.load(0);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  setKind(kind: RuleKind) {
    if (kind === this.kind) { return; }
    this.kind = kind;
    this.filter = 'all';
    this.search = '';
    this.load(0);
  }

  setFilter(filter: string) {
    this.filter = filter;
    this.load(0);
  }

  handleSearch() {
    this.search$.next();
  }

  handlePage(evnt) {
    this.load(evnt.pageIndex * this.limit);
  }

  load(offset: number) {
    this.offset = offset;
    this.errorMessage = '';
    const params = { search: this.search.trim(), status: this.filter, offset, limit: this.limit };
    const request = this.kind === 'categories' ? this.service.getAdminCategories(params) : this.service.getAdminTags(params);
    request.toPromise().then((res) => {
      this.rows = res.list;
      this.total = res.total;
      this.counts = res.counts;
      this.noCategory = this.kind === 'categories' && this.filter === 'all' && !this.search.trim() ? res.noCategory : null;
      if (!this.search.trim()) { this.tabTotals[this.kind] = res.counts.all; }
    }).catch((err) => {
      console.log(err);
      this.errorMessage = 'Could not load ' + this.kind + '.';
    });
  }

  statusLabel(status: RuleStatus): string {
    return status === 'whitelisted' ? 'Whitelist' : (status === 'blocked' ? 'Block' : 'Normal');
  }

  toolsLink(row: RuleRow) {
    return this.kind === 'categories' ? { category: row.name } : { tag: row.name };
  }

  changeStatus(row: RuleRow, status: RuleStatus) {
    if (status === row.status) { return; }
    if (status !== 'blocked') {
      this.save(row, status);
      return;
    }
    const kind = this.kind === 'categories' ? 'category' : 'tag';
    this.service.getBlockImpact(kind, row.name).toPromise().then((impact) => {
      this.dialog.open(BlockRuleDialogComponent, {
        width: '560px',
        data: { kind, name: row.name, tools: impact.tools, alsoWhitelisted: impact.alsoWhitelisted }
      }).afterClosed().subscribe((confirmed) => {
        if (confirmed) {
          this.save(row, status);
        } else {
          this.resetRow(row);
        }
      });
    }).catch((err) => {
      console.log(err);
      this.errorMessage = 'Could not check the impact of blocking ' + row.name + '.';
      this.resetRow(row);
    });
  }

  private save(row: RuleRow, status: RuleStatus) {
    const value = status === 'normal' ? null : status;
    this.saving[row.name] = true;
    const request = this.kind === 'categories'
      ? this.service.setCategoryStatus(row.name, value as any)
      : this.service.setTagStatus(row.name, value as any);
    request.toPromise().then(() => {
      this.saving[row.name] = false;
      this.load(this.offset); // stay on the same page
    }).catch((err) => {
      console.log(err);
      this.saving[row.name] = false;
      this.errorMessage = 'Could not save ' + row.name + '. Nothing was changed.';
      this.resetRow(row);
    });
  }

  // Re-create the row object so the toggle group snaps back to the saved status.
  private resetRow(row: RuleRow) {
    if (this.noCategory && row === this.noCategory) {
      this.noCategory = Object.assign({}, row);
    } else {
      this.rows = this.rows.map(r => r === row ? Object.assign({}, row) : r);
    }
  }

  private loadTabTotal(kind: RuleKind) {
    const request = kind === 'categories'
      ? this.service.getAdminCategories({ status: 'all', offset: 0 })
      : this.service.getAdminTags({ status: 'all', offset: 0 });
    request.toPromise().then((res) => { this.tabTotals[kind] = res.counts.all; }).catch(err => console.log(err));
  }
}
```

`categories-managment.component.html`:

```html
<div class="main">
  <div class="app-container">
    <div class="stack-section-container">
      <app-header [user]="user"></app-header>
      <div class="mt-container">
        <div class="my-stack-container">
          <div class="stack-container-header">
            <h2> Categories </h2>
            <mat-form-field appearance="none" class="search-full-width">
              <mat-label>Search by {{ kind === 'categories' ? 'Category' : 'Tag' }} name</mat-label>
              <input type="text" matInput [(ngModel)]="search" (input)="handleSearch()" cdkFocusInitial>
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>
          </div>

          <div class="rule-tabs">
            <button class="rule-tab" [class.active]="kind === 'categories'" (click)="setKind('categories')">Categories <span class="tab-count">{{ tabTotals.categories }}</span></button>
            <button class="rule-tab" [class.active]="kind === 'tags'" (click)="setKind('tags')">Tags <span class="tab-count">{{ tabTotals.tags }}</span></button>
          </div>

          <div class="filter-bar">
            <span class="filter-label">Show:</span>
            <button *ngFor="let f of filters" class="filter-chip" [class.active]="filter === f" (click)="setFilter(f)">
              {{ f | titlecase }} <span class="chip-count">{{ counts[f] || 0 }}</span>
            </button>
            <span class="spacer"></span>
            <span class="filter-hint">
              <mat-icon>info_outline</mat-icon>
              {{ kind === 'categories' ? 'Whitelisted beats Blocked when a tool is in both' : 'Tags can only be blocked. A whitelisted category beats a blocked tag.' }}
            </span>
          </div>

          <div class="error-message" *ngIf="errorMessage">{{ errorMessage }}</div>

          <table class="rules-table">
            <thead>
              <tr>
                <th>{{ kind === 'categories' ? 'Category' : 'Tag' }}</th>
                <th>Tools <mat-icon class="sort-icon">arrow_downward</mat-icon></th>
                <th>Examples</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <ng-container *ngIf="noCategory">
                <ng-container *ngTemplateOutlet="ruleRow; context: { $implicit: noCategory, pinned: true }"></ng-container>
              </ng-container>
              <ng-container *ngFor="let row of rows">
                <ng-container *ngTemplateOutlet="ruleRow; context: { $implicit: row, pinned: false }"></ng-container>
              </ng-container>
              <tr *ngIf="!rows.length && !noCategory"><td colspan="4" class="empty">Nothing matches.</td></tr>
            </tbody>
          </table>

          <ng-template #ruleRow let-row let-pinned="pinned">
            <tr [class.row-blocked]="row.status === 'blocked'">
              <td class="rule-name">
                <span [class.pinned-name]="pinned">{{ row.name }}</span>
                <span *ngIf="row.status === 'blocked'" class="badge badge-blocked">Blocked</span>
                <span *ngIf="row.status === 'whitelisted'" class="badge badge-whitelisted">Whitelisted</span>
                <span *ngIf="row.isNew" class="badge badge-new">New</span>
              </td>
              <td><a [routerLink]="'/profile/tools'" [queryParams]="toolsLink(row)">{{ row.tools }} {{ row.tools === 1 ? 'tool' : 'tools' }}</a></td>
              <td class="examples">{{ row.examples.join(', ') }}</td>
              <td>
                <mat-button-toggle-group class="status-toggle" [value]="row.status" [disabled]="saving[row.name]"
                                         (change)="changeStatus(row, $event.value)">
                  <mat-button-toggle *ngFor="let s of statuses" [value]="s" [ngClass]="'toggle-' + s">{{ statusLabel(s) }}</mat-button-toggle>
                </mat-button-toggle-group>
              </td>
            </tr>
          </ng-template>

          <mat-paginator [length]="total" [pageSize]="limit" [pageIndex]="offset / limit" (page)="handlePage($event)"></mat-paginator>
        </div>
      </div>
    </div>
  </div>
</div>
```

`categories-managment.component.scss`:

```scss
.rule-tabs { display: flex; gap: 8px; border-bottom: 1px solid #e5e5e5; }
.rule-tab { background: none; border: none; border-bottom: 3px solid transparent; padding: 12px 24px; font-size: 15px; font-weight: 600; text-transform: uppercase; color: #666; cursor: pointer; }
.rule-tab.active { color: #e2481e; border-bottom-color: #e2481e; }
.tab-count { font-weight: 400; margin-left: 8px; }
.filter-bar { display: flex; align-items: center; flex-wrap: wrap; gap: 10px; padding: 12px 0; border-bottom: 1px solid #e5e5e5; }
.filter-bar .spacer { flex: 1; }
.filter-label { color: #666; font-size: 13px; }
.filter-chip { border: 1px solid #bbb; border-radius: 16px; padding: 4px 14px; background: #fff; color: #444; font-size: 14px; cursor: pointer; }
.filter-chip.active { border-color: #e2481e; color: #e2481e; }
.chip-count { color: #888; margin-left: 4px; }
.filter-hint { display: inline-flex; align-items: center; gap: 4px; color: #666; font-size: 13px; }
.filter-hint mat-icon { font-size: 16px; width: 16px; height: 16px; }
.error-message { color: #c62828; padding: 8px 0; }
.rules-table { width: 100%; border-collapse: collapse; }
.rules-table th { text-align: left; font-weight: 500; color: #555; font-size: 13px; padding: 14px 8px; border-bottom: 1px solid #e5e5e5; }
.rules-table td { padding: 10px 8px; border-bottom: 1px solid #eee; }
.sort-icon { font-size: 14px; width: 14px; height: 14px; vertical-align: middle; }
.row-blocked .rule-name > span:first-child, .row-blocked a { color: #888; }
.pinned-name { font-style: italic; }
.examples { color: #666; }
.empty { text-align: center; color: #888; padding: 24px; }
.badge { font-size: 11px; font-weight: 700; text-transform: uppercase; color: #fff; border-radius: 3px; padding: 1px 6px; margin-left: 8px; }
.badge-blocked { background: #c62828; }
.badge-whitelisted { background: #2e7d32; }
.badge-new { background: #1e5bc6; }
.status-toggle .mat-button-toggle { text-transform: uppercase; font-size: 13px; }
.status-toggle .mat-button-toggle-checked.toggle-blocked { background: #fdecea; color: #c62828; }
.status-toggle .mat-button-toggle-checked.toggle-whitelisted { background: #e8f5e9; color: #2e7d32; }
.status-toggle .mat-button-toggle-checked.toggle-normal { background: #f0f0f0; color: #222; }
```

- [ ] **Step 3: Wire up module, route, nav**

`profile.module.ts`: import and add `CategoriesManagmentComponent` and `BlockRuleDialogComponent` to `declarations` (add `entryComponents: [BlockRuleDialogComponent]` too — Angular 9 without Ivy needs it; harmless with Ivy).

`profile-routing.module.ts`: import `CategoriesManagmentComponent` and add after the `tools` route:

```ts
  {
    path: 'categories',
    component: CategoriesManagmentComponent,
    canActivate: [AuthGuard, AdminGuard]
  },
```

`header.component.html`: after the Tools link's divider, add:

```html
        <a *ngIf="user.role === 0" class="header-link" mat-button [routerLink]="'/profile/categories'">
          Categories
        </a>
        <div *ngIf="user.role === 0" class="divider-buttons"></div>
```

- [ ] **Step 4: Compile**

Run: `cd front && PATH=~/.nvm/versions/node/v16.15.0/bin:$PATH node node_modules/.bin/ng build --output-path=<scratchpad>/ngbuild 2>&1 | grep -E "ERROR|Hash"`
Expected: `Hash:` line, no `ERROR`.

- [ ] **Step 5: Commit**

```bash
git add front/src/app/modules/profile/pages/categories-managment front/src/app/modules/profile/components/block-rule-dialog front/src/app/modules/profile/profile.module.ts front/src/app/modules/profile/profile-routing.module.ts front/src/app/shared/components/header/header.component.html
git commit -m "Add admin Categories page with Tags tab and block confirmation

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 11: Local end-to-end verification + spec housekeeping (scheduled Monday — no testing before then)

**Files:**
- Modify: `docs/superpowers/specs/2026-08-17-tools-management-bulk-visibility-design.md:4-5`
- Commit: `docs/superpowers/` (spec, mockups, this plan)

- [ ] **Step 1: Full test run**

Run: `cd back && npm test`
Expected: all PASS, 0 failures.

- [ ] **Step 2: Prepare local data (dev DB only)**

```bash
mongodump --quiet --db marchtach_dev --out <scratchpad>/dump-dev-before
cd back && PATH=~/.nvm/versions/node/v16.15.0/bin:$PATH node migrate-visibility-rules.js --db marchtach_dev
PATH=~/.nvm/versions/node/v16.15.0/bin:$PATH node migrate-visibility-rules.js --db marchtach_dev --apply
```
Expected: `Verify: {"blockedCategories":92,"whitelistedCategories":7,"blockedTags":11} OK`.

Ask the user for (or have them create) a local admin: `mongo marchtach_dev --eval 'db.users.updateOne({email:"<their email>"},{$set:{role:0}})'` after signing up locally.

- [ ] **Step 3: Run the app**

Backend (terminal 1): `cd back && PATH=~/.nvm/versions/node/v16.15.0/bin:$PATH node app_dev.js` (port 4100, `marchtach_dev`).
Frontend (terminal 2): `cd front && PATH=~/.nvm/versions/node/v16.15.0/bin:$PATH node node_modules/.bin/ng serve` (uses `environment.ts` → `http://localhost:4100`).

- [ ] **Step 4: Manual checklist (user drives the browser)**

1. As a non-admin: `/profile/tools`, `/profile/categories`, `/profile/users` redirect to `/profile`; `curl -H "Authorization: Bearer <non-admin token>" localhost:4100/users` → 403.
2. As admin: Users page edit still works; changing your own role to Editor shows an error and nothing changes; deleting yourself shows an error (Users page now displays server error messages — added during E2E 2026-10-19).
3. Tools page: three-way toggle per row (Default/Show/Hide), Result column matches mockups 1–3; select 3 → bulk bar → Show/Hide/Reset; Admin setting filter; no domain/custom-app tools listed; error message if the backend is stopped.
4. Categories page: counts, filter chips, search, pinned `(No category)`, block → confirm dialog with counts (mockup 5) → cancel reverts toggle; "N tools" link opens Tools filtered by category (mockup 6) with the exception hint; Tags tab (mockup 7) with only Normal/Block.
5. Build a **new** stack for a domain → blocked-category/tag and Hide tools hidden; Show and whitelisted tools visible; own domain node visible; on a big stack, stale tools hidden and no more than 50 visible (unless Show/whitelisted exceed it).
6. Reload that stack, and open an **existing** older stack → nothing re-processed (hide flags unchanged; browser Network tab shows no `hideNodes` call).
7. Add an additional domain to a stack → new tools follow the rules, max 40 newly visible; existing nodes unchanged.
8. In the builder, "hide globally" on a tool, then un-hide it → Tools page shows it as Show.
9. Builder tools list (below the canvas): each row shows "Hide on Stack"/"Show on Stack" next to the eye; admins also see 🚫 "Hide Globally" / 🌐 `public` "Show Globally" (replaces the `restore` clock icon); labels fit without breaking the row layout; no global button on domain/custom-app rows.

- [ ] **Step 5: Restore dev data if wanted**

`mongorestore --quiet --drop --db marchtach_dev <scratchpad>/dump-dev-before/marchtach_dev` (only if the user wants the pre-migration dev DB back).

- [ ] **Step 6: Spec status + commit docs**

In the spec header change:

```
**Branch:** investigate-builtwith  
**Status:** Ready to implement — mockups pending stakeholder sign-off
```

to

```
**Branch:** tools-management-visibility-rules  
**Status:** Approved 2026-10-16 — implementation plan: docs/superpowers/plans/2026-10-16-tools-visibility-rules.md
```

```bash
git add docs/superpowers/specs docs/superpowers/mockups docs/superpowers/plans
git commit -m "Add visibility rules spec, mockups and implementation plan

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

(Do not add `docs/.DS_Store` / `docs/superpowers/.DS_Store`.)

- [ ] **Step 7: Release notes for the deploy (not today)**

Record in the PR description: `mongodump` of `categories`, `tags`, `tools`, `blueprints_tools`; run the migration dev → staging → prod **before** deploying the code (there is no fallback — without the migration no category/tag rules exist and nothing is rule-hidden); deploy backend before frontend; rebuild `front/dist` on the release commit.

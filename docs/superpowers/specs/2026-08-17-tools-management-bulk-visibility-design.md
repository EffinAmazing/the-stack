# Tools Management — Bulk Visibility + Category & Tag Rules

**Date:** 2026-08-17 (revised 2026-10-14 after stakeholder feedback)  
**Branch:** tools-management-visibility-rules  
**Status:** Approved 2026-10-16 — implementation plan: docs/superpowers/plans/2026-10-16-tools-visibility-rules.md

> **Revisions 2026-10-16 (implementation review).** These override the sections below where they conflict; details in `docs/superpowers/plans/2026-10-16-tools-visibility-rules.md`.
> - **No `alwaysShow` field.** The existing `tools.hidden` is three-state: `true` = Hide, `false` = Show, absent/null = Default. New tools start as Default. Tools already at `hidden: false` (un-hidden by an admin) count as Show. The builder's hide-globally toggle keeps writing `true`/`false`.
> - **No `RULES_START_DATE` / `applyRules`.** The backend applies the rules when it creates nodes (`createNodesForTools` for a new stack, `filterToolsByNodes` for an added domain/app) and returns each new node's decision as `node.rule`. The frontend first-load pass runs only when the backend flags the stack as just created (`isNew`), so older stacks are never re-processed.
> - **No frontend copy of the rules and no fallback.** The frontend's existing soft logic (stale, other-domain, analytics, 5-minimum, 50-cap; add-domain 40-cap) is kept, with the hardcoded-list checks replaced by `node.rule`. The Tools page's Result column is computed by the backend. The migration must run before deploy; the hardcoded arrays are commented out in place, marked DEPRECATED.
> - **5-visible minimum kept on new stacks:** rule hides (Hide, blocked category/tag) stop once only 5 tools would stay visible, in tool order, as the old first-load pass did. Adding a domain/app has no minimum, as today.
> - **Domain and custom-app tools** (tags `domain`, `customApp`, `custom`) are outside the rules entirely — no Show/Hide or category/tag rules, not listed on the admin pages.
> - **Added 2026-10-21:** the migration also whitelists Retargeting / Remarketing and Product Analytics (9 whitelisted categories in total).
> - Admin endpoints (`/users`, `/admin/*`, tool visibility) now require role 0 on the server; an admin cannot remove their own admin role.

## Summary

1. **Per-tool Default / Show / Hide, with bulk actions** on the admin Tools page. An explicit Show or Hide is an admin exception that overrides category rules (decided 2026-10-14; mockups 1–3, 6).
2. **Admin-managed category rules** (new): each category is *Whitelisted*, *Normal* or *Blocked*, set from a new admin Categories page instead of code (mockups 4–5).
3. **Rules apply only when a tool is added to a stack** — never retroactively. Existing stacks are not changed (decided 2026-10-14).
4. **Admin-managed tag rules** (new): a **Tags** tab on the Categories page; each BuiltWith tag is *Blocked* or *Normal* (block-only — tags are never whitelisted) (mockup 7).
5. **Migrate every hardcoded list into the database** so production behavior is preserved on day one: blocked/whitelisted categories, blocked tags, and the hardcoded tool-name list (→ per-tool Hide). The code lists become deprecated fallbacks, then are removed.

## Stakeholder feedback (2026-10-14)

- Moderate–high priority; the stack builder "is not usable until this is resolved". Ship ASAP.
- Needs to block entire categories of tools (example: Email Security) so stacks aren't clogged with irrelevant tools.

## Why today's behavior leaks

- `hiddenCategories` / `WhitelistCategories` are hardcoded in `front/src/app/core/config.ts`; changes need a deploy.
- Hiding is soft (`build-stack.component.ts` `proceedNodes`): a "hidden" tool still shows if it is whitelisted, tagged `analytics`, or if hiding it would leave ≤5 visible tools (`all - hidden > 5`).
- There are actually **three** hardcoded category lists: `hiddenCategories` + `WhitelistCategories` (frontend `config.ts`) and `BlockedCategories` (backend `back/db/models/ToolsNodes.js`, used by `isBlockedCat` when tools are added to an existing stack). See *Migrating the existing lists* below.

## Not retroactive (hard requirement, 2026-10-14)

**Existing stacks must not be disrupted.** Rules are evaluated **once, when a tool node is created on a stack**, and the result is saved on that new node's `hide` flag. Already-saved nodes are never re-evaluated.

- Blocking a category or hiding a tool affects only stacks built afterwards, and tools newly added to existing stacks afterwards (via "add additional domain/app" — existing stacks are otherwise served from cache and not rescanned). Tools already on a stack keep their current visibility.
- Unblocking works the same way: it doesn't re-show tools on stacks that were built while the block was active.
- Stack owners can still show/hide individual tools on their own stacks as today.
- Trade-off: currently cluttered stacks stay as they are. No "re-apply rules" / rebuild UI is planned (not built, not in scope).

**Where the rules run** (both are already the places where a new stack entry's hide flag is decided and saved today):
1. **New stack** — the frontend first-load pass (`build-stack.component.ts` `proceedNodes`), which already decides and saves `hide` for a new stack's tools via `hideNodes`. The rules (precedence above) run first in this pass; the remaining soft logic runs after, and never hides a tool set to Show (`tool.alwaysShow`) or whitelisted.
2. **Tools added to an existing stack** — backend `ToolsNodes.filterToolsByNodes` (creates entries only for tools not already on the stack) via `isBlockedCat`, extended to the full precedence, plus the frontend additional-domain path (~line 1068), which also respects `alwaysShow`.

**Guard for older stacks:** the first-load pass can re-run on an old stack if it never hid anything. To guarantee nothing changes on existing stacks, the backend sends `applyRules: blueprint.created >= RULES_START_DATE` (a config constant set at release) and the new rules only run when it's true. Old stacks keep exactly today's logic. Stacks already record `created`, so **no new field or marker is needed on stack entries.**

## Rule precedence

Evaluated per tool **at node creation**, first match wins:

1. **Tool set to Show by admin** (`tools.alwaysShow === true`) → shown. This is how admins make exceptions to a blocked category.
2. **Tool set to Hide by admin** (`tools.hidden === true`) → hidden, even in a whitelisted category.
3. **Any of its categories is Whitelisted** → shown (existing whitelist behavior — exempt from auto-hide unless the tool is stale).
4. **Any of its categories is Blocked, or its tag is Blocked** → hidden.
5. **Otherwise** → remaining soft rules unchanged (stale-tool, domain-mismatch, `analytics`-tag exemption and count thresholds). No hardcoded lists are consulted once migrated (see below).

Rules 1–4 are **hard** for new nodes: tools shown by a rule are exempt from the remaining soft logic, and tools hidden by a rule ignore the minimum-visible thresholds. Show and Hide can't both be set on a tool — the UI is a single three-way control. Whitelist trumps blocked categories **and blocked tags** (decided 2026-10-14). Today the new-stack pass already lets the whitelist win over tags; the add-domain path lets the tag win — this makes both paths consistent.

Behavior note: today a globally hidden tool in a whitelisted category can still appear (the soft pass skips whitelisted tools). Under rule 2 it will be hidden on **new** stacks. Existing stacks unaffected.

### Per-tool states (Tools page)

| State | Stored as | Meaning |
|---|---|---|
| **Default** | `hidden: false` (or absent), no `alwaysShow` | Follow category rules |
| **Show** | `alwaysShow: true`, `hidden: false` | Always added visibly — overrides Blocked categories and soft rules |
| **Hide** | `hidden: true`, no `alwaysShow` | Always added hidden — overrides Whitelisted categories |

`hidden` keeps its current meaning, so existing hidden tools stay Hide and every other existing tool is Default — no reinterpretation of existing data. The Tools page shows each tool's **resulting** visibility and why (e.g. "Shown — admin exception", "Hidden — blocked category: Email Security", "Shown — whitelisted: CRM", "Auto").

## Database impact — kept minimal (decided 2026-10-14)

Environment: MongoDB **3.6.3** (prod `marchtach`), Mongoose 5.12.3. `updateMany`, `$unwind`/`$group` aggregation all supported.

- **`categories` collection (existing, reused).** Currently 189 docs `{ _id, name, toolsCount, __v }`, a stale snapshot from `back/reload-tools-categories.js` (tools actually use **962** distinct categories; the live auto-populate path in `Tools.proceedTools` never fires because it checks `dbItem.length`).
  - Add **optional** fields: `status: 'whitelisted' | 'blocked'` and `firstSeen` (set only on newly registered categories). Docs without `status` are Normal. Existing fields untouched.
  - Setting a status upserts by `name` (inserts only if the category doc is missing). Clearing it `$unset`s `status`.
  - `toolsCount` is ignored (stale).
  - **New categories are registered automatically going forward** (see *Keeping categories current*). No backfill of the ~773 missing ones; the admin page lists from tools, so they're visible regardless.
- **`tools` collection.** One new **optional** field `alwaysShow`, written only on tools an admin sets to Show. `hidden` keeps its meaning. The migration sets `hidden: true` on the tools named in the hardcoded tool list (up to 335 records, same field the existing hide button writes); otherwise it's written only when an admin sets a tool.
- **`tags` collection (new, tiny).** `{ name, status?: 'blocked', firstSeen? }`, ~40 docs. Separate from `categories` so names can't collide (tag `mobile` vs category "Mobile").
- **`blueprints_tools` (stack entries) collection.** No schema change. Existing documents are never updated; new ones get `hide` set exactly as today.
- **Migration writes, in total:** `status` on ~100 category docs (92 blocked + 7 whitelisted + `(No category)`), ~37 tag docs (11 blocked), and `hidden: true` on ≤335 tool docs. Nothing else.
- **Before deploy:** `mongodump` of `categories`, `tools`, `blueprints_tools` as a precaution.

## Migrating the existing lists (required for production)

### What exists in code today (verified 2026-10-14)

| List | Location | Entries | Used for |
|---|---|---|---|
| `hiddenCategories` | `front/src/app/core/config.ts:365` | 94 (93 unique — `Compatibility` listed twice) | Soft auto-hide on a new stack's first load; collapsing categories in the stack sidebar |
| `BlockedCategories` | `back/db/models/ToolsNodes.js:6` | 94 (93 unique) — **identical** to `hiddenCategories` | Hide flag set on tools added to an existing stack (`isBlockedCat`) |
| `WhitelistCategories` | `front/src/app/core/config.ts:470` | 7 | Exempt from auto-hide; sorted first in the sidebar |
| *(implicit)* | `isBlockedCat`, `verifyOrderToHide` | — | Tools with **no categories** are treated as blocked |
| `forbiddenTags` | `front/src/app/core/config.ts:1` | 12 | Hide tools by BuiltWith tag (new-stack pass and add-domain path) |
| `forbiddenTools` | `front/src/app/core/config.ts:15` | 347 (335 unique) | Hide tools by exact name (new-stack pass only — the add-domain path doesn't check it) |

Whitelist: Marketing Automation, CRM, Audience Measurement, Conversion Optimization, A/B Testing, Personalization, Visitor Count Tracking.

Quirks preserved as-is (matching is exact and case-sensitive, as today): `Fingerprint` vs `fingerprinting`, `Node.js` vs `NodeJS`, and the typo `Audience Targetg`. Admins can clean these up in the new screen afterwards.

**Conflict:** `Visitor Count Tracking` is in both the whitelist and the block list. Under "whitelist wins" it imports as **Whitelisted** — matching the frontend intent (commit `a0743a0`, "fix whitelisting issue for tools loading hidden"). Confirm with stakeholder.

### Tags in production (`db.tools.distinct("tag")`, 2026-10-14)

41 values. Four are set by the app, not BuiltWith, and are **not shown or blockable**: `domain`, `customApp`, `custom`, `""` (blocking `domain` would hide the stack's own domain node). That leaves **37 BuiltWith tags**.

Tools per currently excluded tag: hosting 1,100 · cms 847 · javascript 803 · framework 674 · ns 242 · ssl 128 · Web Server 100 · cdn 94 · copyright 31 · css 7 · CDN 1 · **feed 0** (prod uses `feeds`, so `feed` has never matched anything). `cdns` and `feeds` exist but aren't excluded today.

Why tags weren't folded into categories: `hosting` maps cleanly to hosting categories, but `cms` tools span ~200 categories including CRM, Marketing Platform, Landing Page and Lead Generation, so no category block can replace it safely.

### Import result

- **Categories:** 92 Blocked (93 unique minus Visitor Count Tracking), 7 Whitelisted, `(No category)` Blocked (reserved doc, pinned row on the Categories page). Everything else (~863): Normal.
- **Tags:** 11 Blocked — `hosting`, `cms`, `javascript`, `framework`, `ns`, `ssl`, `Web Server`, `cdn`, `CDN`, `copyright`, `css`. `feed` is dropped (matches nothing). The other 26 BuiltWith tags: Normal.
- **Tools:** each unique name in `forbiddenTools` → `hidden: true` (Hide) on the tool doc with that exact name.

### Migration script — `back/migrate-visibility-rules.js`

Same style as `back/reload-tools-categories.js` (standalone node script using `config.js`).

- Reads a **frozen snapshot** `back/db/seed/visibility-rules-2026-10.json` (all five lists above, committed once), not the live code, so the import is reproducible after the code lists are deleted.
- **Categories and tags:** for each name, set `status` **only when the doc has no `status` yet** (insert if missing) — never overwrites an admin's choice, safe to rerun. Also registers all 37 BuiltWith tags currently in use (Normal unless listed).
- **Tools:** `updateMany({ name: { $in: names }, alwaysShow: { $ne: true } }, { $set: { hidden: true } })` — skips any tool an admin has already set to Show.
- **Reports for review** (no writes): tool names that match no tool doc; listed tools that are in a whitelisted category (today they're visible on new stacks because the whitelist exempts them — as Hide they'll be hidden).
- `--dry-run` (default) prints what would change; `--apply` writes.
- Prints a summary and verifies `blocked categories = 92`, `whitelisted = 7`, `blocked tags = 11`.
- Run order: `marchtach_dev` → `marchtach_staging` (verify a new stack matches production behavior) → `marchtach` after `mongodump`.

### Deprecation of the code lists

1. **This release:** `hiddenCategories`, `BlockedCategories`, `WhitelistCategories`, `forbiddenTags` and `forbiddenTools` are marked `@deprecated` and used **only as a fallback** if the backend returns no rules (e.g. DB read fails, or frontend deployed before backend). A console warning is logged when the fallback is used.
2. **Follow-up release** (after ~2 weeks in production with no fallback warnings): delete the five lists and the fallback code. The JSON snapshot stays as the historical record.

Rollback: redeploy the previous build. The old code still uses its hardcoded lists and ignores `status`, so no data cleanup is needed.

### Behavior change to accept

Imported **Blocked** categories become **hard** on new stacks (rule 4), where today the new-stack pass is soft: blocked-category tools can still appear if hiding them would leave ≤5 tools visible, or via the `analytics`-tag exception. For tools added to existing stacks the backend already hides them hard today, so that path is unchanged. Existing stacks are unaffected either way.

Two smaller changes from the tool-name migration, new stacks / newly added tools only: whitelisted tools on the list become hidden (Hide beats the whitelist; the script lists them for review), and listed tools are now also hidden on the add-domain path, which never checked the list.

## Keeping categories current (2026-10-14)

Categories should update over time as BuiltWith returns new ones. Today the auto-add in `Tools.proceedTools` never fires: it checks `dbItem.length` (always undefined on a document), and only covers newly created tools — not existing tools whose categories were refreshed by the stale-category fix (commit `83e38a6`).

- In `proceedTools`, collect every category name from the BuiltWith response (new **and** updated tools) and register them in one `bulkWrite` of `updateOne({ name }, { $setOnInsert: { name, firstSeen: now } }, { upsert: true })` — supported on MongoDB 3.6.
- Insert-only: never modifies an existing category doc, never sets `status`. New categories arrive as **Normal** and follow rule 5 until an admin sets them.
- Doesn't use `proceedList` (it increments the stale `toolsCount` and isn't awaited); `proceedList` stays for `reload-tools-categories.js`.
- Runs after the tools are saved and is non-blocking: a failure is logged and never breaks stack loading.
- No unique index is added (to avoid an index build on prod). A rare duplicate doc from concurrent upserts is harmless: the admin list groups by name, and `setStatus` uses `updateMany({ name })`.
- Categories page: a **New** filter (categories with `firstSeen` in the last 30 days) so admins can review what BuiltWith has started returning.
- **Tags work the same way:** newly seen tag values are registered in `tags` (insert-only, Normal), excluding the four app-set tags; the Tags tab has the same New filter.

## Backend

**`back/db/models/Tools.js`**
- Add optional `alwaysShow: Boolean` to schema.
- `proceedTools`: register newly seen categories and tags (see *Keeping categories current*); remove the dead `dbItem.length` branch.
- `getTagCounts()` → read-only aggregate `$sortByCount: '$tag'`, excluding app-set tags.
- `bulkSetVisibility(ids, state)` → one `updateMany({ _id: { $in: ids } }, update)` where update is: `show` → `{ $set: { alwaysShow: true, hidden: false } }`; `hide` → `{ $set: { hidden: true }, $unset: { alwaysShow: 1 } }`; `default` → `{ $set: { hidden: false }, $unset: { alwaysShow: 1 } }`.
- `getList` / `getByName`: optional `category` filter (for the link from the Categories page).
- `getCategoryCounts(search, offset, limit)` → read-only aggregate: `$unwind: '$categories'`, optional `$match` on name regex, `$group` count, `$sort: { tools: -1 }`, plus total.

**`back/db/models/Categories.js`**
- Add optional `status: String` and `firstSeen: Date` to schema.
- `setStatus(name, status)` → `updateMany({ name }, status ? { $set: { status } } : { $unset: { status: 1 } }, { upsert: !!status })`.
- `getRules()` → `{ whitelisted: [names], blocked: [names] }` from docs with a `status`.

**`back/db/models/Tags.js`** (new)
- Schema `{ name: String, status: String, firstSeen: Date }`.
- `setStatus(name, status)` (`'blocked'` or unset), `getBlocked()` → `[names]`.

**`back/core/controllers/tools.js`**
- `bulkSetVisibility` — body `{ ids: string[], state: 'default' | 'show' | 'hide' }`. The existing single-tool `updateVisibility` endpoint keeps working (maps to hide/default).
- `getCategories` — merges aggregate counts with statuses; supports `search`, `status` filter, `offset`, `limit`.
- `setCategoryStatus` — body `{ name, status | null }`.
- `getTags`, `setTagStatus` — same shape, `status` is `'blocked' | null`.

**`back/db/models/ToolsNodes.js`**
- `filterToolsByNodes`: load `getRules()` + Show/Hide tools once per call; set `hide` on new entries per precedence via `isBlockedCat`. Never touch existing entries.
- `isBlockedCat` uses DB rules (incl. `(No category)`) plus blocked tags; `BlockedCategories` becomes the deprecated fallback.

**`back/core/controllers/blueprints.js`**
- Alongside both existing `getHiddenTools()` steps (~lines 132, 310), add `data.categoryRules = await categories.getRules()`, `data.blockedTags = await tags.getBlocked()` and `data.applyRules` (see guard above).

**`back/core/router.js`** (all JWT-protected)
- `POST /tools/bulkSetVisibility`
- `GET  /admin/categories`
- `POST /admin/categories/status`
- `GET  /admin/tags`
- `POST /admin/tags/status`

## Frontend

**`core/services/blueprints.service.ts`**
- `bulkSetToolVisibility(ids, state)`, `getAdminCategories(params)`, `setCategoryStatus(name, status)`, `getAdminTags(params)`, `setTagStatus(name, status)`.

**Category rules source**
- Replace direct use of `WhitelistCategories`, `hiddenCategories`, `forbiddenTags` and `forbiddenTools` in `build-stack.component.ts` and `tools-list.component.ts` with the server-provided `categoryRules` / `blockedTags` / hidden tools (blocked categories keep collapsing in the sidebar; whitelisted keep sorting first), falling back to the deprecated `config.ts` constants only if the field is absent.

**`pages/build-stack/build-stack.component.ts`**
- When `applyRules` is true: in `proceedNodes`, apply rules 1–4 first, then the remaining soft logic, never hiding `alwaysShow` or whitelisted tools. When false: today's logic, unchanged. No load-time filtering of saved stacks.

**Tools page — `pages/tools-managment/*`** (mockups 1–3, 6)
- `SelectionModel` (`@angular/cdk/collections`, already at `^9.1.2`) with checkbox column + master checkbox.
- Per-row three-way control **Default / Show / Hide**, plus a **Result** column with the resulting visibility and reason.
- Categories shown per tool; optional category filter chip (arrives pre-set from a Categories page link).
- Bulk bar: "Show Selected", "Hide Selected", "Reset to Default", "Clear selection". Select-all covers the current page.

**New Categories page — `pages/categories-managment/*`** (mockups 4–5)
- Route `profile/categories` with `AuthGuard`; "Categories" link in the admin nav next to Tools / Users.
- Table: Category, Tools (count), Examples, Status (Whitelisted / Normal / Blocked segmented control). Pinned `(No category)` row.
- Search by name; filter chips All / New / Whitelisted / Blocked / Normal; sorted by tool count desc, paginated (962 categories and growing).
- Confirm dialog when blocking: shows how many tools are affected and notes that tools also in a whitelisted category stay visible.
- **Tags tab** (mockup 7): tabs "Categories | Tags" under the page title. Tag, Tools (count), Examples, Status (**Normal / Blocked** only). Filter chips All / New / Blocked / Normal. App-set tags not listed. Same confirm dialog on block.

## Out of scope / follow-ups

- Removing the deprecated code lists (follow-up release, see above).
- Select-all across all pages of tools.
- MongoDB 3.6 is end-of-life (2021); plan an upgrade separately.

## Estimate

~1 day (8–9 h): Tools page with three-state + bulk ~1.5 h; category + tag rules backend ~1.5 h; Categories page with Tags tab ~2 h; creation-time rules + stack builder changes ~1.5 h; migration script (categories, tags, tools) + dev/staging verification ~1.5 h.

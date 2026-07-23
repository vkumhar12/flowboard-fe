# flowboard-fe — Codebase Audit

Scope: `flowboard-fe` only (React 19 + TypeScript strict + Vite 8 + Tailwind v4). Audit-only — no code was changed as part of this document. Findings come from seven passes: code standards, security, performance/code-splitting, accessibility, race conditions/error handling, browser compatibility/mobile, and form validation.

---

## 🔴 Critical

| # | Finding | Where |
|---|---|---|
| 1 | **No keyboard support for drag-and-drop.** `KanbanBoard.tsx` only configures `PointerSensor` — no `KeyboardSensor`. The core feature of the app (moving tasks between columns) is 100% unusable for keyboard and screen-reader users. WCAG 2.1 Level A failure. | `src/components/board/KanbanBoard.tsx` |
| 2 | **No error boundaries anywhere.** A single unexpected render error (malformed API response, unexpected null) white-screens the entire app with no fallback UI. | `src/main.tsx`, `src/App.tsx` |
| 3 | **Mobile navigation is completely broken.** Sidebar is `hidden md:flex` with no hamburger/bottom-nav alternative. Below ~768px there is no way to navigate to any page. | `src/components/layout/Sidebar.tsx:80` |

## 🟠 High

- **2 high-severity npm vulnerabilities** — `ws` (memory-exhaustion DoS), pulled in transitively via `socket.io-client` → `engine.io-client`. Fix: `npm audit fix`.
- **`renameColumn`/`deleteColumn` have no rollback on API failure.** Unlike task update/move/delete (which correctly save-and-restore previous state on error), these two optimistically update the UI and only show a toast on failure — leaving the UI out of sync with the server. `src/hooks/useBoard.ts:205-231`
- **3 modals silently fail on empty required fields.** `CreateBoardModal`, `MembersModal`, and `AIGenerateModal` all do `if (!x.trim()) return;` with zero user feedback — the submit button just does nothing. (`TaskModal` does the same check correctly, with a toast — inconsistent across the app.)
- **Modals lack dialog semantics and focus management.** No `role="dialog"`/`aria-modal`, no focus trap (Tab escapes the modal), no focus restoration to the triggering element on close. Affects every modal (`TaskModal`, `CreateBoardModal`, `MembersModal`, `AIGenerateModal`, `AISummaryModal`, `ConfirmDialog`) since they all share `src/components/ui/Modal.tsx`.
- **Icon-only buttons with no `aria-label`/`title`.** Column menu (`⋯`), modal close (`X`), member-remove button, activity-feed close button. Screen readers announce these as just "button." (Sidebar/Topbar icon buttons *do* have `title` — inconsistent.)
- **Form inputs missing label association.** `MembersModal`'s email input has no `id`, so its `<label>` isn't programmatically linked; `FilterSelect` has no label or `id` at all.
- **Kanban columns are fixed `330px` wide with no mobile override.** On a 375px phone that's ~88% of the viewport — usable only via horizontal scroll, no responsive collapse.
- **Zero code-splitting.** Every route is a static import in `App.tsx`. Visiting `/login` downloads the entire app — landing page, dashboard, `@dnd-kit`, `framer-motion`, `socket.io-client`.
- **Context providers recreate their value object every render.** `AuthContext` and `BoardsContext` pass a fresh object literal to `.Provider value={{...}}` with no `useMemo`, so all consumers (`useAuth()`/`useBoards()`, 35+ call sites) re-render on any state change anywhere in the app.
- **No `React.memo` on `Column`/`TaskCard`.** Every drag operation re-renders every task card in every column, not just the one that moved.

## 🟡 Medium

- **JWT stored in `localStorage`** (`src/lib/api.ts`). Standard SPA/JWT tradeoff — CSRF-safe but XSS-stealable. No XSS injection sink was found anywhere in the app, so current risk is low, but worth knowing this is the tradeoff being made.
- **Open redirect on post-login navigation.** `Login.tsx:28-30` trusts `location.state.from.pathname` for the post-login redirect without validating it against known app routes.
- **Hardcoded demo credentials shipped in the JS bundle.** `Login.tsx:20` (`alex@timetoprogram.com` / `Test@1234`) — fine for a demo, but visible to anyone reading the bundle.
- **Socket-pushed data isn't schema-validated before hitting state.** `src/hooks/useBoard.ts:72-103` — currently harmless since React auto-escapes render output, but no safety net if a future field is ever rendered unsafely.
- **`errorMessage()` helper reimplemented in 9 files** instead of living once in `src/lib/utils.ts`.
- **No list virtualization.** Dashboard's board grid, MyTasks' grouped lists, Calendar's day cells, Team's member grid all render everything at once. Fine at current scale, will matter past ~100+ boards/tasks.
- **Avatar `<img>` has no `loading="lazy"`** and no URL scheme validation on `src`.
- **`Dashboard.tsx` is large** (746 lines, 9 inline sub-components) — workable but at the size where splitting sub-components into their own files would help. *(Note: partially addressed — some Dashboard sub-components have since been extracted into `src/components/dashboard/`.)*
- **Dark theme's `--color-faint` (`#64748b` on `#0b1220`) is borderline/likely-failing WCAG AA contrast** for secondary/hint text.
- **`ActivityFeed` has a fetch race condition** on rapid close/reopen (no `AbortController`/stale-response guard) and **silently swallows fetch errors** (`.catch(() => {})`).
- **Modal dialogs have no max-height/scroll constraint** — large modals can overflow small viewports.
- **`color-mix()`/`backdrop-filter` used with zero `@supports` fallback.** Breaks on browsers older than ~2022 (Chrome <111, Safari <16.4, Firefox <113). Likely a non-issue for this app's audience, flagged for completeness.
- **`CommandMenu`'s focus `setTimeout` has no cleanup** on fast unmount (50ms, low real-world risk).

## 🟢 Low / informational

- 3 ESLint unused-import warnings (`FileText` in `AISpotlight.tsx`, `Bell` in `Topbar.tsx`, `Button`/unused imports in `HeroSplit.tsx`) + previously a commented-out `<HeroSplit />` in `Landing.tsx`.
- Hero's landing-page animations (`repeat: Infinity`) loop even while the user is elsewhere in the app — negligible CPU cost.
- Minor indentation inconsistency in `Register.tsx` vs. `Login.tsx`.
- No live-region announcement when new Socket.IO activity arrives (`ActivityFeed`) — screen readers won't know the list updated.
- Column title's double-click-to-edit affordance isn't signaled to assistive tech (`Column.tsx`).

## ✅ Confirmed clean

- No `dangerouslySetInnerHTML` / `eval(` / `innerHTML` anywhere in the app.
- Zero `console.log`/`console.error`/`console.warn` calls.
- No secrets in `VITE_*` env vars (only non-sensitive config like `VITE_API_URL`).
- TypeScript strict mode genuinely respected — zero `any` usage despite the lint rule being disabled project-wide.
- Touch/tablet drag-and-drop works fine (`PointerSensor` handles both mouse and touch).
- Viewport meta tag present and correct.
- Task update/move/delete all have correct optimistic-update rollback on failure (unlike column rename/delete, see High).
- Double-submit protection present on every form via `Button`'s `loading`/`disabled` state.
- `useEffect` event-listener cleanup is correct almost everywhere (Socket.IO listeners, `mousedown`, scroll, timers) — only `CommandMenu`'s 50ms timeout lacks cleanup.
- Form patterns (controlled inputs, submit handling) are consistent across Login/Register/modals.
- File/folder organization is clean — components, services, hooks, types, and utils are cleanly separated by concern, no misplaced files.

---

## Bottom line

Code standards, security posture, and general engineering discipline are solid — this doesn't read like a beginner project. The real gaps are:

1. **Three critical, ship-blocking issues**: no error boundary, no keyboard-accessible drag-and-drop, and completely broken mobile navigation.
2. **Performance-at-scale**: fixable with a handful of small, mechanical changes (`npm audit fix`, memoize two context values, `React.memo` on two components, lazy-load routes).
3. **A UX-consistency gap**: three modals give zero feedback on invalid submission, while a fourth (`TaskModal`) does it correctly — the fix pattern already exists in the codebase, it just needs applying uniformly.

### Suggested fix order

1. Top-level error boundary
2. `renameColumn`/`deleteColumn` rollback-on-failure (mirror the pattern already used by `updateTask`/`removeTask`/`moveTask`)
3. Fix the 3 silent-fail modals (mirror `TaskModal`'s pattern)
4. `useMemo` on `AuthContext`/`BoardsContext` provider values + `React.memo` on `Column`/`TaskCard`
5. Accessibility pass: `KeyboardSensor` on the DnD context, modal focus trap + `role="dialog"`, `aria-label`s on icon-only buttons, label association on form inputs
6. Mobile nav for the sidebar (hamburger or bottom nav) + responsive Kanban columns
7. `npm audit fix`
8. Everything else in Medium/Low, opportunistically

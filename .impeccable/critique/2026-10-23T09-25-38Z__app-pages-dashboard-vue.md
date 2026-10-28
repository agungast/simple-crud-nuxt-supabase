---
target: app/pages/dashboard.vue
total_score: 13
max_score: 40
na_heuristics: 
p0_count: 3
p1_count: 2
target_identity: "file:D:\\Talenavi\\CRUD_Nuxt\\takt-vibe-app\\app\\pages\\dashboard.vue"
target_fingerprint: "sha256:74ed1154ba7ff252d75375ccf8ff269d17c3dea89823d86f5067888f5b7745a5"
target_path: "D:\\Talenavi\\CRUD_Nuxt\\takt-vibe-app\\app\\pages\\dashboard.vue"
timestamp: 2026-10-23T09-25-38Z
slug: app-pages-dashboard-vue
---
# Critique — TaktVibe Dashboard

**Target:** `app/pages/dashboard.vue` (post-login home, judged inside `layouts/default.vue` + `AppHeader.vue`, compared against the auth screens)
**Product:** TaktVibe — personal task manager, Nuxt 4 / Vue 3 / Supabase, Indonesian UI
**User brief:** "kurang enak dipandang & sulit dipahami orang awam"

**Method:** dual-agent. Assessment A (independent design review, session `ses_e97f35066ffeeo6P3JtBN0uCwK`) read the UI source and judged design specificity, heuristics, cognitive load, emotional journey, personas. Assessment B (deterministic detector, session `ses_e97f35055ffebLnYbI5unmPdXw`) ran the CLI scan plus live-page scans over CDP at 1440×900 and 390×844 while signed in against mocked Supabase data (9 tasks, 3 spaces).

**Visual evidence caveat (important):** screenshots were captured from the real running app, but neither assessment model can accept image input, so nothing here is a claim of "I looked at the picture and it felt off". Every visual judgment below is derived from (a) the actual source/CSS and (b) measured DOM geometry and computed styles from the live page. Numbers are measured, not estimated. No user-visible overlay was injected (headless Chrome), so browser evidence is the CDP scan output, not a highlighted overlay in a [Human] tab.

---

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 2 | No page title or `<h1>` anywhere; the metrics strip is unlabeled numbers with no "where am I / what is this" anchor. Loading and toast states do exist. |
| 2 | Match System / Real World | 1 | Status vocabulary mixes English and Indonesian (`Backlog`, `To Do`, `In Progress`, `Done`) inside an Indonesian UI; "Ruang Kerja" and "Status Alur" are internal model names, not user language. |
| 3 | User Control and Freedom | 1 | No undo for destructive row actions; archive is terminal from the row; no way to leave the "add task" flow without losing 7 filled fields. |
| 4 | Consistency and Standards | 1 | Three sidebar items look clickable but are dead `<div class="nav-item">`; empty state says "form di sebelah kiri" although on mobile the form is above; `⌘K` hint on a Windows-first app; avatar uses Arial while the rest is Outfit. |
| 5 | Error Prevention | 1 | 8 inputs with no defaults shown for status/space; user can submit into an ambiguous state (`TODO` vs `BACKLOG`) without knowing the consequence. |
| 6 | Recognition Rather Than Recall | 2 | Table + Kanban + Calendar give three mental models, but no legend explains badge colors or what a priority dot means. |
| 7 | Flexibility and Efficiency | 2 | Genuine strengths: three view modes, keyboard shortcuts, focus timer. Undermined by having to fill the full form to add one task. |
| 8 | Aesthetic and Minimalist Design | 1 | 98 interactive controls mounted on one screen; four stacked bordered cards; equal-height 1032px form card leaving ~500px of dead space. |
| 9 | Help Users Recognize/Recover From Errors | 1 | Failures surface as toasts only; no inline field error, no recovery path, no explanation of what went wrong. |
| 10 | Help and Documentation | 1 | `FeatureTour.vue` exists but is mounted only in `app/pages/index.vue:107` (the marketing page). A user who logs in never sees onboarding. |
| **Total** | | **13/40** | **Poor — 12–19: major UX overhaul required; core experience broken** |

---

## Design Specificity Verdict

**Category-interchangeable admin dashboard, not a personal task manager.**

The evidence is structural, not stylistic:

- The page opens with a **5-segment metric strip** (1152×98 at y=84) — the same composition SaaS dashboards use for revenue/churn/MRR. For one person with nine tasks, this is a shop window, not a workspace.
- The **add-task form is a full 8-field panel** (360×1032) rendered permanently next to the list, holding space even when the user is not adding anything.
- The two cards are **stretched to identical height** (`align-items: stretch`), so the short form is padded to match a 9-row table — a layout decision that exists to make a grid look tidy, not to serve the task.
- **Semantics stop at the surface**: no `<h1>`, no page title, metrics as `<span>`s. The screen is a collection of boxes with numbers, which is exactly the generic-dashboard failure mode.

A task manager for real people would open on *"what should I do next"* — today's tasks, overdue, one obvious way to add something. This opens on *aggregate statistics about tasks*, then a data-entry panel, then a spreadsheet.

### Deterministic scan

- **Static scan (`detect --json app/`, 27 Vue files):** 1 finding, 0 primary, 1 advisory — `codex-grid-background`, `app/pages/index.vue:812` (decorative two-axis hairline grid in the landing hero; genuinely a generated-UI signature).
- **Live desktop (1440×900, `--cdp 9340`):** 4 primary + 1 advisory, all `low-contrast`:
  - `span.meta-project-badge span` — 3.9:1 (need 4.5:1) — `#2a83b0` on `#112035`
  - `span.meta-project-badge span` — 3.2:1 — `#2f7d8f` on `#10252e`
  - `button.status-badge` (`p-medium`) — 3.4:1
  - `span.task-text.completed-text` — 3.7:1 — `#657286` on `#0f172a`
  - advisory: `button.status-badge.status-done` — 4.4:1, just under the line
- **Live mobile (390×844, `--cdp 9341`):** the same 4 primaries repeat — the contrast defect is not viewport-dependent.
- The scan confirms the *symptom* (completed rows are washed out) but cannot see the *cause*: `.table-row.row-completed { opacity: 0.65 }` at `app/components/TaskItem.vue:585` fades the entire row, including every badge inside it. A rule-based detector will never flag "the page has no title" or "the first task is 1.7 screens down" — those came from measured geometry.
- No false positives found. The grid-background advisory is accurate: `index.vue:73` renders `<div class="hero-bg-grid" aria-hidden="true">`, styled at `index.vue:812-820`.

---

## Overall Impression

The craft is present — consistent tokens, a real dark/light system, Outfit throughout, no neon glow, no bounce, no side-accent-border cards, 0 contrast failures in my own computed-style sweep of body text. Someone cared about the anti-slop rules. But the **information architecture is borrowed from an analytics product**, and the result is a screen that answers a question nobody asked ("how many tasks are there?") before answering the one everybody asks ("what do I do now?").

The biggest single opportunity: **make the task list the page, and demote everything else to a supporting layer.** Right now the list is the third thing you meet on desktop and the fourth on mobile.

---

## What's Working

1. **Three view modes with a real mental model shift.** Table for scanning, Kanban for flow (5 columns), Calendar for time. `app/pages/dashboard.vue` switches them without a page reload, and each view is a genuinely different way of thinking rather than a re-skin.
2. **Design tokens are disciplined.** `app/assets/css/theme.css` defines a coherent dark/light pair with semantic names (`--bg-surface`, `--text-soft`, `--border-subtle`). Light mode is a real theme, not an inverted hack, and the anti-FOUC script plus CSP hash show attention to production detail.
3. **Typography and motion follow the house rules.** Outfit everywhere except two defaults (avatar, `kbd`); transitions are 150–250ms on `transform`/`opacity` with an exponential ease-out, not bounce. This is the part that already feels "not AI-generated".

---

## Priority Issues

### [P0] The page has no title and opens on statistics instead of work

**What:** `dashboard.vue` renders `.metrics-container` as the first block (y=84) and contains no `<h1>`; the only headings are two `<h2 class="card-title">` ("Tambah Tugas Baru", "Daftar Tugas"). The five metric segments have no heading and no explanation.
**Why it hurts laypeople:** A first-time user cannot answer "what screen is this, and what am I supposed to do?" The five numbers (Total, Selesai, Aktif, Waktu Fokus, Tingkat Penyelesaian) look important but are not actionable — clicking them does nothing, and `.metric-segment:hover` even adds a hover effect (`dashboard.vue:329`), implying interactivity that does not exist.
**Fix:** Add a real page header: `<h1>Tugas Saya</h1>` + one line of context ("9 tugas · 1 terlambat · 1 jatuh tempo hari ini") + a primary button "Tambah Tugas" on the right. Replace the 5-segment strip with either (a) a single compact status sentence, or (b) at most 3 counts that are clickable filters (Terlambat / Hari ini / Selesai). Remove the hover state from non-interactive segments.

### [P0] On mobile, the actual work starts 1.7 screens down, behind a horizontally scrolling table

**What:** At 390×844 the metrics strip is 358×432 (y=76–508) — **51% of the first screen** is numbers. The 813px add-task form then comes before the list (`.content-grid` starts y=528), so the first task row is at **y=1473**. The table is **766px wide inside a 356px container** — more than 2× overflow, so every row must be swiped sideways to read status, due date and actions.
**Why it hurts laypeople:** A phone user sees: logo bar → five statistics → a long form. They have to scroll past a data-entry panel to find out whether they have any tasks at all. Then the one view they land on is the worst possible mobile pattern.
**Fix:** Reorder for small screens: list first, metrics collapsed to one line, form behind a "Tambah Tugas" button that opens a bottom sheet. Switch the table to a stacked card row below ~720px (title + due + priority badge on one line, status/actions on the next). The Kanban board is a better mobile default than the table; consider making it the mobile default view.

### [P0] Adding one task requires 8 decisions, most of them optional and named in jargon

**What:** `TaskForm.vue` exposes, before the primary submit: Nama Tugas (required), Prioritas (4 segmented buttons), Ruang Kerja (select + "+ Space Baru" button above it), Status Alur (select: Backlog / To Do / In Progress / Done), Batas Waktu (custom DatePicker), Estimasi jam (number), Tag/Label (type-and-enter), Lampiran (drag-drop + per-file "Privat" toggle). On desktop the form card is forced to **1032px** to match the table, so roughly half of it is empty space.
**Why it hurts laypeople:** The primary job — "write down a task" — is buried under model vocabulary. "Status Alur", "Ruang Kerja" and "Estimasi" are terms from the database, not from the user's day. A layperson will either abandon the form or fill fields arbitrarily, which then produces a dashboard full of meaningless badges.
**Fix:** Ship a **quick add**: one input (`Apa yang perlu dikerjakan?`) + Enter → task created with sensible defaults. Put the rest behind a "Detail" disclosure (priority, due date, space, tags, attachments). Default status to `TODO` and hide the status field from creation entirely — status is changed by moving the card or checking it off, not by choosing from a dropdown. On desktop, stop stretching the card to the table's height.

### [P1] Completed rows are faded with whole-row opacity, breaking badge contrast

**What:** `.table-row.row-completed { opacity: 0.65 }` (`TaskItem.vue:585`) fades the entire row. Detector measures the fallout at **3.7:1** (`completed-text`), **3.9:1** and **3.2:1** (project badges), **3.4:1** (priority badge) and **4.4:1** (status badge) — all under the 4.5:1 AA floor. Additionally, the design token `--text-muted: #64748b` on `--bg-base: #090d16` computes to **4.09:1**, so any small muted text placed on the page background is already non-compliant.
**Why it hurts laypeople:** Completed tasks are exactly the rows people revisit to confirm "did I actually do that?" — and they are the least readable rows on screen. Low-vision users lose them entirely.
**Fix:** Delete the row-level `opacity`. Express completion with one explicit signal: strikethrough on the title + a green check + a muted-but-compliant text color (>= 4.5:1). Darken `--text-muted` to at least `#7c8aa0` (or stop using it for small text).

### [P1] 98 interactive controls on one screen, four of them 28×28 icon-only per row

**What:** The dashboard mounts **98 focusable/interactive elements**. Each task row carries four icon-only buttons (28×28 measured), plus a status badge button and a title button. Below the 24×24 WCAG 2.5.8 minimum in some cases, and far below the 44×44 touch target on mobile.
**Why it hurts laypeople:** Four unlabeled icons per row is a memory test — users must hover each one to learn what it does, and on touch there is no hover at all. 98 controls also means tabbing through the page is punishing.
**Fix:** Collapse row actions into a single "⋯" menu (min 40×40) with text labels: "Ubah", "Duplikat", "Arsipkan", "Hapus". Keep the two most frequent actions inline, with `aria-label` and tooltips. Target <= 25 interactive controls on the default view.

### [P2] Visual monotony: four stacked bordered boxes with no type scale

**What:** Metrics card, form card, list card and each Kanban card share the same 1px border + `--bg-surface` treatment. Type sizes cluster at 12–16px with no display size anywhere; the largest number on the page is a metric value, not the page identity. Equal-height stretching produces an obviously empty lower half in the form card.
**Why it hurts laypeople:** Nothing tells the eye what matters. The page reads as a uniform grid of panels, so every element competes equally and the user has to read everything to find the starting point.
**Fix:** Introduce a 4-step scale (32 / 20 / 16 / 13) and use 32 only for the page title. Reduce to *two* card surfaces: one for the work area, one for a collapsed "Tambah" area. Let the form be its natural height and align the top, not the bottom.

### [P2] First-run guidance exists but is unreachable

**What:** `FeatureTour.vue` is mounted only at `app/pages/index.vue:107` — the public landing page. After login, no tour, no empty-state guidance beyond one sentence, no explanation of priority dots or view modes.
**Why it hurts laypeople:** The exact user the brief names — someone who is not a project-management native — is dropped into a 98-control screen with three view modes and a five-column Kanban, with zero orientation.
**Fix:** On first login (or empty state), show a 3-step inline guide anchored to real UI: "1. Tulis tugas, Enter. 2. Ubah status dengan klik badge. 3. Pindah view di sini." Persist dismissal; make it replayable from the profile menu.

### [P3] Dead affordances and copy that lies about layout

**What:** `app/layouts/default.vue` renders "Semua Tugas", "Selesai", "Aktif" as `<div class="nav-item">` with no click handler — they look exactly like the working "Dashboard" link. `TaskList.vue:20` says "Tambahkan tugas pertama Anda menggunakan form di sebelah kiri", which is false on mobile. The topbar advertises `⌘K` on Windows. The avatar renders in Arial.
**Fix:** Either wire the three nav items to real filters (they map cleanly to `activeProjectId` / `completedCount`) or remove them. Rewrite the empty state to "Tambahkan tugas pertama Anda" + a button. Detect platform for the shortcut hint, or show `Ctrl K`. Set `font-family: inherit` on the avatar button.

---

## Persona Red Flags

**Jordan — first-timer / layperson (primary persona for this brief)**
Does not know what "Backlog" means versus "To Do", or why a task needs both a "Ruang Kerja" and a "Status Alur". Faced with 8 inputs, Jordan fills the title and guesses the rest — or leaves. After submitting, the metrics strip updates but nothing says "saved". On mobile, Jordan never reaches the list without scrolling past the form, and when they do, the table's status column is off-screen to the right.

**Riley — mobile-only**
Gets 51% of the first screen as statistics, then an 813px form, then a 766px-wide table in a 356px viewport. Horizontal scroll is required to see due dates and actions; row action buttons are 28px, well under a comfortable touch target. The `⌘K` hint is meaningless on touch. The empty-state instruction points to a form that is not "di sebelah kiri".

**Sam — accessibility**
Completed rows measure 3.2–3.9:1, below AA. `--text-muted` (#64748b on #090d16) is 4.09:1 wherever it is used for small text on the page background. No `<h1>` means no page landmark; the five metrics are unlabeled spans, so a screen reader announces bare numbers. The status badge is a `<button>` inside a table cell with no accessible name describing the transition it will perform.

**Alex — power user (secondary)**
Gets keyboard shortcuts, three views and a focus timer, but no bulk actions, no multi-select, no filter persistence, and no command palette behind `⌘K` (the search exists but the promise of a command surface does not). 98 tab stops make keyboard-only operation slower than it should be.

---

## Minor Observations

- `Ruang Kerja` select has a `+ Space Baru` button placed *above* the select (`TaskForm.vue`), so the create-space action reads as the field's label.
- Kanban renders 5 columns on a 390px viewport — columns become very narrow; no horizontal snap or column picker.
- `DatePicker.vue` is custom; verify keyboard entry (typing a date) works, not just calendar clicking.
- Light theme was verified through computed styles but the light-mode screenshots could not be visually inspected; contrast tokens are the same pair in both themes, so the badge failures persist in light mode with different values.
- `--accent-gradient` and the violet focus ring (`rgba(79,70,229,…)`) are the closest the app comes to the forbidden AI palette; they stay within the letter of the rules but are the least characteristic part of the system.
- The landing page's `hero-bg-grid` is the only detector hit — a decorative grid that has nothing to do with the product.
- `AGENTS.md` forbids nested cards and side-accent borders; the dashboard respects both. This is a disciplined codebase.

---

## Questions to Consider

1. If the dashboard opened with one sentence — "Hari ini: 2 tugas, 1 terlambat" — instead of five numbers, what would break? (Honest answer: nothing functional. That is the tell.)
2. Is `Status Alur` a user concept at all, or an implementation detail leaking into the form? Could status be derived entirely from user actions (check off, drag, archive)?
3. Who is the metric strip for? If the answer is "nobody, it just looked like a dashboard", it should go.
4. What is the one screen a layperson should be able to use without instructions? If it is "add a task", why is that the most complicated form on the page?

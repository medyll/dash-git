# Dash-Git — Sprint Plan (5 Sprints)

## Sprint 1: Foundation & Auth
**Goal:** Project scaffold + authentication flow — the app boots and users can log in.

| ID | Story | Size | Deps |
|----|-------|------|------|
| S1-01 | SvelteKit project setup (SPA mode, css-base, routing shell) | M | — |
| S1-02 | GitHub OAuth Device Flow (auth_engine) | L | S1-01 |
| S1-03 | App shell layout (sidebar placeholder + tab bar placeholder + content slot) | M | S1-01 |
| S1-04 | GitHub GraphQL client with auth header injection | M | S1-02 |
| S1-05 | SWR query cache (query_cache.svelte.ts) | M | S1-04 |

**Capacity:** 3L equivalent | **Estimated:** ~2.5L

---

## Sprint 2: Sidebar & Tab Engine
**Goal:** Users can see their repos and open them in tabs.

| ID | Story | Size | Deps |
|----|-------|------|------|
| S2-01 | Fetch user repositories (git_engine — repo list) | M | S1-04, S1-05 |
| S2-02 | Global sidebar with repo list + PR badges | L | S2-01 |
| S2-03 | Fuzzy search filter in sidebar | S | S2-02 |
| S2-04 | Tab engine (open/close/switch/persist) | L | S1-03 |
| S2-05 | URL hash sync with active tab | M | S2-04 |

**Capacity:** 3L | **Estimated:** ~3L

---

## Sprint 3: Repo Browser & Tree
**Goal:** Users can browse any repo's file tree and read the README.

| ID | Story | Size | Deps |
|----|-------|------|------|
| S3-01 | Fetch repo tree (git_engine — tree + lazy subdirs) | L | S1-04 |
| S3-02 | TreeView component with expand/collapse + file icons | L | S3-01 |
| S3-03 | Search-in-tree (filter nodes by name) | S | S3-02 |
| S3-04 | README auto-detection and Markdown rendering | M | S3-01 |
| S3-05 | Repo Home view (assemble TreeView + README + branch header) | M | S3-02, S3-04 |

**Capacity:** 3L | **Estimated:** ~3L

---

## Sprint 4: Blob Viewer & PR Status
**Goal:** Users can view files with syntax highlighting and see PR status everywhere.

| ID | Story | Size | Deps |
|----|-------|------|------|
| S4-01 | Fetch blob content (git_engine — file content) | M | S1-04 |
| S4-02 | BlobViewer with syntax highlighting (top 20 languages) | L | S4-01 |
| S4-03 | Line numbers + permalink support | S | S4-02 |
| S4-04 | Raw/copy buttons on blob view | S | S4-02 |
| S4-05 | PR count badges on sidebar + tab icons | M | S2-02, S2-04 |
| S4-06 | CI status indicators (failing builds — red dot) | M | S4-05 |

**Capacity:** 3L | **Estimated:** ~2.5L

---

## Sprint 5: Polish, Performance & Release
**Goal:** Production-ready: perf optimizations, keyboard nav, deploy.

| ID | Story | Size | Deps |
|----|-------|------|------|
| S5-01 | Keyboard navigation (sidebar, tabs, tree) | M | — |
| S5-02 | Virtualized list for large trees (1000+ nodes) | L | S3-02 |
| S5-03 | Rate limit handling + ETag conditional requests | M | S1-04 |
| S5-04 | Loading skeletons + error states for all views | M | — |
| S5-05 | Static build + deploy config (Vercel/Netlify) | S | — |
| S5-06 | E2E tests for critical flows (login, browse, view file) | L | all |

**Capacity:** 3L | **Estimated:** ~3L

---

## Summary

| Sprint | Theme | Stories |
|--------|-------|---------|
| 1 | Foundation & Auth | 5 |
| 2 | Sidebar & Tabs | 5 |
| 3 | Repo Browser & Tree | 5 |
| 4 | Blob Viewer & PR Status | 6 |
| 5 | Polish & Release | 6 |
| **Total** | | **27 stories** |

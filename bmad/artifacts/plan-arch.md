# Dash-Git — Architecture Document

## System Overview

```
┌─────────────────────────────────────────────────┐
│                   Browser (SPA)                  │
│                                                  │
│  ┌──────────┐  ┌──────────┐  ┌───────────────┐  │
│  │ Sidebar  │  │ Tab Bar  │  │  Content Area  │  │
│  │ (Hub)    │  │          │  │  (per-tab view)│  │
│  └────┬─────┘  └────┬─────┘  └───────┬───────┘  │
│       │              │                │          │
│  ┌────┴──────────────┴────────────────┴───────┐  │
│  │              Core Engines (.svelte.ts)       │  │
│  │  auth_engine │ tab_engine │ git_engine       │  │
│  └──────────────────┬──────────────────────────┘  │
│                     │                             │
│  ┌──────────────────┴──────────────────────────┐  │
│  │           API Layer (GraphQL + REST)          │  │
│  │  github_client │ query_cache (SWR)           │  │
│  └──────────────────┬──────────────────────────┘  │
└─────────────────────┼───────────────────────────┘
                      │ HTTPS
              ┌───────┴───────┐
              │  GitHub API   │
              │  (GraphQL v4) │
              └───────────────┘
```

## Component Breakdown

### 1. `auth_engine` — Authentication
- **Responsibility:** GitHub OAuth Device Flow, token storage, refresh, logout
- **Interface:** `login()`, `logout()`, `getToken(): string | null`, `isAuthenticated: boolean` (reactive)
- **Storage:** Token in memory with localStorage fallback (encrypted key)

### 2. `tab_engine` — Tab Lifecycle
- **Responsibility:** Open/close/switch tabs, persist state, sync with URL
- **Interface:** `openTab(descriptor)`, `closeTab(id)`, `activeTab: Tab` (reactive), `tabs: Tab[]` (reactive)
- **Tab descriptor:** `{ type: 'repo' | 'blob' | 'issue' | 'pr', owner, repo, path?, ref? }`
- **Persistence:** URL hash encodes active tab. localStorage stores full tab list.
- **Limit:** 20 tabs max, LRU eviction with user confirmation

### 3. `git_engine` — Data Normalization
- **Responsibility:** Fetch and normalize repo data, trees, PRs, file content
- **Interface:** `fetchRepo(owner, repo)`, `fetchTree(owner, repo, ref, path)`, `fetchBlob(owner, repo, ref, path)`, `fetchPRs(owner, repo)`
- **Returns:** Normalized domain objects (not raw GraphQL responses)

### 4. `github_client` — API Transport
- **Responsibility:** GraphQL query execution, auth header injection, error handling
- **Interface:** `query<T>(document, variables): Promise<T>`
- **Features:** Automatic retry on 502/503, rate limit detection (X-RateLimit headers), request deduplication

### 5. `query_cache` — SWR Cache
- **Responsibility:** Stale-While-Revalidate caching for all API responses
- **Interface:** `cached<T>(key, fetcher, ttl?): { data: T, isStale: boolean, refresh() }`
- **Strategy:** Return cached data immediately, revalidate in background, update reactively
- **Storage:** In-memory Map with configurable TTL (default 60s for trees, 30s for PRs)

## Data Flow

1. **User clicks repo in sidebar** → `tab_engine.openTab({ type: 'repo', owner, repo })`
2. **Tab activates** → Route updates to `/#/repo/{owner}/{repo}`
3. **Repo view mounts** → `git_engine.fetchRepo()` + `git_engine.fetchTree()` (parallel)
4. **Cache hit** → Render immediately from cache, background revalidate
5. **Cache miss** → Show skeleton, fetch, render on response

## Technology Choices

| Choice | Rationale |
|--------|-----------|
| **Svelte 5 + SvelteKit** | Runes ($state/$derived) give fine-grained reactivity without virtual DOM overhead. SvelteKit provides routing + build tooling. |
| **SPA mode (adapter-static)** | No server needed for MVP. Deploy to any static host (Vercel, Netlify, GitHub Pages). |
| **GitHub GraphQL v4** | Fetch exactly the fields needed. One request for repo+tree+PRs instead of 3 REST calls. |
| **@medyll/css-base** | Lightweight design tokens, consistent spacing/typography. No runtime CSS-in-JS cost. |
| **No BFF for MVP** | Removes deployment complexity. Client-side OAuth (Device Flow) is sufficient. BFF boundary is clean — add later if needed. |

## File Structure

```
src/
├── lib/
│   ├── api/
│   │   ├── github_client.ts        # GraphQL transport + auth headers
│   │   ├── queries/                 # .ts files with typed GraphQL queries
│   │   │   ├── repo.ts
│   │   │   ├── tree.ts
│   │   │   ├── pull_requests.ts
│   │   │   └── blob.ts
│   │   └── query_cache.svelte.ts   # SWR cache (reactive)
│   ├── core/
│   │   ├── auth_engine.svelte.ts   # OAuth + token management
│   │   ├── tab_engine.svelte.ts    # Tab state + URL sync
│   │   └── git_engine.svelte.ts    # Data normalization layer
│   ├── features/
│   │   ├── global_sidebar/
│   │   │   ├── Sidebar.svelte
│   │   │   ├── RepoItem.svelte
│   │   │   └── sidebar.svelte.ts   # Sidebar-specific logic
│   │   ├── tab_navigation/
│   │   │   ├── TabBar.svelte
│   │   │   └── TabItem.svelte
│   │   ├── repo_browser/
│   │   │   ├── RepoBrowser.svelte
│   │   │   ├── TreeView.svelte
│   │   │   ├── TreeNode.svelte
│   │   │   └── repo_browser.svelte.ts
│   │   ├── readme_viewer/
│   │   │   └── ReadmeViewer.svelte
│   │   └── blob_viewer/
│   │       └── BlobViewer.svelte
│   └── shared/
│       ├── Button.svelte
│       ├── Icon.svelte
│       ├── Loader.svelte
│       └── Badge.svelte
├── routes/
│   ├── +layout.svelte              # Shell: sidebar + tab bar + content slot
│   └── +page.svelte                # SPA entry: reads URL hash, dispatches to tab_engine
└── app.html
```

## Key Design Decisions

1. **Engines are `.svelte.ts` files, not stores** — Svelte 5 runes work in plain .ts files. No need for store API. Engines export reactive state directly.

2. **URL hash routing, not path routing** — SPA mode means no server. Hash-based routing (`/#/repo/owner/name`) avoids 404s on static hosts and keeps tab state in the URL.

3. **Lazy tree loading** — Root tree loads on repo open. Subdirectories expand on click (separate fetch). Prevents massive initial payloads on monorepos.

4. **Query deduplication** — If two components request the same repo data simultaneously, `github_client` coalesces into one network request.

5. **snake_case everywhere** — Files, folders, CSS classes. Consistent with PROJECT-SOURCE.md naming convention.

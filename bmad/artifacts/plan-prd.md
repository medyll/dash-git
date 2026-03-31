# Dash-Git — Product Requirements Document

## Problem Statement

GitHub's UI is cluttered and slow for power users who spend hours daily reviewing code, managing PRs, and navigating between repositories. Developers need a fast, focused interface that eliminates cognitive overhead.

## Target Users

Senior developers and tech leads who manage multiple repositories, review PRs daily, and value speed over feature completeness.

## MVP Scope — Sprint 1-2

### US-01: GitHub Authentication
**As a** developer, **I want** to authenticate via GitHub OAuth **so that** I can access my repositories securely.

**Acceptance Criteria:**
- OAuth flow completes and stores token in memory/localStorage
- Token refresh works silently
- Logout clears all session data
- Unauthenticated users see a login screen only

### US-02: Global Sidebar (The Hub)
**As a** developer, **I want** a persistent sidebar listing my repositories **so that** I can switch projects instantly.

**Acceptance Criteria:**
- Displays all user-accessible repos (owned + collaborator)
- Shows visual badges for: open PRs count, failing CI (red dot), unread notifications
- Fuzzy search filters the list in real-time (<50ms)
- Sidebar is collapsible but persists across all views
- Repos load progressively (first page visible in <500ms)

### US-03: Tab System
**As a** developer, **I want** a tabbed interface **so that** I can work across multiple repos/files without losing context.

**Acceptance Criteria:**
- Tabs can represent: Repo Home, File/Blob, Issue, PR
- Tab bar shows status icons (PR icon, CI status)
- Tab state persists in URL hash and localStorage
- Middle-click closes a tab, Ctrl+click opens in new tab
- Maximum 20 tabs with overflow scroll

### US-04: Repository Home View (The Guard)
**As a** developer, **I want** a repo landing page with file tree and README **so that** I can orient quickly.

**Acceptance Criteria:**
- Left panel: full file tree with infinite nesting, file-type icons, search-in-tree
- Center panel: auto-renders README.md with syntax highlighting
- Header: branch name, open PR count for current branch
- Tree loads lazily (expand on click, not upfront)

### US-05: File/Blob Viewer
**As a** developer, **I want** to view any file with syntax highlighting **so that** I can read code without cloning.

**Acceptance Criteria:**
- Syntax highlighting for top 20 languages
- Line numbers with permalink support
- Raw/copy buttons
- Opens in a new tab from the tree view

## Out of Scope (v1)

- Code editing / commit creation
- Issue/PR creation (read-only for MVP)
- Commit graph visualization
- BFF relay server (direct API calls for MVP)
- Notifications management
- GitHub Actions management

## Non-Functional Requirements

- **Performance:** TTI < 1.5s on 3G. Tab switch < 100ms. Tree render < 200ms for 1000-node repos.
- **Caching:** SWR pattern — show stale data immediately, refresh in background.
- **Accessibility:** Keyboard navigation for sidebar, tabs, and tree. ARIA labels on interactive elements.
- **Security:** Token stored in memory (fallback localStorage). No token in URLs. CSP headers.

## Risks & Dependencies

| Risk | Mitigation |
|------|-----------|
| GitHub API rate limits (5000/hr authenticated) | Aggressive caching + conditional requests (ETags) |
| GraphQL query complexity limits | Pre-tested query shapes, paginated fetches |
| Large repo tree performance | Lazy loading, virtualized lists |
| OAuth requires a redirect URI | Use GitHub Device Flow as fallback |

## Success Metrics

- Tab switch perceived latency < 100ms
- Sidebar repo list renders in < 500ms for 100+ repos
- Zero full-page reloads during normal usage

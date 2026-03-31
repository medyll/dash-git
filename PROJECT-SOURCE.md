# Dash-Git: Product Requirements & Architectural Blueprint

## 1. Vision & Purpose
**Dash-Git** is a high-performance, developer-centric alternative interface for GitHub. The primary goal is to eliminate the "clutter" and cognitive load of the official GitHub UI by providing a streamlined, tabbed environment designed for rapid navigation, code exploration, and multi-repo management. It is built as a **Single Page Application (SPA)** using **Svelte 5** to ensure sub-millisecond reactivity and a "Local-First" feel.

---

## 2. Core Objectives
* **Speed:** Minimize Time-to-Interactive (TTI) using GraphQL and aggressive caching.
* **Clarity:** A professional, minimalist UI leveraging `@medyll/css-base`.
* **Context Awareness:** Persistent visibility of active Pull Requests and repository states across all views.
* **Multi-Tasking:** A native-like tabbed system allowing developers to work across multiple repositories or files without losing context.

---

## 3. Detailed Functional Requirements

### A. Persistent Global Sidebar (The Hub)
* **Workspace Overview:** A vertical list of all user-accessible repositories.
* **Real-time Status:** Visual indicators (badges/glows) on repository names indicating active Pull Requests, failing CI/CD builds, or unread notifications.
* **Quick Filter:** Instant fuzzy search to jump between projects.

### B. Dynamic Tab System
* **Multi-Context:** Each tab can represent a Repository Home, a specific File/Blob, an Issue, or a PR.
* **Tab Metadata:** Tabs must display status icons (e.g., a "PR" icon on a tab if that repository has an open pull request).
* **Persistence:** Tab state is mirrored in the URL and stored in `localStorage` to survive refreshes.

### C. Repository "Home" View (The Guard)
* **Treeview (Left Column):** * Full file hierarchy with infinite nesting.
    * Search-in-tree functionality (filtering nodes by name).
    * File-type iconography.
* **Content Area (Center):** * Automatic detection and rendering of `README.md`.
    * Fast-loading Markdown parser with syntax highlighting.
* **Status Overlay:** Immediate visibility of the branch name and the number of open PRs linked to the current branch/repo.

---

## 4. Technical Architecture (The "Library Builder" Approach)

### A. Frontend Stack
* **Framework:** Svelte 5 (utilizing Runes: `$state`, `$derived`, `$effect`).
* **Styling:** `@medyll/css-base` for a lightweight, standardized design system.
* **State Management:** Decoupled logic using `.svelte.ts` modules to keep components "thin."

### B. Data & API Strategy
* **Primary Engine:** GitHub GraphQL API (v4) for precise data fetching.
* **BFF (Backend for Frontend):** A lightweight Node.js/Go/Rust relay for OAuth handling and complex data aggregation.
* **Caching Layer:** Implementation of `Stale-While-Revalidate` (SWR) logic to ensure the UI is never blocked by network latency.

---

## 5. Domain-Driven File Structure (`snake_case`)

```text
src/
├── lib/
│   ├── api/                # GraphQL queries & API client wrappers
│   ├── core/               # Pure logic (Library Builder)
│   │   ├── auth_engine/    # Token and session management
│   │   ├── tab_engine/     # Tab lifecycle and state logic
│   │   └── git_engine/     # Data normalization for Repo/Tree/PR
│   ├── features/           # Feature-specific UI & Logic
│   │   ├── global_sidebar/ # Project list & PR badges
│   │   ├── tab_navigation/ # The tab bar and switching logic
│   │   ├── repo_browser/   # Treeview and file explorer
│   │   └── readme_viewer/  # Markdown rendering engine
│   └── shared/             # Atomic components (Buttons, Icons, Loaders)
└── routes/                 # SvelteKit routing (URL-to-Tab mapping)
```

---

## 6. PRD Contextual Metadata (For LLM Consumption)
* **Target Audience:** Senior Developers who find the standard GitHub UI too slow or cluttered for daily code-review and project monitoring.
* **Design Philosophy:** "Information Density over White Space." Everything should be reachable within two clicks.
* **Extensibility:** The system must be "Plugin-Ready." Adding a "Code Editor" or "Commit Graph" feature should only require adding a new module in `features/` and registering it in the `tab_engine`.
* **Naming Convention:** Components and logic follow a strict functional naming convention in `snake_case` to ensure maintainability in large-scale refactors.
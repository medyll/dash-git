# Dash-Git

A fast, clean GitHub dashboard for developers. Built with Svelte 5 and GitHub's GraphQL API.

## Features

- **Multi-repo management** - View all your repositories in one place
- **Tabbed browsing** - Open multiple repos, files, and PRs in tabs
- **Fast navigation** - SWR caching for instant page loads
- **Clean UI** - Minimalist design focused on information density
- **Keyboard shortcuts** - Navigate efficiently without touching the mouse

## Quick Start

### Prerequisites

- Node.js 18+
- A GitHub account

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/dash-git.git
   cd dash-git
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure GitHub OAuth**
   
   Dash-Git uses GitHub Device Flow for authentication - no server required!
   
   To use your own OAuth app (optional):
   - Go to GitHub Settings → Developer Settings → OAuth Apps
   - Create a new OAuth App
   - Enable "Device Flow" in the app settings
   - Copy the Client ID

4. **Create environment file**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your Client ID:
   ```
   VITE_GITHUB_CLIENT_ID=your_client_id_here
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Open in browser**
   
   Navigate to `https://dash-git.localhost`
   
   > Portless provides a stable HTTPS URL. Your first time, you may need to trust the local CA.

## Usage

### Authentication

1. Click "Sign in with GitHub"
2. A device code will be displayed
3. Visit `github.com/login/device` on another device
4. Enter the code and authorize
5. Dash-Git will automatically detect authorization

### Navigation

- **Sidebar** - Shows all your repositories with PR/CI status badges
- **Tab Bar** - Open multiple items in tabs
- **Search** - Filter repositories by name
- **Workspace Switcher** - Filter by user or organization

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+W` | Cycle workspaces |
| `Ctrl+T` | New tab |
| `Ctrl+W` | Close current tab |
| `Ctrl+1-9` | Switch to tab N |
| `Escape` | Close modals |

## Building for Production

```bash
npm run build
npm run preview
```

The build outputs static files to the `build/` directory.

## Deploying

Dash-Git is a static SPA - deploy anywhere:

### GitHub Pages

```bash
npm run build
# Push build/ to gh-pages branch
```

### Netlify

1. Connect your repository
2. Set build command: `npm run build`
3. Set publish directory: `build`

### Vercel

1. Import your repository
2. Framework preset: SvelteKit
3. Deploy

## Project Structure

```
src/
├── lib/
│   ├── api/                # GitHub API client & queries
│   │   ├── github_client.ts    # GraphQL transport
│   │   ├── github_queries.ts   # GraphQL queries
│   │   ├── query_cache.svelte.ts # SWR cache
│   │   └── gql.ts              # Template tag
│   ├── core/               # Core logic (no UI)
│   │   ├── auth_engine.svelte.ts   # OAuth handling
│   │   ├── tab_engine.svelte.ts    # Tab management
│   │   └── layout_state.svelte.ts  # Sidebar state
│   ├── features/           # Feature components
│   │   ├── global_sidebar/
│   │   ├── tab_navigation/
│   │   └── repo_browser/
│   └── shared/             # Reusable UI components
│       ├── PRBadge.svelte
│       ├── CIStatusBadge.svelte
│       └── NotificationBadge.svelte
└── routes/                 # SvelteKit routing
    ├── +layout.svelte
    ├── +page.svelte
    └── [repo]/
        └── +page.svelte
```

## Technology Stack

- **Frontend**: Svelte 5 with Runes
- **Build**: Vite
- **API**: GitHub GraphQL API
- **Auth**: GitHub Device Flow (OAuth 2.0)
- **Styling**: Custom CSS with CSS variables

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run `npm run build` to verify
5. Submit a PR

## License

MIT

## Acknowledgments

Built with [@medyll/css-base](https://github.com/medyll/css-base) design principles.

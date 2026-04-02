# Contributing to Dash-Git

Thank you for your interest in contributing to Dash-Git! This document provides guidelines and instructions for contributing.

## Getting Started

### Prerequisites

- Node.js 18+
- Git
- A GitHub account

### Setup

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/dash-git.git`
3. Install dependencies: `npm install`
4. Start dev server: `npm run dev`

## Development Workflow

### Branch Naming

- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation changes
- `refactor/description` - Code refactoring

### Making Changes

1. Create a branch from `main`
2. Make your changes
3. Run `npm run build` to verify the build passes
4. Commit with clear, descriptive messages
5. Push and open a Pull Request

### Commit Messages

Follow conventional commits format:

```
feat: add keyboard shortcut for closing tabs
fix: resolve tab state not persisting on refresh
docs: update README with deployment instructions
refactor: simplify auth engine state management
```

## Code Style

- Use TypeScript for all new code
- Follow Svelte 5 runes pattern (`$state`, `$derived`, `$effect`)
- Use snake_case for file names
- Keep components focused (single responsibility)
- Add JSDoc comments for exported functions

## Architecture

### Key Directories

```
src/
├── lib/
│   ├── api/           # API client and queries
│   ├── core/          # Business logic (no UI)
│   ├── features/      # Feature components
│   └── shared/        # Reusable UI components
└── routes/            # SvelteKit routing
```

### State Management

- Use Svelte 5 runes for reactive state
- Core logic in `.svelte.ts` files
- Keep UI components thin

### API Integration

- All GitHub API calls go through `github_client.ts`
- Use SWR cache (`query_cache.svelte.ts`) for data fetching
- GraphQL queries in `github_queries.ts`

## Testing

Before submitting a PR:

1. Verify build passes: `npm run build`
2. Test authentication flow
3. Test core features (sidebar, tabs, repo browser)
4. Check for console errors

## Pull Request Process

1. Update README.md if adding features
2. Include screenshots for UI changes
3. Reference any related issues
4. Wait for review

## Feature Requests

Open an issue with:

- Feature description
- Use case / problem it solves
- Any proposed implementation ideas

## Bug Reports

Open an issue with:

- Steps to reproduce
- Expected behavior
- Actual behavior
- Screenshots if applicable
- Browser and OS version

## Questions?

Feel free to open an issue for any questions about contributing.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

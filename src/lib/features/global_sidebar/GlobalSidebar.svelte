<script lang="ts">
  import { onMount } from 'svelte';
  import { cached, invalidate } from '$lib/api/query_cache.svelte';
  import { query } from '$lib/api/github_client';
  import { REPOS_QUERY } from '$lib/api/github_queries';
  import { openTab } from '$lib/core/tab_engine.svelte';
  import PRBadge from '$lib/shared/PRBadge.svelte';
  import CIStatusBadge from '$lib/shared/CIStatusBadge.svelte';

  interface Repository {
    id: string;
    name: string;
    nameWithOwner: string;
    url: string;
    updatedAt: string;
    primaryLanguage: { name: string; color: string } | null;
    pullRequests: { totalCount: number };
    ciState?: 'success' | 'failure' | 'pending' | 'unknown';
  }

  interface ViewerData {
    viewer: {
      login: string;
      avatarUrl: string;
      repositories: {
        totalCount: number;
        pageInfo: { hasNextPage: boolean; endCursor: string | null };
        nodes: Repository[];
      };
      organizations: {
        nodes: Array<{ login: string; name: string | null; avatarUrl: string; url: string }>;
      };
    };
  }

  let searchQuery = $state('');
  let selectedWorkspace = $state<'all' | string>('all');
  let workspaceList = $derived.by(() => getWorkspaces());
  let workspaceIndex = $derived.by(() => workspaceList.findIndex(w => w.id === selectedWorkspace));

  // Keyboard shortcut: Ctrl+Shift+W to cycle workspaces
  onMount(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'W') {
        e.preventDefault();
        cycleWorkspace();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  function cycleWorkspace(): void {
    if (workspaceList.length === 0) return;
    const nextIndex = (workspaceIndex + 1) % workspaceList.length;
    selectedWorkspace = workspaceList[nextIndex].id;
  }

  // Fetch repos with SWR cache
  const reposCache = cached(
    'github:repos:viewer',
    async () => {
      const result = await query<ViewerData>(REPOS_QUERY, { first: 100 });
      return result.data.viewer;
    },
    30_000 // 30s TTL for repos
  );

  // Filter repos by search and workspace
  let filteredRepos = $derived.by(() => {
    const repos = reposCache.data?.repositories?.nodes || [];
    return repos.filter((repo: Repository) => {
      const matchesSearch = searchQuery === '' ||
        repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        repo.nameWithOwner.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesWorkspace = selectedWorkspace === 'all' ||
        repo.nameWithOwner.startsWith(selectedWorkspace + '/');

      return matchesSearch && matchesWorkspace;
    });
  });

  function openRepo(repo: Repository): void {
    // Open repo in a new tab using tab engine
    openTab({
      type: 'repo',
      path: `/repo/${repo.nameWithOwner}`,
      title: repo.nameWithOwner,
      repo: repo.nameWithOwner
    });
  }

  function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return date.toLocaleDateString();
  }

  function getWorkspaces(): Array<{ id: string; name: string; avatarUrl: string }> {
    if (!reposCache.data) return [];
    
    const workspaces = new Map<string, { name: string; avatarUrl: string }>();
    workspaces.set('all', { name: 'All repos', avatarUrl: '' });
    
    // Add user
    workspaces.set(reposCache.data.login, {
      name: reposCache.data.login,
      avatarUrl: reposCache.data.avatarUrl
    });
    
    // Add orgs
    for (const org of reposCache.data.organizations.nodes) {
      workspaces.set(org.login, {
        name: org.name || org.login,
        avatarUrl: org.avatarUrl
      });
    }
    
    return Array.from(workspaces.entries()).map(([id, data]) => ({
      id,
      name: data.name,
      avatarUrl: data.avatarUrl
    }));
  }

  async function refreshRepos(): Promise<void> {
    invalidate('github:repos');
    await reposCache.refresh();
  }
</script>

<div class="global-sidebar flex flex-col p-md">
  <div class="sidebar-header flex items-center justify-between mb-sm">
    <h2 class="sidebar-title" data-text="md" data-weight="semibold">Repositories</h2>
    <button class="refresh-btn" onclick={refreshRepos} title="Refresh" aria-label="Refresh repositories" data-radius="sm">
      <svg viewBox="0 0 16 16" width="16" height="16"><path d="M1.705 8.005a.75.75 0 0 1 .346-.636 5.5 5.5 0 0 1 8.318 3.382.75.75 0 1 1-1.46.317 4 4 0 1 0-4.854-2.87.75.75 0 0 1-.35.192Zm12.59-1.637a.75.75 0 0 1-.346.636 5.5 5.5 0 0 1-8.318-3.382.75.75 0 1 1 1.46-.317 4 4 0 1 0 4.854 2.87.75.75 0 0 1 .35-.192Z"/></svg>
    </button>
  </div>

  <div class="workspace-selector mb-xs">
    <select bind:value={selectedWorkspace} data-radius="md" data-border="md">
      {#each getWorkspaces() as ws}
        <option value={ws.id}>{ws.name}</option>
      {/each}
    </select>
  </div>

  <div class="search-box relative mb-md">
    <svg viewBox="0 0 16 16" width="14" height="14" class="search-icon absolute"><path d="M10.68 11.74a6 6 0 0 1-7.922-8.982 6 6 0 0 1 8.982 7.922l3.04 3.04a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215ZM11 6a5 5 0 1 0-10 0 5 5 0 0 0 10 0Z"/></svg>
    <input
      type="text"
      placeholder="Filter repos..."
      bind:value={searchQuery}
      aria-label="Filter repositories"
      class="search-input"
    />
  </div>

  <div class="repos-list flex-1 overflow-y-auto">
    {#if reposCache.isLoading && !reposCache.data}
      <div class="loading-skeleton flex flex-col gap-xs">
        {#each Array(5) as _, i}
          <div class="skeleton-item" style="animation-delay: {i * 100}ms"></div>
        {/each}
      </div>
    {:else if reposCache.error}
      <div class="error-state text-center p-lg" data-color="muted">
        <p>Failed to load repositories</p>
        <button onclick={refreshRepos} class="btn btn-primary mt-xs">Retry</button>
      </div>
    {:else if filteredRepos.length === 0}
      <div class="empty-state text-center p-lg" data-color="muted">No repositories found</div>
    {:else}
      {#each filteredRepos as repo (repo.id)}
        <button type="button" class="repo-item" onclick={() => openRepo(repo)} aria-label="Open {repo.nameWithOwner} repository" data-radius="md">
          <div class="repo-header flex items-center justify-between mb-xs">
            <span class="repo-name" data-text="sm" data-weight="semibold" title={repo.nameWithOwner}>{repo.name}</span>
            <div class="repo-badges flex items-center gap-xs">
              <PRBadge count={repo.pullRequests.totalCount} />
              <CIStatusBadge state={repo.ciState || 'unknown'} />
            </div>
          </div>
          <div class="repo-meta flex items-center gap-xs" data-text="xs" data-color="muted">
            <span class="repo-owner">{repo.nameWithOwner.split('/')[0]}</span>
            {#if repo.primaryLanguage}
              <span class="language-dot" style="background: {repo.primaryLanguage.color}"></span>
              <span class="language-name">{repo.primaryLanguage.name}</span>
            {/if}
          </div>
          <div class="repo-updated" data-text="xs" data-color="muted">Updated {formatDate(repo.updatedAt)}</div>
        </button>
      {/each}
    {/if}
  </div>
</div>

<style>
  .global-sidebar {
    height: 100%;
  }

  .sidebar-title {
    margin: 0;
  }

  .refresh-btn {
    background: transparent;
    border: none;
    padding: var(--pad-xs);
    cursor: pointer;
    color: var(--color-text-muted);
    transition: var(--transition-fast);

    &:hover {
      background: var(--color-surface-hover);
      color: var(--color-text);
    }
  }

  .workspace-selector select {
    width: 100%;
    padding: var(--pad-xs) var(--pad-sm);
    border: 1px solid var(--color-border);
    font-size: var(--text-sm);
    background: var(--color-surface);
    cursor: pointer;
  }

  .search-icon {
    left: var(--pad-sm);
    top: 50%;
    transform: translateY(-50%);
    color: var(--color-text-muted);
  }

  .search-input {
    width: 100%;
    padding: var(--pad-xs) var(--pad-sm) var(--pad-xs) 28px;
    border: 1px solid var(--color-border);
    font-size: var(--text-sm);

    &:focus {
      outline: none;
      border-color: var(--color-primary);
      box-shadow: 0 0 0 3px --alpha(var(--color-primary), 0.1);
    }
  }

  .loading-skeleton {
    gap: var(--gutter-xs);
  }

  .skeleton-item {
    height: 48px;
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
    border-radius: var(--radius-md);
  }

  @keyframes shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }

  .error-state,
  .empty-state {
    padding: var(--pad-lg);
    text-align: center;
  }

  .repo-item {
    padding: var(--pad-sm);
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: var(--transition-fast);
    width: 100%;

    &:hover {
      background: var(--color-surface-hover);
    }
  }

  .repo-name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .repo-owner {
    opacity: 0.8;
  }

  .language-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    display: inline-block;
  }

  .language-name {
    opacity: 0.9;
  }
</style>

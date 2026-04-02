<script lang="ts">
  import { query } from '$lib/api/github_client';
  import { cached } from '$lib/api/query_cache.svelte';
  import { TREE_QUERY, BRANCHES_QUERY } from '$lib/api/github_queries';
  import { openTab } from '$lib/core/tab_engine.svelte';

  interface TreeEntry {
    name: string;
    type: 'blob' | 'tree';
    path: string;
    size?: number;
  }

  interface Branch {
    name: string;
  }

  let { repo }: { repo: string } = $props(); // owner/name

  let searchQuery = $state('');
  let expandedPaths = $state<Set<string>>(new Set());
  let currentPath = $state('');

  // Parse repo - use derived to handle reactivity
  const [owner, repoName] = $derived.by(() => repo.split('/'));

  // Fetch branches
  const branchesCache = cached(
    `github:branches:${repo}`,
    async () => {
      const result = await query<{ repository: { refs: { nodes: { name: string }[] }; defaultBranchRef: { name: string } } }>(
        BRANCHES_QUERY,
        { owner, repo: repoName, first: 50 }
      );
      return result.data.repository;
    },
    60_000
  );

  // Fetch tree for current branch and path
  const currentBranch = $derived(branchesCache.data?.defaultBranchRef?.name || 'main');
  const treeExpression = $derived(currentPath ? `${currentBranch}:${currentPath}` : currentBranch);

  const treeCache = cached(
    `github:tree:${repo}:${treeExpression}`,
    async () => {
      const result = await query<{ repository: { object: { entries: Array<{ name: string; type: string; object?: { byteSize?: number } }> } } }>(
        TREE_QUERY,
        { owner, repo: repoName, expression: treeExpression }
      );
      return result.data.repository.object?.entries || [];
    },
    30_000
  );

  const entries = $derived<TreeEntry[]>(() => {
    const raw = treeCache.data || [];
    return raw.map((entry: any) => ({
      name: entry.name,
      type: entry.type as 'blob' | 'tree',
      path: currentPath ? `${currentPath}/${entry.name}` : entry.name,
      size: entry.object?.byteSize
    }));
  });

  const filteredEntries = $derived(() => {
    if (!searchQuery) return entries;
    return entries.filter(e => e.name.toLowerCase().includes(searchQuery.toLowerCase()));
  });

  function toggleExpand(entry: TreeEntry): void {
    if (entry.type !== 'tree') return;
    
    if (expandedPaths.has(entry.path)) {
      expandedPaths.delete(entry.path);
    } else {
      expandedPaths.add(entry.path);
    }
    expandedPaths = new Set(expandedPaths); // trigger reactivity
  }

  function openFile(entry: TreeEntry): void {
    if (entry.type === 'tree') {
      currentPath = entry.path;
    } else {
      openTab({
        type: 'file',
        path: `/repo/${repo}/blob/${currentBranch}/${entry.path}`,
        title: entry.name,
        repo
      });
    }
  }

  function navigateTo(path: string): void {
    currentPath = path;
  }

  function getBreadcrumbs(): Array<{ label: string; path: string }> {
    if (!currentPath) return [{ label: repoName, path: '' }];
    const parts = currentPath.split('/');
    const crumbs = [{ label: repoName, path: '' }];
    let accumPath = '';
    for (const part of parts) {
      accumPath = accumPath ? `${accumPath}/${part}` : part;
      crumbs.push({ label: part, path: accumPath });
    }
    return crumbs;
  }

  function formatSize(bytes?: number): string {
    if (bytes === undefined) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  function getFileIcon(name: string, type: 'blob' | 'tree'): string {
    if (type === 'tree') return '📁';
    const ext = name.split('.').pop()?.toLowerCase();
    const icons: Record<string, string> = {
      md: '📝',
      txt: '📄',
      js: '📜',
      ts: '📘',
      json: '📋',
      yml: '⚙️',
      yaml: '⚙️',
      lock: '🔒'
    };
    return icons[ext || ''] || '📄';
  }
</script>

<div class="repo-browser">
  <div class="browser-header">
    <div class="branch-selector">
      {#if branchesCache.data}
        <select>
          {#each branchesCache.data.refs.nodes as branch}
            <option value={branch.name} selected={branch.name === currentBranch}>
              {branch.name}
            </option>
          {/each}
        </select>
      {:else}
        <span class="loading">Loading branches...</span>
      {/if}
    </div>
  </div>

  <div class="breadcrumb-nav">
    {#each getBreadcrumbs() as crumb, i}
      {#if i > 0}<span class="separator">/</span>{/if}
      <button 
        type="button"
        class="breadcrumb-item" 
        onclick={() => navigateTo(crumb.path)}
      >
        {crumb.label}
      </button>
    {/each}
  </div>

  <div class="search-box">
    <svg viewBox="0 0 16 16" width="14" height="14" class="search-icon"><path d="M10.68 11.74a6 6 0 0 1-7.922-8.982 6 6 0 0 1 8.982 7.922l3.04 3.04a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215ZM11 6a5 5 0 1 0-10 0 5 5 0 0 0 10 0Z"/></svg>
    <input 
      type="text" 
      placeholder="Filter files..." 
      bind:value={searchQuery}
      aria-label="Filter files"
    />
  </div>

  <div class="tree-list">
    {#if treeCache.isLoading && !treeCache.data}
      <div class="loading-state">Loading files...</div>
    {:else if treeCache.error}
      <div class="error-state">
        <p>Failed to load files</p>
        <button onclick={() => treeCache.refresh()}>Retry</button>
      </div>
    {:else if filteredEntries.length === 0}
      <div class="empty-state">No files found</div>
    {:else}
      {#each filteredEntries as entry (entry.path)}
        <button
          type="button"
          class="tree-item"
          class:folder={entry.type === 'tree'}
          onclick={() => openFile(entry)}
          aria-label="{entry.type === 'tree' ? 'Folder' : 'File'} {entry.name}"
        >
          <span class="file-icon">{getFileIcon(entry.name, entry.type)}</span>
          <span class="file-name">{entry.name}</span>
          {#if entry.type === 'blob' && entry.size}
            <span class="file-size">{formatSize(entry.size)}</span>
          {/if}
        </button>
      {/each}
    {/if}
  </div>
</div>

<style>
  .repo-browser {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 12px;
  }

  .browser-header {
    margin-bottom: 8px;
  }

  .branch-selector select {
    padding: 6px 8px;
    border: 1px solid var(--color-border, #e0e0e0);
    border-radius: 6px;
    font-size: 0.875rem;
    background: var(--color-bg, #fff);
    cursor: pointer;
  }

  .breadcrumb-nav {
    display: flex;
    align-items: center;
    gap: 4px;
    margin-bottom: 8px;
    font-size: 0.875rem;
    flex-wrap: wrap;
  }

  .breadcrumb-item {
    background: transparent;
    border: none;
    padding: 4px 8px;
    cursor: pointer;
    border-radius: 4px;
    color: var(--color-text, #1a1a1a);
  }

  .breadcrumb-item:hover {
    background: var(--color-bg, #f5f5f5);
  }

  .separator {
    color: var(--color-muted, #666);
  }

  .search-box {
    position: relative;
    margin-bottom: 12px;
  }

  .search-icon {
    position: absolute;
    left: 8px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--color-muted, #666);
  }

  .search-box input {
    width: 100%;
    padding: 6px 8px 6px 28px;
    border: 1px solid var(--color-border, #e0e0e0);
    border-radius: 6px;
    font-size: 0.875rem;
  }

  .search-box input:focus {
    outline: none;
    border-color: #0969da;
  }

  .tree-list {
    flex: 1;
    overflow-y: auto;
  }

  .tree-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 8px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.875rem;
  }

  .tree-item:hover {
    background: var(--color-bg, #f5f5f5);
  }

  .tree-item.folder .file-icon {
    font-size: 1rem;
  }

  .file-name {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .file-size {
    font-size: 0.75rem;
    color: var(--color-muted, #666);
  }

  .loading-state,
  .error-state,
  .empty-state {
    text-align: center;
    padding: 24px;
    color: var(--color-muted, #666);
  }

  .error-state button {
    margin-top: 8px;
    padding: 6px 12px;
    background: #0969da;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
  }

  .loading {
    color: var(--color-muted, #666);
    font-size: 0.875rem;
  }
</style>

<script lang="ts">
  import '../app.css';
  import { layoutState } from '$lib/core/layout_state.svelte';
  import TabBar from '$lib/features/tab_navigation/TabBar.svelte';
</script>

<div class="app-shell" class:collapsed={layoutState.sidebarCollapsed}>
  <aside class="sidebar" style="width: {layoutState.sidebarWidth}px;" data-bg="surface-alt">
    <button
      class="sidebar-toggle"
      onclick={() => layoutState.toggleSidebar()}
      aria-label={layoutState.sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      title={layoutState.sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      data-radius="sm"
    >
      {#if layoutState.sidebarCollapsed}
        <svg viewBox="0 0 16 16" width="16" height="16"><path d="M7.781 1.094a.75.75 0 0 1 .75.75v6.656l3.72-3.72a.75.75 0 1 1 1.06 1.06l-5 5a.75.75 0 0 1-1.062 0l-5-5a.75.75 0 0 1 1.06-1.06l3.72 3.72V1.844a.75.75 0 0 1 .75-.75Z"/></svg>
      {:else}
        <svg viewBox="0 0 16 16" width="16" height="16"><path d="M8.22 1.094a.75.75 0 0 1 .75-.75v6.656l3.72-3.72a.75.75 0 1 1 1.06 1.06l-5 5a.75.75 0 0 1-1.062 0l-5-5a.75.75 0 0 1 1.06-1.06l3.72 3.72V1.844a.75.75 0 0 1 .75-.75Z"/></svg>
      {/if}
    </button>
    <div class="sidebar-content">
      <slot />
    </div>
  </aside>
  <div class="main flex flex-col">
    <header class="tab-bar">
      <TabBar />
    </header>
    <main class="content flex-1">
      <p class="placeholder-text" data-text="md" data-color="muted">Select a repository to view</p>
    </main>
  </div>
</div>

<style>
  .app-shell {
    display: flex;
    height: 100vh;
    width: 100vw;
    overflow: hidden;
  }

  .sidebar {
    border-right: 1px solid var(--color-border);
    overflow: hidden;
    transition: width 0.2s ease;
    position: relative;
  }

  .sidebar-toggle {
    position: absolute;
    top: var(--gutter-sm);
    right: var(--gutter-sm);
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: none;
    cursor: pointer;
    color: var(--color-text-muted);
    z-index: 10;
    transition: var(--transition-fast);

    &:hover {
      background: var(--color-surface-hover);
      color: var(--color-text);
    }
  }

  .sidebar-content {
    height: 100%;
    overflow-y: auto;
    padding-top: 40px;
  }

  .main {
    flex: 1;
    overflow: hidden;
    min-width: 0;
  }

  .tab-bar {
    height: 40px;
    border-bottom: 1px solid var(--color-border);
    background: var(--color-surface);
    padding: var(--pad-xs) var(--pad-sm);
  }

  .content {
    flex: 1;
    overflow-y: auto;
    padding: var(--pad-md);
    background: var(--color-surface);
  }

  .placeholder-text {
    text-align: center;
    margin-top: 40px;
  }

  /* Responsive: auto-hide sidebar on narrow viewports */
  @media (max-width: 768px) {
    .sidebar {
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      z-index: 100;
      transform: translateX(-100%);
      transition: transform 0.2s ease;
    }

    .app-shell.collapsed .sidebar {
      transform: translateX(-100%);
    }

    .app-shell:not(.collapsed) .sidebar {
      transform: translateX(0);
    }

    .sidebar-toggle {
      position: fixed;
      top: var(--gutter-sm);
      left: var(--gutter-sm);
      z-index: 101;
    }
  }
</style>

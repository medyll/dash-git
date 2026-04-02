<script lang="ts">
  import '../app.css';
  import { layoutState } from '$lib/core/layout_state.svelte';
  import TabBar from '$lib/features/tab_navigation/TabBar.svelte';
</script>

<div class="app-shell" class:collapsed={layoutState.sidebarCollapsed}>
  <aside class="sidebar" style="width: {layoutState.sidebarWidth}px;">
    <button
      class="sidebar-toggle"
      onclick={() => layoutState.toggleSidebar()}
      aria-label={layoutState.sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      title={layoutState.sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
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
  <div class="main">
    <header class="tab-bar">
      <TabBar />
    </header>
    <main class="content">
      <p class="placeholder-text">Select a repository to view</p>
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
    border-right: 1px solid var(--color-border, #e0e0e0);
    overflow: hidden;
    transition: width 0.2s ease;
    position: relative;
    background: var(--color-bg, #ffffff);
  }

  .sidebar-toggle {
    position: absolute;
    top: 8px;
    right: 8px;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    color: var(--color-muted, #666);
    z-index: 10;
  }

  .sidebar-toggle:hover {
    background: var(--color-bg, #f5f5f5);
    color: var(--color-text, #1a1a1a);
  }

  .sidebar-content {
    height: 100%;
    overflow-y: auto;
    padding-top: 40px;
  }

  .main {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    min-width: 0;
  }

  .tab-bar {
    height: 40px;
    border-bottom: 1px solid var(--color-border, #e0e0e0);
    background: var(--color-bg, #ffffff);
    padding: 4px 8px;
  }

  .content {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
    background: var(--color-bg, #ffffff);
  }

  .placeholder-text {
    color: var(--color-muted, #666);
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
      top: 8px;
      left: 8px;
      z-index: 101;
    }
  }
</style>

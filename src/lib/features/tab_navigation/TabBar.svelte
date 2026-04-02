<script lang="ts">
  import { tabEngine, closeTab, switchTab, type Tab } from '$lib/core/tab_engine.svelte';

  const state = tabEngine.getState();
  let containerRef: HTMLElement | null = null;

  function getTabIcon(type: Tab['type']): string {
    switch (type) {
      case 'repo': return '📁';
      case 'file': return '📄';
      case 'pr': return '🔀';
      case 'issue': return '📋';
      default: return '📄';
    }
  }

  function handleTabClick(tab: Tab): void {
    switchTab(tab.id);
  }

  function handleCloseClick(event: Event, tabId: string): void {
    event.stopPropagation();
    closeTab(tabId);
  }

  function scrollTabs(direction: 'left' | 'right'): void {
    if (!containerRef) return;
    const scrollAmount = 200;
    containerRef.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  }
</script>

<div class="tab-bar-container flex items-center gap-xs">
  <button
    class="scroll-btn flex items-center justify-center"
    onclick={() => scrollTabs('left')}
    aria-label="Scroll tabs left"
    data-radius="sm"
  >
    <svg viewBox="0 0 16 16" width="16" height="16"><path d="M7.78 1.094a.75.75 0 0 1 .75.75v6.656l3.72-3.72a.75.75 0 1 1 1.06 1.06l-5 5a.75.75 0 0 1-1.062 0l-5-5a.75.75 0 0 1 1.06-1.06l3.72 3.72V1.844a.75.75 0 0 1 .75-.75Z"/></svg>
  </button>

  <div class="tabs-container flex items-center gap-xs flex-1 overflow-x-auto" bind:this={containerRef}>
    {#each state.tabs as tab (tab.id)}
      <div
        class="tab-item"
        class:active={tab.isActive}
        onclick={() => handleTabClick(tab)}
        onkeydown={(e) => e.key === 'Enter' && handleTabClick(tab)}
        role="tab"
        aria-selected={tab.isActive}
        tabindex={tab.isActive ? '0' : '-1'}
        data-radius="sm"
      >
        <span class="tab-icon">{getTabIcon(tab.type)}</span>
        <span class="tab-title" data-text="sm">{tab.title}</span>
        <button
          class="close-btn flex items-center justify-center"
          onclick={(e) => handleCloseClick(e, tab.id)}
          aria-label="Close tab {tab.title}"
          tabindex="-1"
          type="button"
          data-radius="sm"
        >
          <svg viewBox="0 0 16 16" width="14" height="14"><path d="M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.75.75 0 1 1 1.06 1.06L9.06 8l3.22 3.22a.75.75 0 1 1-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 0 1-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06Z"/></svg>
        </button>
      </div>
    {/each}
  </div>

  <button
    class="scroll-btn flex items-center justify-center"
    onclick={() => scrollTabs('right')}
    aria-label="Scroll tabs right"
    data-radius="sm"
  >
    <svg viewBox="0 0 16 16" width="16" height="16"><path d="M8.22 1.094a.75.75 0 0 1 .75-.75v6.656l3.72-3.72a.75.75 0 1 1 1.06 1.06l-5 5a.75.75 0 0 1-1.062 0l-5-5a.75.75 0 0 1 1.06-1.06l3.72 3.72V1.844a.75.75 0 0 1 .75-.75Z"/></svg>
  </button>
</div>

<style>
  .tab-bar-container {
    display: flex;
    align-items: center;
    height: 100%;
    gap: var(--gutter-xs);
  }

  .scroll-btn {
    width: 28px;
    height: 28px;
    border: none;
    background: transparent;
    cursor: pointer;
    color: var(--color-text-muted);
    flex-shrink: 0;
    transition: var(--transition-fast);

    &:hover {
      background: var(--color-surface-hover);
      color: var(--color-text);
    }

    &:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }
  }

  .tabs-container {
    display: flex;
    align-items: center;
    gap: var(--gutter-xs);
    overflow-x: auto;
    overflow-y: hidden;
    flex: 1;
    scrollbar-width: none;
    -ms-overflow-style: none;

    &::-webkit-scrollbar {
      display: none;
    }
  }

  .tab-item {
    display: flex;
    align-items: center;
    gap: var(--gutter-xs);
    padding: var(--pad-xs) var(--pad-sm);
    background: transparent;
    border: 1px solid transparent;
    cursor: pointer;
    font-size: var(--text-sm);
    white-space: nowrap;
    max-width: 200px;
    transition: var(--transition-fast);
    user-select: none;
    color: inherit;
    font: inherit;

    &:hover {
      background: var(--color-surface-hover);
    }

    &.active {
      background: var(--color-surface);
      border-color: var(--color-border);
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    }
  }

  .tab-icon {
    font-size: var(--text-sm);
    flex-shrink: 0;
  }

  .tab-title {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: var(--color-text);
  }

  .tab-item.active .tab-title {
    font-weight: var(--font-medium);
  }

  .close-btn {
    width: 18px;
    height: 18px;
    border: none;
    background: transparent;
    cursor: pointer;
    color: var(--color-text-muted);
    flex-shrink: 0;
    opacity: 0;
    transition: var(--transition-fast);

    .tab-item:hover & {
      opacity: 1;
    }

    &:hover {
      background: var(--color-surface-hover);
      color: var(--color-text);
    }
  }

  /* Mobile: always show close button */
  @media (max-width: 768px) {
    .close-btn {
      opacity: 1;
    }
  }
</style>

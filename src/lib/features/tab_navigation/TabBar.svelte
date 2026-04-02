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

  function getTabClasses(tab: Tab): string {
    return `tab-item${tab.isActive ? ' active' : ''}`;
  }
</script>

<div class="tab-bar-container">
  <button 
    class="scroll-btn left" 
    onclick={() => scrollTabs('left')}
    aria-label="Scroll tabs left"
  >
    <svg viewBox="0 0 16 16" width="16" height="16"><path d="M7.78 1.094a.75.75 0 0 1 .75.75v6.656l3.72-3.72a.75.75 0 1 1 1.06 1.06l-5 5a.75.75 0 0 1-1.062 0l-5-5a.75.75 0 0 1 1.06-1.06l3.72 3.72V1.844a.75.75 0 0 1 .75-.75Z"/></svg>
  </button>

  <div class="tabs-container" bind:this={containerRef}>
    {#each state.tabs as tab (tab.id)}
      <div 
        class={getTabClasses(tab)}
        onclick={() => handleTabClick(tab)}
        onkeydown={(e) => e.key === 'Enter' && handleTabClick(tab)}
        role="tab"
        aria-selected={tab.isActive}
        tabindex={tab.isActive ? '0' : '-1'}
      >
        <span class="tab-icon">{getTabIcon(tab.type)}</span>
        <span class="tab-title">{tab.title}</span>
        <button 
          class="close-btn"
          onclick={(e) => handleCloseClick(e, tab.id)}
          aria-label="Close tab {tab.title}"
          tabindex="-1"
          type="button"
        >
          <svg viewBox="0 0 16 16" width="14" height="14"><path d="M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.75.75 0 1 1 1.06 1.06L9.06 8l3.22 3.22a.75.75 0 1 1-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 0 1-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06Z"/></svg>
        </button>
      </div>
    {/each}
  </div>

  <button 
    class="scroll-btn right" 
    onclick={() => scrollTabs('right')}
    aria-label="Scroll tabs right"
  >
    <svg viewBox="0 0 16 16" width="16" height="16"><path d="M8.22 1.094a.75.75 0 0 1 .75-.75v6.656l3.72-3.72a.75.75 0 1 1 1.06 1.06l-5 5a.75.75 0 0 1-1.062 0l-5-5a.75.75 0 0 1 1.06-1.06l3.72 3.72V1.844a.75.75 0 0 1 .75-.75Z"/></svg>
  </button>
</div>

<style>
  .tab-bar-container {
    display: flex;
    align-items: center;
    height: 100%;
    gap: 4px;
  }

  .scroll-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border: none;
    background: transparent;
    cursor: pointer;
    border-radius: 4px;
    color: var(--color-muted, #666);
    flex-shrink: 0;
  }

  .scroll-btn:hover {
    background: var(--color-bg, #f5f5f5);
    color: var(--color-text, #1a1a1a);
  }

  .scroll-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  .tabs-container {
    display: flex;
    align-items: center;
    gap: 4px;
    overflow-x: auto;
    overflow-y: hidden;
    flex: 1;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }

  .tabs-container::-webkit-scrollbar {
    display: none;
  }

  .tab-item {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 4px 8px;
    background: transparent;
    border: 1px solid transparent;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.8125rem;
    white-space: nowrap;
    max-width: 200px;
    transition: all 0.15s;
    user-select: none;
    color: inherit;
    font: inherit;
  }

  .tab-item:hover {
    background: var(--color-bg, #f5f5f5);
  }

  .tab-item.active {
    background: var(--color-bg, #fff);
    border-color: var(--color-border, #e0e0e0);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  }

  .tab-icon {
    font-size: 0.875rem;
    flex-shrink: 0;
  }

  .tab-title {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: var(--color-text, #1a1a1a);
  }

  .tab-item.active .tab-title {
    font-weight: 500;
  }

  .close-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    border: none;
    background: transparent;
    cursor: pointer;
    border-radius: 3px;
    color: var(--color-muted, #666);
    flex-shrink: 0;
    opacity: 0;
    transition: opacity 0.15s, background 0.15s;
  }

  .tab-item:hover .close-btn {
    opacity: 1;
  }

  .close-btn:hover {
    background: var(--color-bg, #e0e0e0);
    color: var(--color-text, #1a1a1a);
  }

  /* Mobile: always show close button */
  @media (max-width: 768px) {
    .close-btn {
      opacity: 1;
    }
  }
</style>

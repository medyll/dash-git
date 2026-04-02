import { browser } from '$app/environment';
import { page } from '$app/stores';

const TABS_STORAGE_KEY = 'dash-git-tabs';
const MAX_TABS = 20;

export type TabType = 'repo' | 'file' | 'pr' | 'issue';

export interface Tab {
  id: string;
  type: TabType;
  title: string;
  path: string;
  repo?: string;
  isActive: boolean;
  createdAt: number;
}

// Reactive state using Svelte 5 runes
class TabEngine {
  tabs = $state<Tab[]>([]);
  activeTabId = $state<string | null>(null);

  constructor() {
    this.init();
  }

  /**
   * Initialize tabs from localStorage and URL
   */
  init(): void {
    if (!browser) return;

    // Load from localStorage
    const stored = localStorage.getItem(TABS_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as Tab[];
        this.tabs = parsed;
      } catch {
        this.tabs = [];
      }
    }

    // Sync with URL hash
    this.syncFromUrl();

    // Set first tab as active if none active
    if (this.tabs.length > 0 && !this.activeTabId) {
      this.setActive(this.tabs[0].id);
    }
  }

  /**
   * Generate unique tab ID
   */
  private generateId(): string {
    return `tab-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  }

  /**
   * Get URL hash path
   */
  private getPathFromHash(): string {
    if (!browser) return '/';
    const hash = window.location.hash.slice(1) || '/';
    return hash;
  }

  /**
   * Set URL hash from path
   */
  private setHashFromPath(path: string): void {
    if (!browser) return;
    window.location.hash = path;
  }

  /**
   * Sync tabs from URL
   */
  private syncFromUrl(): void {
    const path = this.getPathFromHash();
    if (path === '/' || path === '') return;

    // Check if tab already exists for this path
    const existingTab = this.tabs.find(t => t.path === path);
    if (existingTab) {
      this.setActive(existingTab.id);
      return;
    }

    // Create tab from URL
    const tab = this.createTabFromPath(path);
    if (tab) {
      this.tabs.push(tab);
      this.setActive(tab.id);
      this.persist();
    }
  }

  /**
   * Create tab object from path
   */
  private createTabFromPath(path: string): Tab | null {
    // Parse path to determine type and metadata
    // Examples:
    // /repo/owner/name -> repo
    // /repo/owner/name/tree/branch/path -> file
    // /repo/owner/name/pull/123 -> pr
    // /repo/owner/name/issues/123 -> issue

    const parts = path.split('/').filter(Boolean);
    
    if (parts.length < 3 || parts[0] !== 'repo') return null;

    const [_, owner, repo] = parts;
    const repoName = `${owner}/${repo}`;

    let type: TabType = 'repo';
    let title = repoName;
    
    if (parts.includes('pull')) {
      type = 'pr';
      const prIndex = parts.indexOf('pull');
      const prNumber = parts[prIndex + 1];
      title = `PR #${prNumber} - ${repoName}`;
    } else if (parts.includes('issues')) {
      type = 'issue';
      const issueIndex = parts.indexOf('issues');
      const issueNumber = parts[issueIndex + 1];
      title = `Issue #${issueNumber} - ${repoName}`;
    } else if (parts.includes('tree')) {
      type = 'file';
      const treeIndex = parts.indexOf('tree');
      const branch = parts[treeIndex + 1];
      const filePath = parts.slice(treeIndex + 2).join('/');
      title = `${filePath || branch} - ${repoName}`;
    }

    return {
      id: this.generateId(),
      type,
      title,
      path,
      repo: repoName,
      isActive: false,
      createdAt: Date.now()
    };
  }

  /**
   * Open a new tab or switch to existing one
   */
  openTab(options: { type: TabType; path: string; title?: string; repo?: string }): void {
    // Check if tab already exists
    const existing = this.tabs.find(t => t.path === options.path);
    if (existing) {
      this.setActive(existing.id);
      this.setHashFromPath(options.path);
      return;
    }

    // Enforce max tabs - close oldest
    if (this.tabs.length >= MAX_TABS) {
      const oldest = this.tabs.reduce((min, tab) => 
        tab.createdAt < min.createdAt ? tab : min, this.tabs[0]);
      this.closeTab(oldest.id);
    }

    const tab: Tab = {
      id: this.generateId(),
      type: options.type,
      title: options.title || options.path,
      path: options.path,
      repo: options.repo,
      isActive: false,
      createdAt: Date.now()
    };

    this.tabs.push(tab);
    this.setActive(tab.id);
    this.setHashFromPath(tab.path);
    this.persist();
  }

  /**
   * Close a tab
   */
  closeTab(tabId: string): void {
    const index = this.tabs.findIndex(t => t.id === tabId);
    if (index === -1) return;

    const wasActive = this.tabs[index].isActive;
    this.tabs.splice(index, 1);

    // If closed tab was active, activate another
    if (wasActive && this.tabs.length > 0) {
      const newIndex = Math.min(index, this.tabs.length - 1);
      this.setActive(this.tabs[newIndex].id);
      this.setHashFromPath(this.tabs[newIndex].path);
    } else if (this.tabs.length === 0) {
      this.activeTabId = null;
      this.setHashFromPath('/');
    }

    this.persist();
  }

  /**
   * Switch to a tab by ID
   */
  switchTab(tabId: string): void {
    const tab = this.tabs.find(t => t.id === tabId);
    if (!tab) return;

    this.setActive(tabId);
    this.setHashFromPath(tab.path);
  }

  /**
   * Set active tab
   */
  private setActive(tabId: string): void {
    for (const tab of this.tabs) {
      tab.isActive = tab.id === tabId;
    }
    this.activeTabId = tabId;
  }

  /**
   * Update tab title
   */
  updateTitle(tabId: string, title: string): void {
    const tab = this.tabs.find(t => t.id === tabId);
    if (tab) {
      tab.title = title;
      this.persist();
    }
  }

  /**
   * Persist tabs to localStorage
   */
  private persist(): void {
    if (!browser) return;
    localStorage.setItem(TABS_STORAGE_KEY, JSON.stringify(this.tabs));
  }

  /**
   * Get reactive state for components
   */
  getState() {
    const engine = this;
    return {
      get tabs() { return engine.tabs; },
      get activeTabId() { return engine.activeTabId; },
      get activeTab() { return engine.tabs.find(t => t.isActive); }
    };
  }
}

// Singleton instance
export const tabEngine = new TabEngine();

// Export convenience functions
export function openTab(options: { type: TabType; path: string; title?: string; repo?: string }): void {
  tabEngine.openTab(options);
}

export function closeTab(tabId: string): void {
  tabEngine.closeTab(tabId);
}

export function switchTab(tabId: string): void {
  tabEngine.switchTab(tabId);
}

export function getTabState() {
  return tabEngine.getState();
}

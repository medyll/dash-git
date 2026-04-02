import { browser } from '$app/environment';

const SIDEBAR_COLLAPSED_KEY = 'dash-git-sidebar-collapsed';

class LayoutState {
  sidebarCollapsed = $state(false);
  sidebarWidth = $derived(this.sidebarCollapsed ? 48 : 240);

  constructor() {
    this.initSidebar();
  }

  /**
   * Initialize sidebar state from localStorage
   */
  initSidebar(): void {
    if (browser) {
      const stored = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
      if (stored) {
        this.sidebarCollapsed = stored === 'true';
      }
    }
  }

  /**
   * Toggle sidebar collapsed state
   */
  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
    if (browser) {
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(this.sidebarCollapsed));
    }
  }

  /**
   * Set sidebar collapsed state explicitly
   */
  setSidebarCollapsed(collapsed: boolean): void {
    this.sidebarCollapsed = collapsed;
    if (browser) {
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(collapsed));
    }
  }

  /**
   * Get reactive sidebar state
   */
  getState() {
    return {
      get collapsed() { return this.sidebarCollapsed; },
      get width() { return this.sidebarWidth; }
    };
  }
}

export const layoutState = new LayoutState();

<script lang="ts">
  export let hasNotification: boolean = false;
  export let count: number = 0;
</script>

<span class="notification-badge" class:has-notification={hasNotification || count > 0} aria-label="{count || 1} notifications" title="{count || 1} notifications">
  {#if count > 0}
    {count}
  {/if}
</span>

<style>
  .notification-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 16px;
    height: 16px;
    padding: 0 4px;
    border-radius: 10px;
    font-size: 0.625rem;
    font-weight: 700;
    background: #cf222e;
    color: white;
    opacity: 0;
    transition: opacity 0.2s;
  }

  .notification-badge.has-notification {
    opacity: 1;
  }
</style>

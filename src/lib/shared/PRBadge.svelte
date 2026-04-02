<script lang="ts">
  export let count: number = 0;
</script>

<span class="badge badge-info" class:has-count={count > 0} aria-label="{count} open pull requests" title="{count} open pull requests">
  {#if count > 0}
    {count}
  {:else}
    <svg viewBox="0 0 16 16" width="12" height="12"><path d="M5 3.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm0 2.5a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm0 2.5a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm0 2.5a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"/></svg>
  {/if}
</span>

<style>
  .has-count {
    animation: glow 2s ease-in-out infinite;
  }

  @keyframes glow {
    0%, 100% { box-shadow: 0 0 4px rgba(9, 105, 218, 0.4); }
    50% { box-shadow: 0 0 8px rgba(9, 105, 218, 0.6); }
  }
</style>

<script lang="ts">
  export let hasNotification: boolean = false;
  export let count: number = 0;
</script>

<span class="badge badge-error" class:has-notification={hasNotification || count > 0} aria-label="{count || 1} notifications" title="{count || 1} notifications">
  {#if count > 0}
    {count}
  {/if}
</span>

<style>
  .has-notification {
    opacity: 1;
  }
</style>

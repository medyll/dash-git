<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';

  $effect(() => {
    console.error('Error:', $page.error);
  });
</script>

<div class="error-page flex items-center justify-center min-h-screen p-lg text-center">
  <div class="error-content max-w-lg">
    <h1 data-text="4xl" data-weight="bold" data-color="critical" data-margin="lg">Oops!</h1>
    <p class="error-message" data-text="xl" data-margin="lg">Something went wrong</p>
    {#if $page.error instanceof Error}
      <pre class="error-details card" data-pad="md" data-bg="surface-alt" data-radius="md" data-text="sm">{ $page.error.message }</pre>
    {/if}
    <div class="error-actions flex items-center justify-center gap-md mt-lg">
      <button onclick={() => goto('/')} class="btn btn-primary">
        Go Home
      </button>
      <button onclick={() => window.location.reload()} class="btn btn-secondary">
        Reload Page
      </button>
    </div>
  </div>
</div>

<style>
  .error-details {
    text-align: left;
    overflow: auto;
    max-height: 200px;
    margin-bottom: var(--gutter-lg);
    border: 1px solid var(--color-border);
  }
</style>

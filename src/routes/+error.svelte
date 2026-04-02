<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';

  $effect(() => {
    console.error('Error:', $page.error);
  });
</script>

<div class="error-page">
  <div class="error-content">
    <h1>Oops!</h1>
    <p class="error-message">Something went wrong</p>
    {#if $page.error instanceof Error}
      <pre class="error-details">{$page.error.message}</pre>
    {/if}
    <div class="error-actions">
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
  .error-page {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: 24px;
    text-align: center;
  }

  .error-content {
    max-width: 500px;
  }

  h1 {
    font-size: 3rem;
    margin-bottom: 16px;
    color: #cf222e;
  }

  .error-message {
    font-size: 1.25rem;
    color: var(--color-text, #1a1a1a);
    margin-bottom: 24px;
  }

  .error-details {
    background: var(--color-bg, #f6f8fa);
    padding: 16px;
    border-radius: 6px;
    font-size: 0.875rem;
    text-align: left;
    overflow: auto;
    max-height: 200px;
    margin-bottom: 24px;
    border: 1px solid var(--color-border, #e0e0e0);
  }

  .error-actions {
    display: flex;
    gap: 12px;
    justify-content: center;
  }

  .btn {
    padding: 10px 20px;
    border-radius: 6px;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    border: none;
    transition: all 0.2s;
  }

  .btn-primary {
    background: #0969da;
    color: white;
  }

  .btn-primary:hover {
    background: #0860ca;
  }

  .btn-secondary {
    background: var(--color-bg, #fff);
    color: var(--color-text, #1a1a1a);
    border: 1px solid var(--color-border, #e0e0e0);
  }

  .btn-secondary:hover {
    background: var(--color-bg, #f5f5f5);
  }
</style>

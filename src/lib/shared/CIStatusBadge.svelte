<script lang="ts">
  export let state: 'success' | 'failure' | 'pending' | 'unknown' = 'unknown';

  function getTooltip(): string {
    switch (state) {
      case 'success': return 'CI passing';
      case 'failure': return 'CI failing';
      case 'pending': return 'CI running';
      default: return 'CI status unknown';
    }
  }
</script>

<span 
  class="ci-badge" 
  class:success={state === 'success'}
  class:failure={state === 'failure'}
  class:pending={state === 'pending'}
  aria-label="CI status: {state}"
  title={getTooltip()}
>
  {#if state === 'success'}
    <svg viewBox="0 0 16 16" width="12" height="12"><path fill="#1a7f37" d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z"/></svg>
  {:else if state === 'failure'}
    <svg viewBox="0 0 16 16" width="12" height="12"><path fill="#cf222e" d="M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.75.75 0 1 1 1.06 1.06L9.06 8l3.22 3.22a.75.75 0 1 1-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 0 1-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06Z"/></svg>
  {:else if state === 'pending'}
    <svg viewBox="0 0 16 16" width="12" height="12"><path fill="#d29922" d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14ZM8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0ZM1.5 8a6.5 6.5 0 1 1 13 0 6.5 6.5 0 0 1-13 0Z"/></svg>
  {:else}
    <svg viewBox="0 0 16 16" width="12" height="12"><path fill="#6e7781" d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14Zm0-1A6 6 0 1 0 8 2a6 6 0 0 0 0 12Z"/></svg>
  {/if}
</span>

<style>
  .ci-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #f6f8fa;
  }

  .ci-badge.success {
    background: #dafbe1;
  }

  .ci-badge.failure {
    background: #ffebe9;
  }

  .ci-badge.pending {
    background: #fff8c5;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
</style>

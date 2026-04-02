<script lang="ts">
  import { goto } from '$app/navigation';
  import { loginWithToken, logout, getAuthState } from '$lib/core/auth_engine.svelte';
  import GlobalSidebar from '$lib/features/global_sidebar/GlobalSidebar.svelte';
  import { layoutState } from '$lib/core/layout_state.svelte';

  const auth = getAuthState();

  let personalToken = $state('');
  let showTokenInput = $state(false);

  function toggleTokenInput() {
    showTokenInput = !showTokenInput;
  }

  async function handleTokenSubmit() {
    if (!personalToken.trim()) {
      return;
    }
    
    const result = await loginWithToken(personalToken.trim());
    if (result.success) {
      personalToken = '';
      showTokenInput = false;
    }
  }

  function handleLogout() {
    logout();
    showTokenInput = false;
    personalToken = '';
  }
</script>

{#if !auth.isAuthenticated}
  <div class="auth-container flex items-center justify-center p-lg">
    <div class="login-prompt max-w-md">
      <h1 data-text="3xl" data-weight="bold" data-color="primary">Welcome to Dash-Git</h1>
      <p data-text="lg" data-color="muted">A fast, clean GitHub dashboard for developers</p>

      {#if auth.error}
        <div class="alert alert-error" role="alert">{auth.error}</div>
      {/if}

      {#if showTokenInput}
        <div class="token-input card my-md" data-pad="md" data-bg="surface-alt" data-radius="md">
          <label for="pat-input" data-text="sm" data-weight="medium">GitHub Personal Access Token</label>
          <input
            id="pat-input"
            type="password"
            placeholder="ghp_..."
            bind:value={personalToken}
            class="pat-input mt-xs mb-md"
            data-radius="md"
            data-border="md"
            onkeydown={(e) => e.key === 'Enter' && handleTokenSubmit()}
          />
          <div class="flex gap-md">
            <button onclick={handleTokenSubmit} class="btn btn-primary flex-1" disabled={auth.isAuthenticating}>
              {#if auth.isAuthenticating}
                <span class="spinner"></span>
                Connecting...
              {:else}
                Connect with Token
              {/if}
            </button>
            <button onclick={toggleTokenInput} class="btn btn-secondary">Cancel</button>
          </div>
          <p class="help-text mt-md" data-text="xs" data-color="muted">
            Create a token at 
            <a href="https://github.com/settings/tokens" target="_blank" rel="noopener noreferrer" data-color="primary">github.com/settings/tokens</a>
            with the <code>repo</code> scope.
          </p>
        </div>
      {:else}
        <button onclick={toggleTokenInput} class="btn btn-primary">
          Enter Personal Access Token
        </button>
      {/if}
    </div>
  </div>
{:else}
  <GlobalSidebar />
{/if}

<style>
  .auth-container {
    min-height: 100vh;
    text-align: center;
  }

  .login-prompt {
    width: 100%;
  }

  .token-input {
    text-align: left;
  }

  .pat-input {
    width: 100%;
    padding: var(--pad-sm) var(--pad-md);
    border: 1px solid var(--color-border);
    font-size: var(--text-sm);
    font-family: var(--font-mono);
    background: var(--color-surface);

    &:focus {
      outline: none;
      border-color: var(--color-primary);
      box-shadow: 0 0 0 3px --alpha(var(--color-primary), 0.1);
    }
  }

  .help-text {
    line-height: var(--leading-relaxed);
  }

  .help-text code {
    background: var(--color-surface-alt);
    padding: 0.1em 0.3em;
    border-radius: var(--radius-sm);
    font-family: var(--font-mono);
    font-size: 0.9em;
  }

  .spinner {
    width: 16px;
    height: 16px;
    border: 2px solid var(--color-border);
    border-top-color: var(--color-primary);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
</style>

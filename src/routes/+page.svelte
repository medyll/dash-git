<script lang="ts">
  import { goto } from '$app/navigation';
  import { login, logout, getAuthState } from '$lib/core/auth_engine.svelte';
  import GlobalSidebar from '$lib/features/global_sidebar/GlobalSidebar.svelte';
  import { layoutState } from '$lib/core/layout_state.svelte';

  const auth = getAuthState();

  let verificationUri = $state<string>('');
  let userCode = $state<string>('');
  let loginInitiated = $state(false);

  async function handleLogin() {
    const result = await login();
    if (result.success && result.verification_uri && result.user_code) {
      verificationUri = result.verification_uri;
      userCode = result.user_code;
      loginInitiated = true;
    }
  }

  function handleLogout() {
    logout();
    loginInitiated = false;
    verificationUri = '';
    userCode = '';
  }

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(userCode);
    } catch {
      // Fallback
    }
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

      <button onclick={handleLogin} class="btn btn-primary" disabled={auth.isAuthenticating}>
        {#if auth.isAuthenticating}
          <span class="spinner"></span>
          Connecting...
        {:else}
          Sign in with GitHub
        {/if}
      </button>
    </div>
  </div>
{:else if loginInitiated && verificationUri && userCode}
  <div class="auth-container flex items-center justify-center p-lg">
    <div class="device-flow max-w-md">
      <h2 data-text="xl" data-weight="semibold" data-margin="lg">Authorize Dash-Git</h2>
      <ol class="steps card" data-pad="md" data-bg="surface-alt">
        <li>
          Visit:
          <a href={verificationUri} target="_blank" rel="noopener noreferrer" data-color="primary">
            {verificationUri}
          </a>
        </li>
        <li>
          Enter this code:
          <button type="button" class="user-code-btn" onclick={copyCode} title="Click to copy" data-radius="sm" data-border="md">
            <span data-text="lg" data-weight="bold">{userCode}</span>
          </button>
        </li>
        <li>Confirm authorization on GitHub</li>
      </ol>
      {#if auth.isAuthenticating}
        <div class="polling flex items-center justify-center gap-md my-md" data-color="muted">
          <span class="spinner"></span>
          <p>Waiting for authorization...</p>
        </div>
      {/if}
      {#if auth.error}
        <div class="alert alert-error" role="alert">{auth.error}</div>
      {/if}
      <button onclick={handleLogout} class="btn btn-secondary mt-md">
        Cancel
      </button>
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

  .login-prompt,
  .device-flow {
    width: 100%;
  }

  .steps {
    text-align: left;
  }

  .steps li {
    margin-bottom: var(--gutter-sm);
    line-height: var(--leading-normal);
  }

  .user-code-btn {
    display: inline-block;
    background: var(--color-surface);
    padding: var(--pad-xs) var(--pad-sm);
    font-family: var(--font-mono);
    cursor: pointer;
    transition: var(--transition-fast);

    &:hover {
      border-color: var(--color-primary);
    }
  }

  .spinner {
    width: 20px;
    height: 20px;
    border: 2px solid var(--color-border);
    border-top-color: var(--color-primary);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
</style>

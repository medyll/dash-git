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
  <div class="auth-container sidebar-content">
    <div class="login-prompt">
      <h1>Welcome to Dash-Git</h1>
      <p>A fast, clean GitHub dashboard for developers</p>

      {#if auth.error}
        <div class="error">{auth.error}</div>
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
  <div class="auth-container sidebar-content">
    <div class="device-flow">
      <h2>Authorize Dash-Git</h2>
      <ol class="steps">
        <li>
          Visit:
          <a href={verificationUri} target="_blank" rel="noopener noreferrer">
            {verificationUri}
          </a>
        </li>
        <li>
          Enter this code:
          <button type="button" class="user-code-btn" onclick={copyCode} title="Click to copy">
            {userCode}
          </button>
        </li>
        <li>Confirm authorization on GitHub</li>
      </ol>
      {#if auth.isAuthenticating}
        <div class="polling">
          <span class="spinner"></span>
          <p>Waiting for authorization...</p>
        </div>
      {/if}
      {#if auth.error}
        <div class="error">{auth.error}</div>
      {/if}
      <button onclick={handleLogout} class="btn btn-secondary">
        Cancel
      </button>
    </div>
  </div>
{:else}
  <GlobalSidebar />
{/if}

<style>
  .auth-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 24px;
    text-align: center;
  }

  .login-prompt,
  .device-flow {
    max-width: 480px;
  }

  h1 {
    font-size: 2rem;
    margin-bottom: 8px;
    color: var(--color-text, #1a1a1a);
  }

  h2 {
    font-size: 1.5rem;
    margin-bottom: 16px;
  }

  p {
    color: var(--color-muted, #666);
    margin-bottom: 24px;
  }

  .btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 12px 24px;
    font-size: 1rem;
    font-weight: 500;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .btn-primary {
    background: #2da44e;
    color: white;
  }

  .btn-primary:hover:not(:disabled) {
    background: #2c974b;
  }

  .btn-secondary {
    background: var(--color-bg, #fff);
    color: var(--color-text, #1a1a1a);
    border: 1px solid var(--color-border, #e0e0e0);
    margin-top: 16px;
  }

  .btn-secondary:hover {
    background: var(--color-bg, #f5f5f5);
  }

  .steps {
    text-align: left;
    background: var(--color-bg, #f5f5f5);
    padding: 20px 20px 20px 40px;
    border-radius: 8px;
    margin: 16px 0;
    color: var(--color-text, #1a1a1a);
  }

  .steps li {
    margin-bottom: 12px;
    line-height: 1.5;
  }

  .steps a {
    color: #0969da;
    text-decoration: none;
  }

  .steps a:hover {
    text-decoration: underline;
  }

  .user-code-btn {
    display: inline-block;
    background: var(--color-bg, #fff);
    border: 1px solid var(--color-border, #e0e0e0);
    padding: 4px 8px;
    border-radius: 4px;
    font-family: monospace;
    font-size: 1.1rem;
    cursor: pointer;
    color: inherit;
  }

  .user-code-btn:hover {
    border-color: #0969da;
  }

  .polling {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    margin: 16px 0;
    color: var(--color-muted, #666);
  }

  .spinner {
    width: 20px;
    height: 20px;
    border: 2px solid var(--color-border, #e0e0e0);
    border-top-color: #0969da;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .error {
    background: #ff8182;
    color: #fff;
    padding: 12px 16px;
    border-radius: 6px;
    margin: 16px 0;
    font-size: 0.875rem;
  }
</style>

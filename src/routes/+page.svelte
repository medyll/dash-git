<script lang="ts">
  import { signInWithGitHub, signOut, authState } from '$lib/core/supabase_auth.svelte';
  import GlobalSidebar from '$lib/features/global_sidebar/GlobalSidebar.svelte';

  async function handleSignIn() {
    await signInWithGitHub();
  }

  async function handleSignOut() {
    await signOut();
  }
</script>

{#if $authState.isLoading}
  <div class="auth-container flex items-center justify-center p-lg">
    <div class="flex items-center gap-md" data-color="muted">
      <span class="spinner"></span>
      <p>Loading...</p>
    </div>
  </div>
{:else if !$authState.user}
  <div class="auth-container flex items-center justify-center p-lg">
    <div class="login-prompt max-w-md text-center">
      <h1 data-text="3xl" data-weight="bold" data-color="primary">Welcome to Dash-Git</h1>
      <p data-text="lg" data-color="muted" data-margin="md">A fast, clean GitHub dashboard for developers</p>

      {#if $authState.error}
        <div class="alert alert-error" role="alert" data-margin="md">{$authState.error}</div>
      {/if}

      <button onclick={handleSignIn} class="btn btn-primary">
        <svg viewBox="0 0 16 16" width="20" height="20" fill="currentColor" style="margin-right: 8px;">
          <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
        </svg>
        Sign in with GitHub
      </button>

      <p class="help-text mt-lg" data-text="xs" data-color="muted">
        You'll be redirected to GitHub to authorize Dash-Git.
        Your token is stored securely in localStorage.
      </p>
    </div>
  </div>
{:else}
  <GlobalSidebar />
{/if}

<style>
  .auth-container {
    min-height: 100vh;
  }

  .login-prompt {
    width: 100%;
  }

  .help-text {
    line-height: var(--leading-relaxed);
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

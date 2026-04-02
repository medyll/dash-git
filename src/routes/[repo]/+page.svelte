<script lang="ts">
  import { page } from '$app/stores';
  import RepoBrowser from '$lib/features/repo_browser/RepoBrowser.svelte';
  import ReadmeViewer from '$lib/features/repo_browser/ReadmeViewer.svelte';
</script>

<div class="repo-view">
  {#if $page.params.repo}
    <div class="repo-content">
      <RepoBrowser repo={$page.params.repo} />
    </div>
  {:else}
    <div class="welcome">
      <h1>Select a repository from the sidebar</h1>
      <p>Click on any repository to browse its files and README</p>
    </div>
  {/if}
</div>

<style>
  .repo-view {
    height: 100%;
    overflow: hidden;
  }

  .repo-content {
    height: 100%;
  }

  .welcome {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    text-align: center;
    color: var(--color-muted, #666);
  }

  h1 {
    font-size: 1.5rem;
    margin-bottom: 8px;
  }
</style>

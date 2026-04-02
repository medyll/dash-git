<script lang="ts">
  import { page } from '$app/stores';
  import RepoBrowser from '$lib/features/repo_browser/RepoBrowser.svelte';
  import ReadmeViewer from '$lib/features/repo_browser/ReadmeViewer.svelte';
</script>

<div class="repo-view h-full overflow-hidden">
  {#if $page.params.repo}
    <div class="repo-content h-full">
      <RepoBrowser repo={$page.params.repo} />
    </div>
  {:else}
    <div class="welcome flex flex-col items-center justify-center h-full text-center" data-color="muted">
      <h1 data-text="xl" data-weight="semibold" data-margin="xs">Select a repository from the sidebar</h1>
      <p data-text="md">Click on any repository to browse its files and README</p>
    </div>
  {/if}
</div>

<style>
  .repo-view {
    height: 100%;
  }

  .repo-content {
    height: 100%;
  }
</style>

<script lang="ts">
  export let content: string = '';

  function renderMarkdown(text: string): string {
    // Simple markdown renderer (in production, use a library like marked)
    let html = text
      // Headers
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      // Code blocks
      .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>')
      // Inline code
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      // Bold
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Italic
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
      // Line breaks
      .replace(/\n/g, '<br>');
    
    return html;
  }
</script>

<div class="readme-viewer">
  {@html renderMarkdown(content)}
</div>

<style>
  .readme-viewer {
    padding: 16px;
    line-height: 1.6;
  }

  .readme-viewer :global(h1),
  .readme-viewer :global(h2),
  .readme-viewer :global(h3) {
    margin-top: 24px;
    margin-bottom: 16px;
    font-weight: 600;
  }

  .readme-viewer :global(h1) {
    font-size: 2em;
    border-bottom: 1px solid var(--color-border, #e0e0e0);
    padding-bottom: 0.3em;
  }

  .readme-viewer :global(h2) {
    font-size: 1.5em;
    border-bottom: 1px solid var(--color-border, #e0e0e0);
    padding-bottom: 0.3em;
  }

  .readme-viewer :global(pre) {
    background: var(--color-bg, #f6f8fa);
    padding: 16px;
    border-radius: 6px;
    overflow: auto;
  }

  .readme-viewer :global(code) {
    background: var(--color-bg, #f6f8fa);
    padding: 0.2em 0.4em;
    border-radius: 3px;
    font-family: monospace;
    font-size: 0.9em;
  }

  .readme-viewer :global(pre code) {
    background: transparent;
    padding: 0;
  }

  .readme-viewer :global(a) {
    color: #0969da;
    text-decoration: none;
  }

  .readme-viewer :global(a:hover) {
    text-decoration: underline;
  }

  .readme-viewer :global(ul),
  .readme-viewer :global(ol) {
    padding-left: 2em;
    margin: 16px 0;
  }

  .readme-viewer :global(blockquote) {
    border-left: 4px solid var(--color-border, #d0d7de);
    padding-left: 16px;
    margin: 16px 0;
    color: var(--color-muted, #656d76);
  }
</style>

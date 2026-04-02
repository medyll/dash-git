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

<div class="readme-viewer" data-pad="md" data-text="base" data-leading="relaxed">
  {@html renderMarkdown(content)}
</div>

<style>
  .readme-viewer {
    line-height: var(--leading-normal);

    :global(h1),
    :global(h2),
    :global(h3) {
      margin-top: var(--gutter-lg);
      margin-bottom: var(--gutter-md);
      font-weight: var(--font-semibold);
    }

    :global(h1) {
      font-size: var(--text-2xl);
      border-bottom: 1px solid var(--color-border);
      padding-bottom: 0.3em;
    }

    :global(h2) {
      font-size: var(--text-xl);
      border-bottom: 1px solid var(--color-border);
      padding-bottom: 0.3em;
    }

    :global(pre) {
      background: var(--color-surface-alt);
      padding: var(--pad-md);
      border-radius: var(--radius-md);
      overflow: auto;
    }

    :global(code) {
      background: var(--color-surface-alt);
      padding: 0.2em 0.4em;
      border-radius: var(--radius-sm);
      font-family: var(--font-mono);
      font-size: var(--text-sm);
    }

    :global(pre code) {
      background: transparent;
      padding: 0;
    }

    :global(a) {
      color: var(--color-primary);
      text-decoration: none;

      &:hover {
        text-decoration: underline;
      }
    }

    :global(ul),
    :global(ol) {
      padding-left: 2em;
      margin: var(--gutter-md) 0;
    }

    :global(blockquote) {
      border-left: 4px solid var(--color-border);
      padding-left: var(--pad-md);
      margin: var(--gutter-md) 0;
      color: var(--color-text-muted);
    }
  }
</style>

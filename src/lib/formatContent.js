function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

export function formatContent(text) {
  let html = escapeHtml(text);
  // Code blocks
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g,
    (_, lang, code) => `<pre><code>${escapeHtml(code)}</code></pre>`);
  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
  // Bold and italic
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  // Paragraphs (split on double newlines)
  html = html.split('\n\n')
    .map(p => {
      const t = p.trim();
      if (!t) return '';
      if (t.startsWith('<')) return t;
      return `<p>${t.replace(/\n/g, '<br>')}</p>`;
    })
    .join('');
  return html;
}

// Split formatted HTML into paragraph blocks for StaggeredReveal
export function splitParagraphs(html) {
  const blocks = html.split(/(<p>.*?<\/p>)/g).filter(Boolean);
  return blocks.length > 0 ? blocks : [html];
}

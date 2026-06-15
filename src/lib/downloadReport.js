function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function parseMarkdownToHtml(markdown) {
  let html = escapeHtml(markdown);

  // Code blocks (fenced)
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g,
    (_, lang, code) => `<pre><code>${escapeHtml(code)}</code></pre>`);

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Bold and italic
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

  // Tables: convert markdown tables to HTML tables
  const lines = html.split('\n');
  const processed = [];
  let inTable = false;
  let tableRows = [];
  let headerRow = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    // Detect table rows (lines starting and ending with |)
    if (line.startsWith('|') && line.endsWith('|')) {
      const cells = line.split('|').filter(c => c.trim().length > 0).map(c => c.trim());
      if (!inTable) {
        inTable = true;
        headerRow = cells;
        continue;
      }
      // Skip separator rows (e.g., |---|---|)
      if (cells.every(c => /^[-:]+$/.test(c))) continue;
      tableRows.push(cells);
    } else {
      // Flush table if we were in one
      if (inTable) {
        let tableHtml = '<table><thead><tr>';
        if (headerRow) {
          headerRow.forEach(c => { tableHtml += `<th>${c}</th>`; });
        }
        tableHtml += '</tr></thead><tbody>';
        tableRows.forEach(row => {
          tableHtml += '<tr>';
          row.forEach(c => { tableHtml += `<td>${c}</td>`; });
          tableHtml += '</tr>';
        });
        tableHtml += '</tbody></table>';
        processed.push(tableHtml);
        inTable = false;
        tableRows = [];
        headerRow = null;
      }
      processed.push(line);
    }
  }
  // Flush any remaining table
  if (inTable) {
    let tableHtml = '<table><thead><tr>';
    if (headerRow) {
      headerRow.forEach(c => { tableHtml += `<th>${c}</th>`; });
    }
    tableHtml += '</tr></thead><tbody>';
    tableRows.forEach(row => {
      tableHtml += '<tr>';
      row.forEach(c => { tableHtml += `<td>${c}</td>`; });
      tableHtml += '</tr>';
    });
    tableHtml += '</tbody></table>';
    processed.push(tableHtml);
  }

  html = processed.join('\n');

  // Headings
  html = html.replace(/^#### (.*$)/gm, '<h4>$1</h4>');
  html = html.replace(/^### (.*$)/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gm, '<h1>$1</h1>');

  // Horizontal rules
  html = html.replace(/^---$/gm, '<hr>');

  // Blockquotes
  html = html.replace(/^&gt; (.*$)/gm, '<blockquote>$1</blockquote>');

  // Paragraphs: wrap remaining text lines
  html = html.split('\n').map(line => {
    const trimmed = line.trim();
    if (!trimmed) return '';
    if (trimmed.startsWith('<')) return trimmed;
    return `<p>${trimmed}</p>`;
  }).join('\n');

  return html;
}

export function downloadReport(markdown) {
  if (!markdown) return;

  const date = new Date().toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
  const dateISO = new Date().toISOString().split('T')[0];

  const bodyHtml = parseMarkdownToHtml(markdown);

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Psychological Profile — ${date}</title>
<style>
  @page {
    size: letter;
    margin: 0.85in 0.9in;
    @top-center {
      content: "PSYCHOLOGICAL PROFILE — CONFIDENTIAL";
      font-family: 'Inter', -apple-system, sans-serif;
      font-size: 7pt;
      color: #b0b0b0;
      letter-spacing: 2px;
      text-transform: uppercase;
    }
    @bottom-center {
      content: "Page " counter(page) " of " counter(pages);
      font-family: 'Inter', -apple-system, sans-serif;
      font-size: 8pt;
      color: #999;
    }
  }
  @page :first {
    @top-center { content: none; }
    @bottom-center { content: none; }
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: Georgia, 'Times New Roman', Times, serif;
    font-size: 11.5pt;
    line-height: 1.7;
    color: #1a1a1a;
    max-width: 720px;
    margin: 0 auto;
    padding: 20px 0;
    -webkit-font-smoothing: antialiased;
  }

  /* ===== COVER PAGE ===== */
  .cover {
    text-align: center;
    padding-top: 180px;
    padding-bottom: 80px;
    page-break-after: always;
  }
  .cover .mark {
    font-size: 28pt;
    margin-bottom: 20px;
    letter-spacing: 6px;
  }
  .cover h1 {
    font-family: 'Inter', -apple-system, sans-serif;
    font-size: 26pt;
    letter-spacing: 4px;
    font-weight: 200;
    margin-bottom: 10px;
    color: #111;
  }
  .cover .subtitle {
    font-family: 'Inter', -apple-system, sans-serif;
    font-size: 13pt;
    color: #666;
    margin-bottom: 50px;
    font-weight: 300;
    letter-spacing: 1px;
  }
  .cover .meta {
    font-size: 10.5pt;
    color: #888;
    line-height: 2.2;
  }
  .cover .disclaimer {
    margin-top: 60px;
    font-size: 8.5pt;
    color: #bbb;
    font-style: italic;
    max-width: 400px;
    margin-left: auto;
    margin-right: auto;
    line-height: 1.5;
  }

  /* ===== TYPOGRAPHY ===== */
  h1 {
    font-family: 'Inter', -apple-system, sans-serif;
    font-size: 20pt;
    text-align: center;
    font-weight: 300;
    margin-top: 36px;
    margin-bottom: 16px;
    color: #111;
    page-break-before: always;
  }
  h1:first-of-type { page-break-before: avoid; }

  h2 {
    font-family: 'Inter', -apple-system, sans-serif;
    font-size: 14pt;
    border-bottom: 1px solid #ddd;
    padding-bottom: 5px;
    margin-top: 32px;
    margin-bottom: 12px;
    font-weight: 500;
    color: #222;
  }

  h3 {
    font-family: 'Inter', -apple-system, sans-serif;
    font-size: 12pt;
    margin-top: 22px;
    margin-bottom: 8px;
    font-weight: 500;
    color: #333;
  }

  h4 {
    font-family: 'Inter', -apple-system, sans-serif;
    font-size: 11pt;
    margin-top: 16px;
    margin-bottom: 6px;
    font-weight: 600;
    color: #444;
  }

  p {
    margin: 6px 0 12px;
    text-align: justify;
    orphans: 3;
    widows: 3;
  }

  /* ===== LISTS ===== */
  ul, ol {
    margin: 8px 0 12px 24px;
  }
  li {
    margin-bottom: 4px;
  }

  /* ===== EMPHASIS ===== */
  strong { color: #111; }
  em { color: #333; }

  /* ===== TABLES ===== */
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 14px 0;
    font-size: 10pt;
    page-break-inside: avoid;
  }
  th {
    background: #f5f5f5;
    font-family: 'Inter', -apple-system, sans-serif;
    font-weight: 600;
    font-size: 9pt;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: #555;
    padding: 8px 10px;
    border-bottom: 2px solid #ddd;
    text-align: left;
  }
  td {
    padding: 7px 10px;
    border-bottom: 1px solid #eee;
    vertical-align: top;
  }
  tr:last-child td { border-bottom: none; }

  /* ===== HORIZONTAL RULES ===== */
  hr {
    border: none;
    border-top: 1px solid #ddd;
    margin: 28px 0;
    page-break-after: avoid;
  }

  /* ===== CODE ===== */
  pre {
    background: #f8f8f8;
    padding: 12px 14px;
    border-radius: 4px;
    border: 1px solid #eee;
    font-family: 'JetBrains Mono', 'SF Mono', monospace;
    font-size: 9pt;
    line-height: 1.5;
    overflow-x: auto;
    white-space: pre-wrap;
    margin: 10px 0;
  }
  code {
    background: #f5f5f5;
    padding: 1px 5px;
    border-radius: 3px;
    font-family: 'JetBrains Mono', 'SF Mono', monospace;
    font-size: 9.5pt;
  }
  pre code {
    background: none;
    padding: 0;
    border-radius: 0;
  }

  /* ===== BLOCKQUOTES ===== */
  blockquote {
    border-left: 3px solid #ccc;
    margin: 12px 0;
    padding: 6px 0 6px 16px;
    color: #555;
    font-style: italic;
  }

  /* ===== PRINT HELPERS ===== */
  .page-break {
    page-break-before: always;
  }
  .no-break {
    page-break-inside: avoid;
  }

  /* ===== FOOTER ===== */
  .report-footer {
    font-family: 'Inter', -apple-system, sans-serif;
    font-size: 8.5pt;
    color: #aaa;
    text-align: center;
    margin-top: 48px;
    padding-top: 18px;
    border-top: 1px solid #ddd;
  }

  /* ===== READING LIST ===== */
  .book-entry {
    margin: 14px 0;
    padding-left: 12px;
    border-left: 2px solid #e0e0e0;
  }
  .book-entry strong {
    font-family: 'Inter', -apple-system, sans-serif;
    font-size: 11pt;
  }

  /* ===== PRINT MEDIA ===== */
  @media print {
    body {
      font-size: 11pt;
      color: #000;
    }
    .cover {
      padding-top: 140px;
    }
  }
</style>
</head>
<body>

<!-- COVER PAGE -->
<div class="cover">
  <div class="mark">◆</div>
  <h1>PSYCHOLOGICAL<br>PROFILE</h1>
  <div class="subtitle">Confidential Behavioral Analysis</div>
  <div class="meta">
    <p>Date: ${date}</p>
    <p>Assessment Type: Structured Clinical Interview</p>
    <p>Methodology: Multi-Phase Behavioral Analysis</p>
  </div>
  <div class="disclaimer">
    This document is a structured behavioral analysis based on a single-session interview.
    It is not a clinical diagnosis, formal psychological evaluation, or medical assessment.
    It is intended for personal insight and reflection only.
  </div>
</div>

<!-- REPORT BODY -->
${bodyHtml}

<!-- FOOTER -->
<div class="report-footer">
  Psychological Profile &middot; Confidential &middot; Generated ${date}
  <br>Not a clinical diagnosis or formal psychological evaluation.
</div>

</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Psychological_Profile_${dateISO}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function printReport(markdown) {
  if (!markdown) return;

  const date = new Date().toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  const bodyHtml = parseMarkdownToHtml(markdown);

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Psychological Profile — ${date}</title>
<style>
  @page { size: letter; margin: 0.85in 0.9in; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: Georgia, 'Times New Roman', Times, serif;
    font-size: 11pt; line-height: 1.7; color: #1a1a1a;
    max-width: 720px; margin: 0 auto; padding: 20px 0;
  }
  .cover { text-align: center; padding-top: 100px; padding-bottom: 40px; }
  .cover h1 { font-family: 'Inter', sans-serif; font-size: 22pt; letter-spacing: 4px; font-weight: 200; }
  .cover .subtitle { font-family: 'Inter', sans-serif; font-size: 11pt; color: #666; margin: 8px 0 30px; }
  .cover .meta { font-size: 10pt; color: #888; line-height: 2; }
  .cover .disclaimer { margin-top: 40px; font-size: 8pt; color: #bbb; font-style: italic; max-width: 360px; margin-left: auto; margin-right: auto; }
  h1 { font-family: 'Inter', sans-serif; font-size: 18pt; text-align: center; font-weight: 300; margin: 30px 0 12px; }
  h2 { font-family: 'Inter', sans-serif; font-size: 13pt; border-bottom: 1px solid #ddd; padding-bottom: 4px; margin: 24px 0 10px; font-weight: 500; }
  h3 { font-family: 'Inter', sans-serif; font-size: 11pt; margin: 16px 0 6px; font-weight: 500; }
  p { margin: 5px 0 10px; text-align: justify; }
  table { width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 9pt; }
  th { background: #f5f5f5; font-family: 'Inter', sans-serif; font-weight: 600; font-size: 8pt; text-transform: uppercase; padding: 6px 8px; border-bottom: 2px solid #ddd; text-align: left; }
  td { padding: 5px 8px; border-bottom: 1px solid #eee; vertical-align: top; }
  hr { border: none; border-top: 1px solid #ddd; margin: 20px 0; }
  pre { background: #f8f8f8; padding: 10px; border: 1px solid #eee; font-family: monospace; font-size: 8pt; white-space: pre-wrap; }
  code { background: #f5f5f5; padding: 1px 4px; border-radius: 2px; font-family: monospace; font-size: 9pt; }
  blockquote { border-left: 3px solid #ccc; margin: 8px 0; padding: 4px 0 4px 14px; color: #555; font-style: italic; }
  .report-footer { font-family: 'Inter', sans-serif; font-size: 8pt; color: #aaa; text-align: center; margin-top: 36px; padding-top: 14px; border-top: 1px solid #ddd; }
  @media print { body { font-size: 10pt; } .cover { padding-top: 80px; } }
</style>
</head>
<body>
<div class="cover">
  <h1>PSYCHOLOGICAL PROFILE</h1>
  <div class="subtitle">Confidential Behavioral Analysis</div>
  <div class="meta"><p>Date: ${date}</p></div>
  <div class="disclaimer">Not a clinical diagnosis or formal psychological evaluation.</div>
</div>
${bodyHtml}
<div class="report-footer">Confidential &middot; Generated ${date}</div>
</body>
</html>`;

  const printWindow = window.open('', '_blank', 'width=800,height=600');
  if (!printWindow) return;
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
  printWindow.onload = () => {
    printWindow.print();
    printWindow.close();
  };
  // Fallback: if onload doesn't fire, print after a delay
  setTimeout(() => {
    try { printWindow.print(); printWindow.close(); } catch {}
  }, 800);
}

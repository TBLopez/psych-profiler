export function downloadReport(markdown) {
  if (!markdown) return;

  const date = new Date().toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  const bodyHtml = markdown
    .split('\n')
    .map(line => {
      if (line.startsWith('### ')) return `<h3>${line.slice(4)}</h3>`;
      if (line.startsWith('## ')) return `<h2>${line.slice(3)}</h2>`;
      if (line.startsWith('# ')) return `<h1>${line.slice(2)}</h1>`;
      if (line.startsWith('---')) return '<hr>';
      if (line.trim() === '') return '';
      return `<p>${line}</p>`;
    })
    .join('\n');

  const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Psychological Profile</title><style>
    @page { size: letter; margin: 0.9in; }
    body {
      font-family: Georgia, 'Times New Roman', Times, serif;
      font-size: 12pt; line-height: 1.6; color: #1a1a1a;
      max-width: 700px; margin: 0 auto; padding: 20px;
    }
    .cover { text-align: center; padding-top: 160px; padding-bottom: 60px; }
    .cover h1 {
      font-family: 'Inter', -apple-system, sans-serif;
      font-size: 26pt; letter-spacing: 3px; font-weight: 200; margin-bottom: 8px;
    }
    .cover .sub {
      font-family: 'Inter', -apple-system, sans-serif;
      font-size: 14pt; color: #555; margin-bottom: 40px; font-weight: 300;
    }
    .cover .meta { font-size: 11pt; color: #777; line-height: 2; }
    h1 {
      font-family: 'Inter', -apple-system, sans-serif;
      font-size: 22pt; text-align: center; font-weight: 300; margin-top: 30px;
    }
    h2 {
      font-family: 'Inter', -apple-system, sans-serif;
      font-size: 16pt; border-bottom: 1px solid #ccc;
      padding-bottom: 4px; margin-top: 28px; font-weight: 500;
    }
    h3 {
      font-family: 'Inter', -apple-system, sans-serif;
      font-size: 13pt; margin-top: 18px; font-weight: 500;
    }
    p { margin: 6px 0 10px; text-align: justify; }
    hr { border: none; border-top: 1px solid #ddd; margin: 24px 0; }
    pre { background: #f5f5f5; padding: 12px; border-radius: 4px; font-size: 10pt; overflow-x: auto; }
    code { background: #f5f5f5; padding: 1px 4px; border-radius: 3px; font-size: 10pt; }
    table { width: 100%; border-collapse: collapse; margin: 12px 0; }
    td { border: 1px solid #ccc; padding: 6px 10px; vertical-align: top; }
    td:first-child { font-weight: bold; background: #f5f5f5; width: 30%; }
    .page-break { page-break-before: always; }
    .footer {
      font-family: 'Inter', -apple-system, sans-serif;
      font-size: 9pt; color: #999; text-align: center;
      margin-top: 40px; border-top: 1px solid #ddd; padding-top: 16px;
    }
  </style></head><body>
  <div class="cover"><h1>PSYCHOLOGICAL PROFILE</h1><div class="sub">Confidential Behavioral Analysis</div><div class="meta"><p>Date: ${date}</p><p style="margin-top:50px;font-size:10pt;color:#aaa;">Not a clinical diagnosis or formal psychological evaluation.</p></div></div>
  <div class="page-break"></div>
  ${bodyHtml}
  <p class="footer">Confidential · Generated ${new Date().toLocaleString()}</p></body></html>`;

  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `psychological_profile_${new Date().toISOString().split('T')[0]}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

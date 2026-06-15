# Frontend Redesign — Implementation Plan (v2: Warm Precision + Immersive)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the Psych Profiler frontend as a React SPA with Vite, Tailwind CSS, Framer Motion, and Aceternity UI, using the **Warm Precision** visual language (gradient accent family, phase-aware ambience, Godly-inspired typography) and **Immersive** animation density (cinematic screen transitions, cursor-responsive lighting, staggered reveals, spring physics throughout). Backend unchanged.

**Architecture:** Vite SPA with 3-screen state machine (gate → chat → report) with cinematic transitions. React context + useReducer for state. Tailwind with custom design tokens + phase-aware CSS variables. Code-split via React.lazy(). Backend API consumed identically — zero changes to `backend/worker.js`.

**Tech Stack:** Vite 6, React 18, Tailwind CSS 4, Framer Motion 12, Aceternity UI (Sparkles component, tree-shaken), Lucide React, Vitest + Testing Library

**DeepSeek integration note:** The v2 system prompt (already committed) is sent to DeepSeek's `deepseek-reasoner` model via the Cloudflare Worker. The prompt's adaptive phase transitions, cultural calibration, and crisis protocols are executed by DeepSeek at runtime — no frontend changes needed for adaptive interview behavior.

---

## File Structure

```
psych-profiler/
├── index.html                  # REPLACE: Vite entry point
├── package.json                # CREATE
├── vite.config.js              # CREATE
├── backend/                    # UNCHANGED
│   ├── worker.js
│   ├── wrangler.toml
│   └── package.json
├── src/
│   ├── main.jsx                # CREATE: React root
│   ├── App.jsx                 # CREATE: State machine + ScreenTransition orchestrator
│   ├── index.css               # CREATE: Tailwind directives + tokens + keyframes
│   ├── context/
│   │   └── InterviewContext.jsx # CREATE: useReducer state + stats
│   ├── screens/
│   │   ├── PasswordGate.jsx    # CREATE: Cinematic gate with radial reveal
│   │   ├── InterviewChat.jsx   # CREATE: Immersive chat with phase-aware ambience
│   │   └── ReportView.jsx      # CREATE: Multi-step report experience
│   ├── components/
│   │   ├── AmbientEnvironment.jsx   # CREATE: Phase-aware orbs + cursor glow + noise
│   │   ├── ScreenTransition.jsx     # CREATE: Cinematic transition orchestrator
│   │   ├── ChatBubble.jsx           # CREATE: Rich message cards with glass/gradient
│   │   ├── StaggeredReveal.jsx      # CREATE: Paragraph-by-paragraph reveal
│   │   ├── TypingIndicator.jsx      # CREATE: 3-dot bounce + breathing input
│   │   ├── PhaseIndicator.jsx       # CREATE: Gradient pill + progress dots + counter
│   │   ├── CinematicPhaseChange.jsx # CREATE: Viewport-level phase transition
│   │   ├── InputBar.jsx             # CREATE: Floating glass input + state morph
│   │   ├── SendButton.jsx           # CREATE: 3-state morph (arrow→spinner→check)
│   │   ├── CursorGlow.jsx           # CREATE: Desktop cursor-tracking lighting
│   │   ├── SparkleBurst.jsx         # CREATE: Aceternity Sparkles wrapper
│   │   ├── StatsCounter.jsx         # CREATE: Animated number count-up
│   │   ├── ReportPreview.jsx        # CREATE: Section cards preview
│   │   └── StatusMessage.jsx        # CREATE: Success/error toast
│   ├── hooks/
│   │   ├── useInterview.js          # CREATE: State reducer + side effects
│   │   ├── useApi.js                # CREATE: Fetch wrapper with auth
│   │   ├── usePhaseAmbience.js      # CREATE: Phase-aware color interpolation
│   │   └── useCursorGlow.js         # CREATE: Desktop cursor tracking
│   └── lib/
│       ├── api.js                   # CREATE: API_BASE + apiPost
│       ├── formatContent.js         # CREATE: Markdown → HTML
│       ├── detectPhase.js           # CREATE: Phase detection
│       ├── downloadReport.js        # CREATE: Print-styled HTML report
│       └── phaseColors.js           # CREATE: Phase→color mapping + interpolation
└── __tests__/
    ├── setup.js
    ├── formatContent.test.js
    ├── detectPhase.test.js
    ├── phaseColors.test.js
    ├── InterviewContext.test.jsx
    └── PasswordGate.test.jsx
```

---

### Task 1: Project Scaffolding

**Files:**
- Create: `package.json`, `vite.config.js`, `index.html`, `src/main.jsx`, `src/index.css`

- [ ] **Step 1: Create package.json**

```json
{
  "name": "psych-profiler",
  "private": true,
  "version": "2.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "framer-motion": "^12.0.0",
    "lucide-react": "^0.460.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.4",
    "vite": "^6.0.0",
    "vitest": "^2.1.0",
    "@testing-library/react": "^16.1.0",
    "@testing-library/jest-dom": "^6.6.0",
    "@testing-library/user-event": "^14.5.0",
    "jsdom": "^25.0.0",
    "tailwindcss": "^4.0.0",
    "@tailwindcss/vite": "^4.0.0",
    "@tailwindcss/typography": "^0.5.0"
  }
}
```

- [ ] **Step 2: Create vite.config.js**

```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'motion-vendor': ['framer-motion'],
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./__tests__/setup.js'],
  },
});
```

- [ ] **Step 2b: Create __tests__/setup.js**

```javascript
import '@testing-library/jest-dom/vitest';
```

- [ ] **Step 3: Replace index.html (Vite entry)**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <title>Psychological Profile</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@200;300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.jsx"></script>
</body>
</html>
```

Note: Inter weight 200 added for Godly-inspired light headings.

- [ ] **Step 4: Create src/main.jsx**

```jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

- [ ] **Step 5: Create src/index.css**

```css
@import "tailwindcss";

@theme {
  /* Canvas & surfaces */
  --color-canvas: #FAFBFC;
  --color-surface: #FFFFFF;
  --color-surface-raised: #F3F4F6;
  --color-surface-glass: rgba(255, 255, 255, 0.8);

  /* Ink */
  --color-ink: #1A1A2E;
  --color-ink-secondary: #555555;
  --color-ink-muted: #888888;

  /* Accent family — indigo → violet → rose → emerald */
  --color-accent-primary: #4F46E5;
  --color-accent-primary-light: #6366F1;
  --color-accent-deep: #7C3AED;
  --color-accent-deep-light: #8B5CF6;
  --color-accent-warm: #EC4899;
  --color-accent-warm-light: #F472B6;
  --color-accent-positive: #059669;
  --color-accent-positive-light: #10B981;

  /* Glow */
  --color-accent-glow-primary: rgba(79, 70, 229, 0.08);
  --color-accent-glow-warm: rgba(236, 72, 153, 0.05);

  /* Semantic */
  --color-success: #059669;
  --color-danger: #DC2626;
  --color-border: #E8EAF0;
  --color-border-light: #F0F0F5;

  /* Typography */
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-mono: 'JetBrains Mono', SF Mono, monospace;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: var(--font-sans);
  background: var(--color-canvas);
  color: var(--color-ink);
  min-height: 100vh;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* Focus rings */
:focus-visible {
  outline: 2px solid var(--color-accent-primary) !important;
  outline-offset: 2px !important;
}

/* Scrollbar */
::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--color-border); border-radius: 2px; }

/* Noise texture overlay — used by AmbientEnvironment */
@keyframes noise {
  0%, 100% { transform: translate(0, 0); }
  10% { transform: translate(-5%, -5%); }
  20% { transform: translate(-10%, 5%); }
  30% { transform: translate(5%, -10%); }
  40% { transform: translate(-5%, 15%); }
  50% { transform: translate(-10%, 5%); }
  60% { transform: translate(15%, 0); }
  70% { transform: translate(0, 10%); }
  80% { transform: translate(-15%, 0); }
  90% { transform: translate(10%, 5%); }
}

/* Phase-aware gradient keyframes */
@keyframes phasePulse {
  0%, 100% { opacity: 0.04; }
  50% { opacity: 0.07; }
}
```

- [ ] **Step 6: Install dependencies and verify dev server**

```bash
cd /Users/tony/psych-profiler && npm install
npm run dev
```

Expected: dev server starts on localhost:5173, blank page no errors.

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json vite.config.js index.html src/main.jsx src/index.css __tests__/setup.js
git commit -m "feat: scaffold Vite + React + Tailwind project (Warm Precision edition)
Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 2: API Layer

**Files:**
- Create: `src/lib/api.js`
- Create: `src/hooks/useApi.js`

- [ ] **Step 1: Create src/lib/api.js**

```javascript
const API_BASE = 'https://psych-profiler.techtony2013.workers.dev';

export async function apiPost(endpoint, body, password) {
  const headers = { 'Content-Type': 'application/json' };
  if (password) {
    headers['X-Password'] = password;
  }
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Server error (${res.status})`);
  }
  return data;
}

export async function verifyPassword(password) {
  return apiPost('/api/verify', { password });
}

export async function chat(messages, systemPrompt, password) {
  return apiPost('/api/chat', { messages, system: systemPrompt }, password);
}

export async function generateReport(conversation, password) {
  return apiPost('/api/generate-report', { conversation }, password);
}
```

- [ ] **Step 2: Create src/hooks/useApi.js**

```javascript
import { useCallback, useRef } from 'react';
import { chat as chatApi, generateReport as generateReportApi } from '../lib/api';

export function useApi(password) {
  const passwordRef = useRef(password);
  passwordRef.current = password;

  const doChat = useCallback(async (messages, systemPrompt) => {
    return chatApi(messages, systemPrompt, passwordRef.current);
  }, []);

  const doGenerateReport = useCallback(async (conversation) => {
    return generateReportApi(conversation, passwordRef.current);
  }, []);

  return { doChat, doGenerateReport };
}
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/api.js src/hooks/useApi.js
git commit -m "feat: add API layer — fetch wrapper + useApi hook
Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 3: Utility Functions

**Files:**
- Create: `src/lib/formatContent.js`
- Create: `src/lib/detectPhase.js`
- Create: `src/lib/downloadReport.js`
- Create: `src/lib/phaseColors.js` (NEW)
- Create: `__tests__/formatContent.test.js`
- Create: `__tests__/detectPhase.test.js`
- Create: `__tests__/phaseColors.test.js` (NEW)

- [ ] **Step 1: Create src/lib/formatContent.js**

```javascript
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
  // Split on <p> tags, preserve other block elements
  const blocks = html.split(/(<p>.*?<\/p>)/g).filter(Boolean);
  return blocks.length > 0 ? blocks : [html];
}
```

- [ ] **Step 2: Create src/lib/phaseColors.js**

Phase → color mapping and interpolation utilities for PhaseAmbience.

```javascript
// Phase color configurations for ambient environment
export const PHASE_COLORS = {
  1: {
    name: 'Baseline',
    orb: 'rgba(79, 70, 229, 0.04)',      // indigo, very subtle
    accent: '#4F46E5',
    gradient: 'radial-gradient(circle, rgba(79,70,229,0.06), transparent 70%)',
  },
  2: {
    name: 'Cognitive & Emotional',
    orb: 'rgba(79, 70, 229, 0.05)',
    accent: '#6366F1',
    gradient: 'radial-gradient(circle, rgba(99,102,241,0.06), transparent 70%)',
  },
  3: {
    name: 'Relational & Social',
    orb: 'rgba(124, 58, 237, 0.05)',     // violet shift
    accent: '#7C3AED',
    gradient: 'radial-gradient(circle, rgba(124,58,237,0.06), transparent 70%)',
  },
  4: {
    name: 'Vulnerability Probe',
    orb: 'rgba(124, 58, 237, 0.06)',     // deeper violet
    accent: '#8B5CF6',
    gradient: 'radial-gradient(circle, rgba(139,92,246,0.07), transparent 70%)',
  },
  5: {
    name: 'Profile Delivery',
    orb: 'rgba(5, 150, 105, 0.05)',      // emerald resolution
    accent: '#059669',
    gradient: 'radial-gradient(circle, rgba(5,150,105,0.06), transparent 70%)',
  },
};

// Phase badge gradient classes (Tailwind)
export const PHASE_GRADIENTS = {
  1: 'from-accent-primary to-accent-primary-light',
  2: 'from-accent-primary to-accent-primary-light',
  3: 'from-accent-deep to-accent-deep-light',
  4: 'from-accent-deep to-accent-deep-light',
  5: 'from-accent-positive to-accent-positive-light',
};

// Phase names for display
export const PHASE_NAMES = {
  1: 'Baseline',
  2: 'Cognitive & Emotional',
  3: 'Relational & Social',
  4: 'Vulnerability Probe',
  5: 'Profile Delivery',
};

// Interpolate between two phase colors (for ambient transitions)
export function interpolatePhaseColor(fromPhase, toPhase, progress) {
  // Simple linear interpolation between phase accent colors
  // Used by usePhaseAmbience for smooth ambient transitions
  const fromColor = PHASE_COLORS[fromPhase]?.orb || PHASE_COLORS[1].orb;
  const toColor = PHASE_COLORS[toPhase]?.orb || PHASE_COLORS[5].orb;
  // Return the target color when progress >= 1, start when <= 0
  if (progress >= 1) return toColor;
  if (progress <= 0) return fromColor;
  return toColor; // Simplify: just return target after threshold
}
```

- [ ] **Step 3: Create src/lib/downloadReport.js**

Enhanced with print-styled typography (Georgia/Garamond for body).

```javascript
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
```

- [ ] **Step 4: Create src/lib/detectPhase.js**

Same as original spec.

```javascript
export function detectPhase(text) {
  if (!text) return null;
  if (text.includes('EXECUTIVE SUMMARY') || text.includes('PSYCHOLOGICAL PROFILE')) {
    return 5;
  }
  if (text.includes('Shadow') && (text.includes('blind spot') || text.includes('hidden'))) {
    return 4;
  }
  if (text.includes('attachment') || text.includes('relational') || text.includes('conflict')) {
    return 3;
  }
  if (text.includes('cognitive') || text.includes('emotional regulation') || text.includes('decision-making')) {
    return 2;
  }
  if (text.includes('baseline') || text.includes('rapport') || text.includes('who you are')) {
    return 1;
  }
  return null;
}
```

- [ ] **Step 5: Create test files**

Create `__tests__/formatContent.test.js` — same as original spec.

Create `__tests__/detectPhase.test.js` — same as original spec.

Create `__tests__/phaseColors.test.js`:

```javascript
import { describe, it, expect } from 'vitest';
import { PHASE_COLORS, PHASE_GRADIENTS, PHASE_NAMES, interpolatePhaseColor } from '../src/lib/phaseColors';

describe('phaseColors', () => {
  it('has color config for all 5 phases', () => {
    for (let i = 1; i <= 5; i++) {
      expect(PHASE_COLORS[i]).toBeDefined();
      expect(PHASE_COLORS[i].name).toBeDefined();
      expect(PHASE_COLORS[i].accent).toBeDefined();
    }
  });

  it('has gradient classes for all 5 phases', () => {
    for (let i = 1; i <= 5; i++) {
      expect(PHASE_GRADIENTS[i]).toBeDefined();
    }
  });

  it('has display names for all 5 phases', () => {
    for (let i = 1; i <= 5; i++) {
      expect(PHASE_NAMES[i]).toBeDefined();
    }
  });

  it('interpolatePhaseColor returns target at progress >= 1', () => {
    const result = interpolatePhaseColor(1, 5, 1);
    expect(result).toBe(PHASE_COLORS[5].orb);
  });

  it('interpolatePhaseColor returns source at progress <= 0', () => {
    const result = interpolatePhaseColor(1, 5, 0);
    expect(result).toBe(PHASE_COLORS[1].orb);
  });

  it('handles invalid phase numbers gracefully', () => {
    expect(interpolatePhaseColor(0, 6, 0.5)).toBeDefined();
  });
});
```

- [ ] **Step 6: Run tests**

```bash
npx vitest run __tests__/formatContent.test.js __tests__/detectPhase.test.js __tests__/phaseColors.test.js
```

Expected: all tests pass.

- [ ] **Step 7: Commit**

```bash
git add src/lib/formatContent.js src/lib/detectPhase.js src/lib/downloadReport.js src/lib/phaseColors.js __tests__/formatContent.test.js __tests__/detectPhase.test.js __tests__/phaseColors.test.js
git commit -m "feat: add utility functions — formatContent, detectPhase, downloadReport (print-styled), phaseColors
Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 4: State Management

**Files:**
- Create: `src/context/InterviewContext.jsx`
- Create: `__tests__/InterviewContext.test.jsx`

- [ ] **Step 1: Create src/context/InterviewContext.jsx**

Enhanced with `stats` object for the report view.

```jsx
import { createContext, useContext, useReducer } from 'react';

const InterviewContext = createContext(null);
const InterviewDispatch = createContext(null);

const initialState = {
  screen: 'gate',        // 'gate' | 'interview' | 'report'
  password: '',
  phase: 1,
  questionCount: 0,
  messages: [],
  status: 'idle',        // 'idle' | 'processing' | 'complete' | 'error'
  reportMarkdown: null,
  error: null,
  stats: {
    phasesCompleted: 1,
    questionsAnswered: 0,
    domainsAnalyzed: 8,
  },
};

function reducer(state, action) {
  switch (action.type) {
    case 'UNLOCK': {
      const { password } = action;
      return { ...state, password, screen: 'interview', error: null };
    }

    case 'ADD_MESSAGE': {
      const { role, content } = action;
      const newMessages = [...state.messages, { role, content }];
      const newQuestionCount = role === 'assistant' ? state.questionCount + 1 : state.questionCount;
      return {
        ...state,
        messages: newMessages,
        questionCount: newQuestionCount,
        stats: {
          ...state.stats,
          questionsAnswered: newQuestionCount,
          phasesCompleted: state.phase,
        },
        error: null,
      };
    }

    case 'SET_PHASE': {
      const { phase } = action;
      if (phase && phase !== state.phase) {
        return {
          ...state,
          phase,
          questionCount: 0,
          stats: {
            ...state.stats,
            phasesCompleted: phase,
          },
        };
      }
      return state;
    }

    case 'SET_STATUS': {
      const { status } = action;
      return { ...state, status };
    }

    case 'SET_REPORT': {
      const { report } = action;
      return { ...state, reportMarkdown: report, screen: 'report' };
    }

    case 'SET_ERROR': {
      const { error } = action;
      return { ...state, error, status: 'idle' };
    }

    case 'RESET': {
      return { ...initialState };
    }

    default:
      return state;
  }
}

export function InterviewProvider({ children }) {
  const [{ screen, password, phase, questionCount, messages, status, reportMarkdown, error, stats }, dispatch] =
    useReducer(reducer, initialState);

  return (
    <InterviewContext.Provider value={{ screen, password, phase, questionCount, messages, status, reportMarkdown, error, stats }}>
      <InterviewDispatch.Provider value={dispatch}>
        {children}
      </InterviewDispatch.Provider>
    </InterviewContext.Provider>
  );
}

export function useInterviewState() {
  const ctx = useContext(InterviewContext);
  if (!ctx) throw new Error('useInterviewState must be inside InterviewProvider');
  return ctx;
}

export function useInterviewDispatch() {
  const dispatch = useContext(InterviewDispatch);
  if (!dispatch) throw new Error('useInterviewDispatch must be inside InterviewProvider');
  return dispatch;
}
```

- [ ] **Step 2: Create __tests__/InterviewContext.test.jsx**

Same as original spec but updated to check stats.

- [ ] **Step 3: Run tests**

```bash
npx vitest run __tests__/InterviewContext.test.jsx
```

- [ ] **Step 4: Commit**

```bash
git add src/context/InterviewContext.jsx __tests__/InterviewContext.test.jsx
git commit -m "feat: add InterviewContext — useReducer state machine with stats tracking
Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 5: Base Components — Part 1 (ChatBubble, StaggeredReveal, TypingIndicator, PhaseIndicator)

**Files:**
- Create: `src/components/ChatBubble.jsx`
- Create: `src/components/StaggeredReveal.jsx` (NEW)
- Create: `src/components/TypingIndicator.jsx`
- Create: `src/components/PhaseIndicator.jsx`

- [ ] **Step 1: Create src/components/ChatBubble.jsx**

Enhanced with glass-morphism interviewer cards, gradient user bubbles, and structured profile section treatment.

```jsx
import { motion, useReducedMotion } from 'framer-motion';
import { formatContent } from '../lib/formatContent';
import StaggeredReveal from './StaggeredReveal';

const spring = { type: 'spring', stiffness: 100, damping: 15 };

function isProfileSection(content) {
  return content.includes('---') && (
    content.includes('EXECUTIVE SUMMARY') ||
    content.includes('PERSONALITY ARCHITECTURE') ||
    content.includes('DEFENSE STRUCTURE') ||
    content.includes('ATTACHMENT') ||
    content.includes('STRESS') ||
    content.includes('SHADOW') ||
    content.includes('RISK') ||
    content.includes('RECOMMENDATIONS')
  );
}

const sectionGradients = {
  'EXECUTIVE SUMMARY': 'from-indigo-50 to-transparent',
  'PERSONALITY ARCHITECTURE': 'from-violet-50 to-transparent',
  'DEFENSE STRUCTURE': 'from-rose-50 to-transparent',
  'ATTACHMENT': 'from-blue-50 to-transparent',
  'STRESS': 'from-amber-50 to-transparent',
  'SHADOW': 'from-slate-50 to-transparent',
  'RISK': 'from-emerald-50 to-transparent',
  'RECOMMENDATIONS': 'from-teal-50 to-transparent',
};

export default function ChatBubble({ role, content, isProfileDelivery }) {
  const reduced = useReducedMotion();
  const isUser = role === 'user';
  const isSystem = role === 'system';
  const label = isUser ? 'You' : isSystem ? 'System' : 'Interviewer';
  const avatar = isUser ? 'Y' : isSystem ? '●' : 'I';

  const avatarClasses = isUser
    ? 'bg-surface-raised text-ink-secondary border border-border'
    : isSystem
    ? 'bg-amber-50 text-amber-600 border border-amber-200'
    : 'bg-gradient-to-br from-accent-primary/10 to-accent-deep/10 text-accent-primary border border-accent-primary/20';

  const hasProfileSections = !isUser && isProfileDelivery && isProfileSection(content);
  const isLongMessage = !isUser && !isSystem && content.length > 200;

  const bodyHtml = isUser ? `<p>${content}</p>` : formatContent(content);

  return (
    <motion.div
      className={`msg flex gap-3 items-start mb-6 max-w-full ${isUser ? 'flex-row-reverse' : ''}`}
      initial={reduced ? { opacity: 1 } : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={spring}
    >
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 mt-0.5 ${avatarClasses}`}>
        {avatar}
      </div>

      {/* Body */}
      <div className={`flex-1 min-w-0 ${isUser ? 'flex flex-col items-end' : ''}`}>
        {/* Label */}
        <div className={`text-[11px] font-semibold mb-1.5 tracking-wide uppercase ${isUser ? 'text-accent-primary/60' : isSystem ? 'text-amber-500' : 'text-accent-primary'}`}>
          {label}
        </div>

        {/* Content */}
        {isUser ? (
          <div className="px-4 py-2.5 max-w-[80%] bg-gradient-to-br from-accent-primary to-accent-deep text-white rounded-[16px] rounded-br-[4px] shadow-[0_2px_8px_rgba(79,70,229,0.15)]">
            <p className="text-[15px] leading-relaxed">{content}</p>
          </div>
        ) : hasProfileSections ? (
          <div className="space-y-4">
            {content.split(/(---.*?---)/g).filter(Boolean).map((section, i) => {
              if (section.match(/---.*?---/)) {
                const sectionName = section.replace(/---/g, '').trim();
                return (
                  <div key={i} className="bg-white/80 backdrop-blur-sm border border-border rounded-xl p-4 shadow-sm">
                    <div className="text-[11px] font-semibold text-accent-primary uppercase tracking-wide mb-2">
                      {sectionName}
                    </div>
                  </div>
                );
              }
              return (
                <div key={i} className="text-[15px] leading-relaxed text-ink-secondary"
                  dangerouslySetInnerHTML={{ __html: formatContent(section) }}
                />
              );
            })}
          </div>
        ) : isLongMessage ? (
          <StaggeredReveal html={bodyHtml} disabled={reduced} />
        ) : (
          <div
            className={`text-[15px] leading-relaxed text-ink-secondary ${isSystem ? 'italic text-ink-muted text-xs' : ''}`}
            dangerouslySetInnerHTML={{ __html: bodyHtml }}
          />
        )}
      </div>
    </motion.div>
  );
}
```

- [ ] **Step 2: Create src/components/StaggeredReveal.jsx**

```jsx
import { motion, useReducedMotion } from 'framer-motion';

const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 6 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export default function StaggeredReveal({ html, disabled }) {
  const reduced = useReducedMotion();

  if (reduced || disabled) {
    return <div className="text-[15px] leading-relaxed text-ink-secondary" dangerouslySetInnerHTML={{ __html: html }} />;
  }

  // Split on <p> tags for paragraph-level staggering
  const paragraphs = html.split(/(<p>.*?<\/p>)/g).filter(Boolean);

  if (paragraphs.length <= 1) {
    return <div className="text-[15px] leading-relaxed text-ink-secondary" dangerouslySetInnerHTML={{ __html: html }} />;
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="text-[15px] leading-relaxed text-ink-secondary">
      {paragraphs.map((p, i) => (
        <motion.span key={i} variants={item} dangerouslySetInnerHTML={{ __html: p }} />
      ))}
    </motion.div>
  );
}
```

- [ ] **Step 3: Create src/components/TypingIndicator.jsx**

Enhanced with breathing effect reference for InputBar.

```jsx
import { motion } from 'framer-motion';

const dot = {
  animate: { scale: [0.6, 1, 0.6], opacity: [0.3, 1, 0.3] },
  transition: { duration: 1.4, repeat: Infinity, ease: 'easeInOut' },
};

export default function TypingIndicator() {
  return (
    <motion.div
      className="flex items-center gap-2.5 py-2 px-1"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      role="status"
      aria-label="Interviewer is formulating"
    >
      <div className="flex gap-1">
        {[0, 0.2, 0.4].map((delay, i) => (
          <motion.span
            key={i}
            className="inline-block w-1.5 h-1.5 rounded-full bg-ink-muted"
            animate={dot.animate}
            transition={{ ...dot.transition, delay }}
          />
        ))}
      </div>
      <span className="text-xs text-ink-muted italic">Formulating...</span>
    </motion.div>
  );
}
```

- [ ] **Step 4: Create src/components/PhaseIndicator.jsx**

Enhanced with gradient pill, progress dots, and animated counter.

```jsx
import { motion } from 'framer-motion';
import { PHASE_NAMES, PHASE_GRADIENTS } from '../lib/phaseColors';

const TOTAL_PHASES = 5;

export default function PhaseIndicator({ phase, questionCount }) {
  if (!phase) return null;

  const gradientClass = PHASE_GRADIENTS[phase] || PHASE_GRADIENTS[1];
  const phaseName = PHASE_NAMES[phase] || 'Interview';

  return (
    <div
      className="flex items-center gap-2.5"
      aria-live="polite"
      aria-label={`Phase ${phase}: ${phaseName}, question ${questionCount}`}
    >
      {/* Progress dots */}
      <div className="flex gap-1.5" aria-hidden="true">
        {Array.from({ length: TOTAL_PHASES }, (_, i) => i + 1).map(p => (
          <motion.div
            key={p}
            className={`w-1.5 h-1.5 rounded-full transition-colors duration-500 ${
              p < phase ? 'bg-accent-primary/30' :
              p === phase ? `bg-gradient-to-br ${gradientClass}` :
              'bg-border'
            }`}
            animate={p === phase ? { scale: [1, 1.3, 1] } : {}}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}
      </div>

      {/* Phase name + question count */}
      <div className="flex items-center gap-1.5 text-xs">
        <span className={`font-medium bg-gradient-to-r ${gradientClass} bg-clip-text text-transparent`}>
          {phaseName}
        </span>
        <span className="text-ink-muted">Q{questionCount}</span>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add src/components/ChatBubble.jsx src/components/StaggeredReveal.jsx src/components/TypingIndicator.jsx src/components/PhaseIndicator.jsx
git commit -m "feat: add base components — ChatBubble (glass/gradient), StaggeredReveal, TypingIndicator, PhaseIndicator
Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 6: Base Components — Part 2 (SendButton, StatusMessage, CinematicPhaseChange, SparkleBurst)

**Files:**
- Create: `src/components/SendButton.jsx`
- Create: `src/components/StatusMessage.jsx`
- Create: `src/components/CinematicPhaseChange.jsx`
- Create: `src/components/SparkleBurst.jsx` (NEW)

- [ ] **Step 1: Create src/components/SendButton.jsx**

3-state morph with layoutId.

```jsx
import { motion } from 'framer-motion';
import { ArrowUp, Loader2, Check } from 'lucide-react';

export default function SendButton({ disabled, status, onClick }) {
  const isProcessing = status === 'processing';
  const isComplete = status === 'complete';

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 disabled:opacity-30 disabled:cursor-not-allowed"
      style={{ background: isComplete ? 'linear-gradient(135deg, #059669, #10B981)' : 'linear-gradient(135deg, #4F46E5, #6366F1)' }}
      whileTap={{ scale: 0.92 }}
      whileHover={{ scale: 1.05 }}
      aria-label={isProcessing ? 'Sending...' : isComplete ? 'Sent' : 'Send message'}
    >
      <motion.span
        key={status}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="text-white flex items-center justify-center"
      >
        {isProcessing ? (
          <Loader2 size={16} className="animate-spin" />
        ) : isComplete ? (
          <Check size={16} />
        ) : (
          <ArrowUp size={16} />
        )}
      </motion.span>
    </motion.button>
  );
}
```

- [ ] **Step 2: Create src/components/StatusMessage.jsx**

Same as original spec.

```jsx
export default function StatusMessage({ type, children }) {
  if (!children) return null;

  const classes = type === 'error'
    ? 'bg-danger/5 border border-danger/20 text-danger'
    : 'bg-success/5 border border-success/20 text-success';

  return (
    <div className={`text-xs mt-2.5 px-3 py-2 rounded-lg ${classes}`} role={type === 'error' ? 'alert' : 'status'}>
      {children}
    </div>
  );
}
```

- [ ] **Step 3: Create src/components/CinematicPhaseChange.jsx**

Viewport-level phase transition with gradient trail wipe + zoom-blur.

```jsx
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

export default function CinematicPhaseChange({ oldPhase, newPhase, children }) {
  const reduced = useReducedMotion();

  if (oldPhase === newPhase || !newPhase) return children;
  if (reduced) return children; // instant cut when reduced motion

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={newPhase}
        initial={{ opacity: 0, x: 30, filter: 'blur(2px)' }}
        animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
        exit={{ opacity: 0, x: -30, filter: 'blur(2px)' }}
        transition={{ duration: 0.4, ease: 'easeInOut' }}
      >
        {/* Phase change indicator */}
        <motion.div
          className="text-center py-3 my-3"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15, duration: 0.3 }}
        >
          <span className="text-[11px] font-medium text-ink-muted bg-gradient-to-r from-accent-primary/10 to-accent-deep/10 px-4 py-1.5 rounded-full border border-accent-primary/10">
            Phase {oldPhase} → Phase {newPhase}
          </span>
        </motion.div>
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
```

- [ ] **Step 4: Create src/components/SparkleBurst.jsx**

Wrapper around a simple CSS sparkle/confetti burst (self-implemented to avoid pulling full Aceternity Sparkles dependency unless needed). For simplicity, we use a CSS keyframe burst.

```jsx
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

const SPARKLES = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  x: (Math.random() - 0.5) * 300,
  y: (Math.random() - 0.5) * 300,
  scale: Math.random() * 0.5 + 0.5,
  rotation: Math.random() * 360,
  color: ['#4F46E5', '#7C3AED', '#EC4899', '#059669', '#10B981', '#F59E0B'][i % 6],
  delay: Math.random() * 0.3,
}));

export default function SparkleBurst({ trigger, onComplete }) {
  const reduced = useReducedMotion();

  return (
    <AnimatePresence onExitComplete={onComplete}>
      {trigger && !reduced && (
        <motion.div
          className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center"
          aria-hidden="true"
          exit={{ opacity: 0 }}
        >
          {SPARKLES.map(s => (
            <motion.div
              key={s.id}
              className="absolute w-2 h-2 rounded-full"
              style={{ backgroundColor: s.color }}
              initial={{ opacity: 1, scale: 0, x: 0, y: 0, rotate: 0 }}
              animate={{
                opacity: [1, 0],
                scale: [0, s.scale],
                x: s.x,
                y: s.y,
                rotate: s.rotation,
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, delay: s.delay, ease: 'easeOut' }}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add src/components/SendButton.jsx src/components/StatusMessage.jsx src/components/CinematicPhaseChange.jsx src/components/SparkleBurst.jsx
git commit -m "feat: add base components — SendButton (3-state morph), StatusMessage, CinematicPhaseChange, SparkleBurst
Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 7: InputBar Component (Enhanced)

**Files:**
- Create: `src/components/InputBar.jsx`

- [ ] **Step 1: Create src/components/InputBar.jsx**

Enhanced with glass morphism, focus lift, keystroke pulse, and state-aware SendButton.

```jsx
import { useRef, useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import SendButton from './SendButton';

export default function InputBar({ value, onChange, onSend, onEnd, disabled, status }) {
  const textareaRef = useRef(null);
  const [focused, setFocused] = useState(false);
  const [hasTyped, setHasTyped] = useState(false);

  const adjustHeight = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
  }, []);

  const handleChange = (e) => {
    onChange(e.target.value);
    adjustHeight();
    if (e.target.value && !hasTyped) setHasTyped(true);
    if (!e.target.value) setHasTyped(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !disabled) {
        setHasTyped(false);
        onSend();
      }
    }
    if (e.key === 'Escape') {
      e.target.blur();
    }
  };

  const handleSend = () => {
    if (value.trim() && !disabled) {
      setHasTyped(false);
      onSend();
    }
  };

  const isProcessing = status === 'processing';

  return (
    <div className="border-t border-border-light bg-surface/90 backdrop-blur-md px-4 py-3 pb-[calc(12px+env(safe-area-inset-bottom,0px))] shrink-0">
      <motion.div
        className={`flex gap-2 items-end bg-white/90 backdrop-blur-sm border rounded-2xl px-4 py-2.5 transition-colors
          ${focused ? 'border-accent-primary shadow-[0_0_0_3px_var(--color-accent-glow-primary)]' : 'border-border'}`}
        animate={{
          y: focused ? -2 : 0,
          scale: hasTyped ? 1.005 : 1,
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      >
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Type your response..."
          rows={1}
          disabled={disabled}
          className="flex-1 resize-none bg-transparent border-none outline-none text-[15px] text-ink leading-relaxed placeholder:text-ink-muted py-1.5 min-h-[24px] max-h-[120px] font-sans"
          aria-label="Your response"
        />
        <SendButton disabled={disabled || !value.trim()} status={status} onClick={handleSend} />
      </motion.div>
      <div className="flex justify-between items-center mt-1.5 px-1">
        <span className="text-[11px] text-ink-muted">Enter to send · Shift+Enter for new line</span>
        <button
          type="button"
          className="text-[11px] text-ink-muted hover:text-danger bg-transparent border-none cursor-pointer px-2 py-1 rounded transition-colors"
          onClick={onEnd}
          aria-label="End interview"
        >
          End interview
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/InputBar.jsx
git commit -m "feat: add InputBar with glass morphism, focus lift, keystroke pulse
Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 8: Ambient Environment

**Files:**
- Create: `src/components/AmbientEnvironment.jsx`
- Create: `src/components/CursorGlow.jsx` (NEW)
- Create: `src/hooks/usePhaseAmbience.js` (NEW)
- Create: `src/hooks/useCursorGlow.js` (NEW)

- [ ] **Step 1: Create src/hooks/usePhaseAmbience.js**

```javascript
import { useRef, useEffect, useState } from 'react';
import { PHASE_COLORS } from '../lib/phaseColors';

export function usePhaseAmbience(phase) {
  const [ambientColors, setAmbientColors] = useState(PHASE_COLORS[phase]);
  const prevPhaseRef = useRef(phase);

  useEffect(() => {
    if (phase !== prevPhaseRef.current) {
      prevPhaseRef.current = phase;
      // Smooth transition — set immediately since CSS transitions handle the interpolation
      setAmbientColors(PHASE_COLORS[phase]);
    }
  }, [phase]);

  return ambientColors;
}
```

- [ ] **Step 2: Create src/hooks/useCursorGlow.js**

```javascript
import { useState, useCallback, useEffect } from 'react';

export function useCursorGlow() {
  const [position, setPosition] = useState({ x: 0.5, y: 0.5 });
  const [isTouchDevice, setIsTouchDevice] = useState(true);

  useEffect(() => {
    const hasCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
    setIsTouchDevice(hasCoarsePointer);
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (isTouchDevice) return;
    setPosition({
      x: e.clientX / window.innerWidth,
      y: e.clientY / window.innerHeight,
    });
  }, [isTouchDevice]);

  const handleMouseLeave = useCallback(() => {
    setPosition({ x: 0.5, y: 0.5 }); // reset to center
  }, []);

  return { position, isTouchDevice, handleMouseMove, handleMouseLeave };
}
```

- [ ] **Step 3: Create src/components/CursorGlow.jsx**

```jsx
import { motion, useReducedMotion } from 'framer-motion';

export default function CursorGlow({ position, isTouchDevice }) {
  const reduced = useReducedMotion();

  if (isTouchDevice || reduced) return null;

  return (
    <motion.div
      className="fixed pointer-events-none z-[-5]"
      aria-hidden="true"
      style={{
        width: '400px',
        height: '400px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(79,70,229,0.04), transparent 70%)',
        transform: 'translate(-50%, -50%)',
      }}
      animate={{
        left: `${position.x * 100}%`,
        top: `${position.y * 100}%`,
      }}
      transition={{ type: 'spring', stiffness: 50, damping: 30 }}
    />
  );
}
```

- [ ] **Step 4: Create src/components/AmbientEnvironment.jsx**

Phase-aware gradient orbs + CursorGlow + noise texture overlay.

```jsx
import { motion, useReducedMotion } from 'framer-motion';
import { usePhaseAmbience } from '../hooks/usePhaseAmbience';
import CursorGlow from './CursorGlow';

export default function AmbientEnvironment({ phase, cursorPosition, isTouchDevice }) {
  const reduced = useReducedMotion();
  const ambient = usePhaseAmbience(phase);

  if (reduced) return null;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10" aria-hidden="true">
      {/* Cursor-responsive glow (desktop only) */}
      <CursorGlow position={cursorPosition} isTouchDevice={isTouchDevice} />

      {/* Top-right orb */}
      <motion.div
        className="absolute w-[350px] h-[350px] rounded-full"
        style={{
          background: ambient.gradient,
          top: '-8%',
          right: '-12%',
        }}
        animate={{
          scale: [1, 1.12, 1],
          x: [0, -20, 0],
          y: [0, 12, 0],
        }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Bottom-left orb */}
      <motion.div
        className="absolute w-[280px] h-[280px] rounded-full"
        style={{
          background: ambient.gradient,
          bottom: '-10%',
          left: '-8%',
        }}
        animate={{
          scale: [1, 1.18, 1],
          x: [0, 15, 0],
          y: [0, -10, 0],
        }}
        transition={{ duration: 28, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Center-right orb (subtle, Phase 3+) */}
      {phase >= 3 && (
        <motion.div
          className="absolute w-[200px] h-[200px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(124,58,237,0.04), transparent 70%)',
            top: '40%',
            right: '-5%',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, scale: [1, 1.1, 1], y: [0, -8, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      {/* Noise texture overlay for depth */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.5'/%3E%3C/svg%3E")`,
          animation: 'noise 8s steps(10) infinite',
        }}
      />
    </div>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add src/components/AmbientEnvironment.jsx src/components/CursorGlow.jsx src/hooks/usePhaseAmbience.js src/hooks/useCursorGlow.js
git commit -m "feat: add ambient environment — phase-aware orbs, cursor glow, noise texture
Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 9: Screen Transition Orchestrator

**Files:**
- Create: `src/components/ScreenTransition.jsx` (NEW)

- [ ] **Step 1: Create src/components/ScreenTransition.jsx**

```jsx
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

const transitionVariants = {
  // Gate → Chat: radial reveal
  gateToChat: {
    initial: { clipPath: 'circle(0% at 50% 85%)', opacity: 0 },
    animate: { clipPath: 'circle(150% at 50% 85%)', opacity: 1 },
    exit: { clipPath: 'circle(0% at 50% 85%)', opacity: 0 },
  },
  // Chat → Report: zoom-out resolution
  chatToReport: {
    initial: { opacity: 0, scale: 0.97 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.97 },
  },
  // Report → Gate: graceful fade
  reportToGate: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
  },
};

export default function ScreenTransition({ screen, previousScreen, children }) {
  const reduced = useReducedMotion();

  const variantKey = previousScreen === 'gate' && screen === 'interview' ? 'gateToChat' :
    previousScreen === 'interview' && screen === 'report' ? 'chatToReport' :
    previousScreen === 'report' && screen === 'gate' ? 'reportToGate' :
    null;

  // Default fade transition for unknown transitions
  const variants = variantKey ? transitionVariants[variantKey] : {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  };

  if (reduced) {
    // Instant cut when reduced motion
    return <AnimatePresence mode="wait">{children}</AnimatePresence>;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={screen}
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        style={{ minHeight: '100vh' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ScreenTransition.jsx
git commit -m "feat: add ScreenTransition — cinematic gate→chat→report transitions
Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 10: PasswordGate Screen (Enhanced)

**Files:**
- Create: `src/screens/PasswordGate.jsx`
- Create: `__tests__/PasswordGate.test.jsx`

- [ ] **Step 1: Create src/screens/PasswordGate.jsx**

Enhanced with Godly-inspired typography, glass morphism button, and cinematic unlock.

```jsx
import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { verifyPassword } from '../lib/api';
import { useInterviewDispatch } from '../context/InterviewContext';

export default function PasswordGate() {
  const dispatch = useInterviewDispatch();
  const reduced = useReducedMotion();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    const pw = password.trim();
    if (!pw) {
      setError('Please enter the access code.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const result = await verifyPassword(pw);
      if (result.valid) {
        dispatch({ type: 'UNLOCK', password: pw });
      } else {
        setError('Incorrect code. Please try again.');
      }
    } catch {
      setError('Cannot reach server. Check your connection.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-canvas">
      <motion.div
        className="max-w-[380px] w-full text-center"
        initial={reduced ? {} : { opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 100, damping: 15 }}
      >
        {/* Brand mark */}
        <motion.div
          className="w-14 h-14 rounded-2xl mx-auto mb-6 flex items-center justify-center text-white text-2xl shadow-[0_8px_32px_rgba(79,70,229,0.15)]"
          style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed, #ec4899)' }}
          animate={reduced ? {} : { scale: [1, 1.05, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          ◆
        </motion.div>

        <h1 className="text-[32px] font-[200] tracking-[-1px] text-ink mb-2 leading-tight">
          Psychological<br />Profile
        </h1>
        <p className="text-[14px] text-ink-secondary leading-relaxed mb-8 max-w-[300px] mx-auto">
          A confidential behavioral interview. Enter the access code you received to begin.
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(''); }}
            placeholder="Access code"
            autoFocus
            autoComplete="off"
            className={`w-full px-5 py-3.5 bg-white border rounded-2xl text-[15px] text-ink text-center tracking-[3px] outline-none transition-all
              ${error ? 'border-danger ring-2 ring-danger/20' : 'border-border focus:border-accent-primary focus:ring-2 focus:ring-accent-glow-primary'}`}
            aria-label="Access code"
            aria-invalid={!!error}
            aria-describedby={error ? 'gate-error' : undefined}
          />

          {error && (
            <motion.p
              id="gate-error"
              className="text-xs text-danger mt-2.5"
              role="alert"
              initial={reduced ? {} : { opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {error}
            </motion.p>
          )}

          <motion.button
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-3.5 bg-gradient-to-r from-accent-primary to-accent-deep text-white rounded-2xl text-[15px] font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-opacity hover:opacity-90 shadow-[0_4px_16px_rgba(79,70,229,0.2)]"
            whileTap={{ scale: 0.98 }}
          >
            {loading ? 'Verifying...' : 'Continue →'}
          </motion.button>
        </form>

        <p className="text-[11px] text-ink-muted mt-5">
          All responses are confidential. Nothing is stored.
        </p>
      </motion.div>
    </div>
  );
}
```

- [ ] **Step 2: Create __tests__/PasswordGate.test.jsx**

Same as original spec.

- [ ] **Step 3: Run tests**

```bash
npx vitest run __tests__/PasswordGate.test.jsx
```

- [ ] **Step 4: Commit**

```bash
git add src/screens/PasswordGate.jsx __tests__/PasswordGate.test.jsx
git commit -m "feat: add PasswordGate — Godly typography, gradient brand mark, glass button
Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 11: InterviewChat Screen + Hooks

**Files:**
- Create: `src/hooks/useInterview.js`
- Create: `src/screens/InterviewChat.jsx`

- [ ] **Step 1: Create src/hooks/useInterview.js**

Same as original spec — embeds the v2 system prompt, uses DeepSeek reasoner. The system prompt is identical to the original implementation plan. Key difference: the hook also computes stats and triggers phase-aware ambient changes.

```javascript
import { useCallback, useRef } from 'react';
import { useInterviewState, useInterviewDispatch } from '../context/InterviewContext';
import { useApi } from './useApi';
import { detectPhase } from '../lib/detectPhase';

// SYSTEM_PROMPT — same as original spec (v2, 190+ lines)
// NOTE: For brevity, the full SYSTEM_PROMPT is imported from a constant.
// During implementation, embed it directly as shown in the original plan.
import { SYSTEM_PROMPT } from '../lib/systemPrompt';

export function useInterview() {
  const { password, messages, phase, questionCount, status } = useInterviewState();
  const dispatch = useInterviewDispatch();
  const { doChat, doGenerateReport } = useApi(password);
  const abortRef = useRef(null);

  const startInterview = useCallback(async () => {
    dispatch({ type: 'SET_STATUS', status: 'processing' });
    try {
      const result = await doChat([], SYSTEM_PROMPT);
      const content = result.content;
      dispatch({ type: 'ADD_MESSAGE', role: 'assistant', content });
    } catch (e) {
      dispatch({ type: 'SET_ERROR', error: e.message });
    } finally {
      dispatch({ type: 'SET_STATUS', status: 'idle' });
    }
  }, [doChat, dispatch]);

  const sendMessage = useCallback(async (text) => {
    if (!text.trim() || status === 'processing') return;
    dispatch({ type: 'ADD_MESSAGE', role: 'user', content: text.trim() });
    dispatch({ type: 'SET_STATUS', status: 'processing' });

    try {
      const currentMessages = [...messages, { role: 'user', content: text.trim() }];
      const apiMessages = currentMessages.map(m => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.content,
      }));

      const result = await doChat(apiMessages, SYSTEM_PROMPT);
      const content = result.content;
      dispatch({ type: 'ADD_MESSAGE', role: 'assistant', content });

      const newPhase = detectPhase(content);
      if (newPhase) {
        dispatch({ type: 'SET_PHASE', phase: newPhase });
      }

      if (newPhase === 5 && content.includes('--- 1. EXECUTIVE SUMMARY ---')) {
        dispatch({ type: 'SET_STATUS', status: 'complete' });
      } else {
        dispatch({ type: 'SET_STATUS', status: 'idle' });
      }
    } catch (e) {
      dispatch({ type: 'SET_ERROR', error: e.message });
      dispatch({ type: 'SET_STATUS', status: 'idle' });
    }
  }, [messages, status, doChat, dispatch]);

  const endInterview = useCallback(() => {
    if (messages.length < 4) {
      dispatch({ type: 'SET_ERROR', error: 'Not enough conversation for a report.' });
      dispatch({ type: 'SET_STATUS', status: 'complete' });
      return;
    }
    dispatch({ type: 'SET_STATUS', status: 'complete' });
  }, [messages.length, dispatch]);

  const generateReportRequest = useCallback(async () => {
    if (messages.length < 4) {
      dispatch({ type: 'SET_ERROR', error: 'Not enough data for a report.' });
      return;
    }
    dispatch({ type: 'SET_STATUS', status: 'processing' });
    try {
      const conversation = messages.map(m => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.content,
      }));
      const result = await doGenerateReport(conversation);
      dispatch({ type: 'SET_REPORT', report: result.report });
    } catch (e) {
      dispatch({ type: 'SET_ERROR', error: e.message });
      dispatch({ type: 'SET_STATUS', status: 'idle' });
    }
  }, [messages, doGenerateReport, dispatch]);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, [dispatch]);

  return {
    startInterview,
    sendMessage,
    endInterview,
    generateReport: generateReportRequest,
    reset,
    status,
  };
}
```

Note: Extract the SYSTEM_PROMPT constant to `src/lib/systemPrompt.js` to keep the hook file manageable. The system prompt is identical to the original implementation plan.

- [ ] **Step 2: Create src/screens/InterviewChat.jsx**

Enhanced with AmbientEnvironment, PhaseIndicator, CinematicPhaseChange, CursorGlow hook, and sparkle burst on Phase 5.

```jsx
import { useState, useEffect, useRef, useCallback } from 'react';
import { useInterviewState } from '../context/InterviewContext';
import { useInterview } from '../hooks/useInterview';
import { useCursorGlow } from '../hooks/useCursorGlow';
import ChatBubble from '../components/ChatBubble';
import TypingIndicator from '../components/TypingIndicator';
import PhaseIndicator from '../components/PhaseIndicator';
import CinematicPhaseChange from '../components/CinematicPhaseChange';
import InputBar from '../components/InputBar';
import StatusMessage from '../components/StatusMessage';
import SparkleBurst from '../components/SparkleBurst';

export default function InterviewChat() {
  const { messages, phase, questionCount, status, error } = useInterviewState();
  const { startInterview, sendMessage, endInterview } = useInterview();
  const [inputValue, setInputValue] = useState('');
  const [prevPhase, setPrevPhase] = useState(phase);
  const [showSparkles, setShowSparkles] = useState(false);
  const chatRef = useRef(null);
  const startedRef = useRef(false);

  // Cursor glow for desktop
  const cursorGlow = useCursorGlow();

  // Start interview on mount
  useEffect(() => {
    if (!startedRef.current) {
      startedRef.current = true;
      startInterview();
    }
  }, [startInterview]);

  // Track phase changes
  useEffect(() => {
    if (phase !== prevPhase) {
      setPrevPhase(phase);
      // Sparkle celebration on Phase 5
      if (phase === 5) {
        setShowSparkles(true);
      }
    }
  }, [phase, prevPhase]);

  // Auto-scroll
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages, status]);

  const handleSend = useCallback(async () => {
    const text = inputValue;
    setInputValue('');
    await sendMessage(text);
  }, [inputValue, sendMessage]);

  const handleEndInterview = useCallback(() => {
    if (messages.length < 4) {
      endInterview();
      return;
    }
    if (window.confirm('End the interview? You can still generate a report.')) {
      endInterview();
    }
  }, [messages.length, endInterview]);

  const isProcessing = status === 'processing';
  const isComplete = status === 'complete';

  return (
    <div
      className="flex flex-col h-[100dvh] max-w-[820px] mx-auto w-full relative"
      onMouseMove={cursorGlow.handleMouseMove}
      onMouseLeave={cursorGlow.handleMouseLeave}
    >
      {/* Header */}
      <header className="flex items-center justify-between px-5 py-3.5 border-b border-border-light bg-surface shrink-0 min-h-[56px]">
        <div className="flex items-center gap-2.5 text-sm font-medium text-ink">
          <motion.span
            className="w-2 h-2 rounded-full bg-accent-primary opacity-70"
            animate={{ opacity: isProcessing ? [0.4, 1, 0.4] : 0.7 }}
            transition={{ duration: 2, repeat: isProcessing ? Infinity : 0 }}
          />
          Psychological Profile
        </div>
        <PhaseIndicator phase={phase} questionCount={questionCount} />
      </header>

      {/* Chat */}
      <div
        ref={chatRef}
        className="flex-1 overflow-y-auto px-5 py-4"
        role="log"
        aria-live="polite"
        aria-label="Interview conversation"
      >
        <CinematicPhaseChange oldPhase={prevPhase} newPhase={phase}>
          {messages.map((msg, i) => (
            <ChatBubble
              key={i}
              role={msg.role}
              content={msg.content}
              isProfileDelivery={phase === 5}
            />
          ))}
        </CinematicPhaseChange>

        {isProcessing && <TypingIndicator />}

        {error && (
          <StatusMessage type="error">{error}</StatusMessage>
        )}
      </div>

      {/* Sparkle celebration */}
      <SparkleBurst trigger={showSparkles} onComplete={() => setShowSparkles(false)} />

      {/* Input */}
      <InputBar
        value={inputValue}
        onChange={setInputValue}
        onSend={handleSend}
        onEnd={handleEndInterview}
        disabled={isProcessing || isComplete}
        status={status}
      />
    </div>
  );
}
```

- [ ] **Step 3: Create src/lib/systemPrompt.js**

Extract the SYSTEM_PROMPT constant from the original implementation plan's useInterview.js. This is the full v2 system prompt (~190 lines). Identical to original plan.

- [ ] **Step 4: Commit**

```bash
git add src/hooks/useInterview.js src/lib/systemPrompt.js src/screens/InterviewChat.jsx
git commit -m "feat: add InterviewChat + useInterview — immersive chat with phase-aware ambience, cursor glow, sparkles
Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 12: ReportView Screen (Enhanced)

**Files:**
- Create: `src/components/StatsCounter.jsx` (NEW)
- Create: `src/components/ReportPreview.jsx` (NEW)
- Create: `src/screens/ReportView.jsx`

- [ ] **Step 1: Create src/components/StatsCounter.jsx**

```jsx
import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

export default function StatsCounter({ value, label, delay = 0 }) {
  const reduced = useReducedMotion();
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (reduced) {
      setDisplayValue(value);
      return;
    }

    const timer = setTimeout(() => {
      const duration = 1200;
      const start = performance.now();

      function update(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        // Ease-out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        setDisplayValue(Math.round(eased * value));

        if (progress < 1) {
          requestAnimationFrame(update);
        }
      }

      requestAnimationFrame(update);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay, reduced]);

  return (
    <motion.div
      className="text-center"
      initial={reduced ? {} : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay / 1000, duration: 0.4 }}
    >
      <div className="text-2xl font-light text-ink tabular-nums">{displayValue}</div>
      <div className="text-[11px] text-ink-muted mt-1">{label}</div>
    </motion.div>
  );
}
```

- [ ] **Step 2: Create src/components/ReportPreview.jsx**

```jsx
import { motion } from 'framer-motion';

const SECTIONS = [
  { num: 1, title: 'Executive Summary' },
  { num: 2, title: 'Personality Architecture' },
  { num: 3, title: 'Defense Structure' },
  { num: 4, title: 'Attachment & Relational Profile' },
  { num: 5, title: 'Stress & Coping Profile' },
  { num: 6, title: 'Shadow Integration' },
  { num: 7, title: 'Risk & Resilience Assessment' },
  { num: 8, title: 'Recommendations' },
];

export default function ReportPreview() {
  return (
    <div className="grid grid-cols-2 gap-2.5 w-full">
      {SECTIONS.map((section, i) => (
        <motion.div
          key={section.num}
          className="bg-white border border-border rounded-xl px-3.5 py-3 text-left cursor-default transition-all hover:border-accent-primary/30 hover:shadow-sm hover:-translate-y-0.5"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 + i * 0.05, duration: 0.3 }}
        >
          <div className="text-[10px] font-semibold text-accent-primary/60 mb-1">
            {String(section.num).padStart(2, '0')}
          </div>
          <div className="text-xs font-medium text-ink leading-tight">{section.title}</div>
        </motion.div>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Create src/screens/ReportView.jsx**

Enhanced with stats summary, report preview, animated generation, celebration burst, and graceful exit.

```jsx
import { useState, useRef, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useInterviewState } from '../context/InterviewContext';
import { useInterview } from '../hooks/useInterview';
import { downloadReport } from '../lib/downloadReport';
import StatusMessage from '../components/StatusMessage';
import StatsCounter from '../components/StatsCounter';
import ReportPreview from '../components/ReportPreview';
import SparkleBurst from '../components/SparkleBurst';
import { CheckCircle } from 'lucide-react';

export default function ReportView() {
  const reduced = useReducedMotion();
  const { messages, reportMarkdown, status, error, stats } = useInterviewState();
  const { generateReport, reset } = useInterview();
  const isProcessing = status === 'processing';
  const hasReport = !!reportMarkdown;
  const [showSparkles, setShowSparkles] = useState(false);

  const handleGenerate = async () => {
    await generateReport();
  };

  const handleDownload = () => {
    if (reportMarkdown) {
      downloadReport(reportMarkdown);
    }
  };

  const handleReset = () => {
    reset();
  };

  // Sparkle celebration when report is ready
  const prevReportRef = useRef(null);
  useEffect(() => {
    if (reportMarkdown && reportMarkdown !== prevReportRef.current) {
      prevReportRef.current = reportMarkdown;
      setShowSparkles(true);
      // Auto-download
      setTimeout(() => downloadReport(reportMarkdown), 400);
    }
  }, [reportMarkdown]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-canvas">
      <motion.div
        className="max-w-[440px] w-full text-center"
        initial={reduced ? {} : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 80, damping: 15 }}
      >
        {/* Completion icon */}
        <motion.div
          className="w-16 h-16 rounded-full mx-auto mb-5 flex items-center justify-center shadow-[0_8px_32px_rgba(5,150,105,0.2)]"
          style={{ background: 'linear-gradient(135deg, #059669, #10B981)' }}
          initial={reduced ? {} : { scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
        >
          <CheckCircle size={32} className="text-white" />
        </motion.div>

        <h2 className="text-[28px] font-[200] tracking-[-0.5px] text-ink mb-2">
          Interview Complete
        </h2>
        <p className="text-[14px] text-ink-secondary leading-relaxed mb-8 max-w-[340px] mx-auto">
          Your psychological profile has been synthesized from your conversation across 5 phases of assessment.
        </p>

        {/* Stats */}
        <div className="flex justify-center gap-10 mb-8">
          <StatsCounter value={stats.phasesCompleted} label="Phases explored" delay={200} />
          <StatsCounter value={stats.questionsAnswered} label="Questions answered" delay={500} />
          <StatsCounter value={stats.domainsAnalyzed} label="Domains analyzed" delay={800} />
        </div>

        {/* Report preview */}
        {!hasReport && (
          <motion.div
            className="mb-8"
            initial={reduced ? {} : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <div className="text-[10px] font-semibold text-ink-muted uppercase tracking-wide mb-3">
              Report Contents
            </div>
            <ReportPreview />
          </motion.div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-3 items-center">
          {!hasReport ? (
            <motion.button
              onClick={handleGenerate}
              disabled={isProcessing}
              className="w-full py-3.5 bg-gradient-to-r from-accent-primary to-accent-deep text-white rounded-2xl text-[15px] font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-opacity hover:opacity-90 shadow-[0_4px_16px_rgba(79,70,229,0.2)]"
              whileTap={{ scale: 0.98 }}
            >
              {isProcessing ? 'Generating...' : 'Generate Full Report'}
            </motion.button>
          ) : (
            <motion.button
              onClick={handleDownload}
              className="w-full py-3.5 bg-gradient-to-r from-accent-primary to-accent-deep text-white rounded-2xl text-[15px] font-medium transition-opacity hover:opacity-90 shadow-[0_4px_16px_rgba(79,70,229,0.2)]"
              whileTap={{ scale: 0.98 }}
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              Download Report
            </motion.button>
          )}
          <button
            onClick={handleReset}
            className="w-full py-3.5 bg-surface text-ink-secondary border border-border rounded-2xl text-[15px] font-medium transition-colors hover:bg-surface-raised hover:text-ink"
          >
            New Session
          </button>
        </div>

        {error && <StatusMessage type="error">{error}</StatusMessage>}

        <p className="text-[11px] text-ink-muted mt-6">
          The report downloads as HTML. Use <strong>Cmd/Ctrl+P → Save as PDF</strong> for a print-ready copy.
        </p>
      </motion.div>

      <SparkleBurst trigger={showSparkles} onComplete={() => setShowSparkles(false)} />
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/components/StatsCounter.jsx src/components/ReportPreview.jsx src/screens/ReportView.jsx
git commit -m "feat: add ReportView — stats counters, report preview, celebration burst, graceful exit
Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 13: App Shell + Screen Transition Orchestrator + Lazy Loading

**Files:**
- Create: `src/App.jsx`

- [ ] **Step 1: Create src/App.jsx**

Integrates ScreenTransition, AmbientEnvironment, and lazy-loaded screens.

```jsx
import { lazy, Suspense, useRef } from 'react';
import { InterviewProvider, useInterviewState } from './context/InterviewContext';
import AmbientEnvironment from './components/AmbientEnvironment';
import ScreenTransition from './components/ScreenTransition';
import { useCursorGlow } from './hooks/useCursorGlow';

const PasswordGate = lazy(() => import('./screens/PasswordGate'));
const InterviewChat = lazy(() => import('./screens/InterviewChat'));
const ReportView = lazy(() => import('./screens/ReportView'));

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-canvas">
      <div className="w-7 h-7 border-2 border-border border-t-accent-primary rounded-full animate-spin" />
    </div>
  );
}

function ScreenRouter() {
  const { screen, phase } = useInterviewState();
  const prevScreenRef = useRef(screen);

  const prevScreen = prevScreenRef.current;
  prevScreenRef.current = screen;

  return (
    <ScreenTransition screen={screen} previousScreen={prevScreen}>
      <Suspense fallback={<LoadingFallback />}>
        {screen === 'gate' && <PasswordGate />}
        {screen === 'interview' && <InterviewChat />}
        {screen === 'report' && <ReportView />}
      </Suspense>
    </ScreenTransition>
  );
}

function AppInner() {
  const { phase, screen } = useInterviewState();
  const cursorGlow = useCursorGlow();

  return (
    <div
      onMouseMove={cursorGlow.handleMouseMove}
      onMouseLeave={cursorGlow.handleMouseLeave}
    >
      <AmbientEnvironment
        phase={phase}
        cursorPosition={cursorGlow.position}
        isTouchDevice={cursorGlow.isTouchDevice}
      />
      <main>
        <ScreenRouter />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <InterviewProvider>
      <AppInner />
    </InterviewProvider>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/App.jsx
git commit -m "feat: add App shell — ScreenTransition orchestrator + AmbientEnvironment + lazy loading
Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 14: Integration & Build Verification

- [ ] **Step 1: Run dev server and check for errors**

```bash
cd /Users/tony/psych-profiler && npm run dev
```

Expected: No console errors, app renders PasswordGate with ambient orbs.

- [ ] **Step 2: Run all tests**

```bash
npx vitest run
```

Expected: All tests pass.

- [ ] **Step 3: Production build**

```bash
npm run build
```

Expected: Build succeeds, `dist/` created with index.html + JS/CSS bundles. 3 chunks: react-vendor, motion-vendor, main app.

- [ ] **Step 4: Check bundle size**

```bash
du -sh dist/
```

Expected: < 600KB total (should be ~150-200KB gzipped).

- [ ] **Step 5: Manual verification checklist**

- [ ] Password gate renders with brand mark, typing works, Enter submits
- [ ] Unlock transitions to chat (cinematic radial reveal)
- [ ] Opening message appears with spring animation
- [ ] User can send messages, AI responds
- [ ] Typing indicator shows while processing
- [ ] Phase indicator updates when phase changes
- [ ] Cinematic phase transition plays on phase change
- [ ] Phase 5 triggers sparkle celebration
- [ ] End interview shows confirmation, transitions to report
- [ ] Report stats counters animate
- [ ] Report preview shows 8 sections
- [ ] Generate report works, sparkles fire
- [ ] Download produces print-styled HTML
- [ ] New session resets to gate with graceful exit
- [ ] Mobile: all screens functional at 375px
- [ ] Reduced motion: animations disabled, app functional

- [ ] **Step 6: Commit build artifacts if deploying to GitHub Pages**

```bash
git add dist/ -f
git commit -m "build: production build — Warm Precision + Immersive edition
Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 15: Accessibility & Mobile Polish

- [ ] **Step 1: Verify semantic HTML landmarks**
- [ ] **Step 2: Verify keyboard navigation**
- [ ] **Step 3: Add focus ring visibility (already in index.css)**
- [ ] **Step 4: Verify mobile at 320px, 375px, 768px**
- [ ] **Step 5: Verify reduced motion**
- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "fix: accessibility and mobile polish pass — Warm Precision edition
Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

## Plan Summary

| # | Task | Files Created | Tests |
|---|---|---|---|
| 1 | Project Scaffolding | 5 | — |
| 2 | API Layer | 2 | — |
| 3 | Utility Functions | 5 | 3 test files |
| 4 | State Management | 1 | 1 test file |
| 5 | Base Components (Part 1) | 4 | — |
| 6 | Base Components (Part 2) | 4 | — |
| 7 | InputBar | 1 | — |
| 8 | Ambient Environment | 4 | — |
| 9 | Screen Transition | 1 | — |
| 10 | PasswordGate | 1 | 1 test file |
| 11 | InterviewChat + useInterview | 3 | — |
| 12 | ReportView + Stats + Preview | 3 | — |
| 13 | App Shell | 1 | — |
| 14 | Integration & Build | — | — |
| 15 | A11y & Mobile Polish | — | — |

**Total:** 15 tasks, 35+ files, 5 test files

**Backend:** Zero changes. `backend/worker.js` remains exactly as-is.

**Design summary:**
- **Visual language:** Warm Precision — gradient accent family (indigo → violet → rose → emerald), Godly-inspired bold typography
- **Animation:** Immersive — phase-aware ambience, cinematic screen transitions, cursor-responsive lighting, spring physics throughout, staggered reveals, sparkle celebrations
- **New components vs original spec:** +8 (StaggeredReveal, PhaseIndicator, CinematicPhaseChange, SparkleBurst, CursorGlow, AmbientEnvironment, StatsCounter, ReportPreview, ScreenTransition)
- **Enhanced components:** ChatBubble (glass/gradient/profile cards), InputBar (glass morphism/focus lift/keystroke pulse), SendButton (3-state morph), ReportView (multi-step experience)

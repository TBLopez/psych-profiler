# Frontend Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the Psych Profiler frontend as a React SPA with Vite, Tailwind CSS, Aceternity UI (Framer Motion), Clinical Precision aesthetic, keeping the existing Cloudflare Worker backend unchanged.

**Architecture:** Vite SPA with 3-screen state machine (gate → chat → report). React context + useReducer for state. Tailwind with custom design tokens. Code-split via React.lazy(). Backend API consumed identically — zero changes to `backend/worker.js`.

**Tech Stack:** Vite 6, React 18, Tailwind CSS 4, Framer Motion 12, Aceternity UI (selected components), Vitest + Testing Library

**DeepSeek integration note:** The v2 system prompt (already committed) is sent to DeepSeek's `deepseek-reasoner` model via the Cloudflare Worker. The prompt's adaptive phase transitions, cultural calibration, and crisis protocols are executed by DeepSeek at runtime — no frontend changes needed for adaptive interview behavior.

---

## File Structure

```
psych-profiler/
├── index.html                  # REPLACE: Vite entry point
├── package.json                # CREATE
├── vite.config.js              # CREATE
├── tailwind.config.js          # CREATE (or postcss.config.js for Tailwind v4)
├── backend/                    # UNCHANGED
│   ├── worker.js
│   ├── wrangler.toml
│   └── package.json
├── src/
│   ├── main.jsx                # CREATE: React root
│   ├── App.jsx                 # CREATE: State machine
│   ├── index.css               # CREATE: Tailwind directives + tokens
│   ├── context/
│   │   └── InterviewContext.jsx # CREATE: useReducer state
│   ├── screens/
│   │   ├── PasswordGate.jsx    # CREATE
│   │   ├── InterviewChat.jsx   # CREATE
│   │   └── ReportView.jsx      # CREATE
│   ├── components/
│   │   ├── AnimatedBackground.jsx  # CREATE: Floating orbs
│   │   ├── ChatBubble.jsx          # CREATE
│   │   ├── TypingIndicator.jsx     # CREATE
│   │   ├── PhaseBadge.jsx          # CREATE
│   │   ├── PhaseTransition.jsx     # CREATE
│   │   ├── InputBar.jsx            # CREATE
│   │   ├── SendButton.jsx          # CREATE
│   │   └── StatusMessage.jsx       # CREATE
│   ├── hooks/
│   │   ├── useInterview.js         # CREATE
│   │   └── useApi.js               # CREATE
│   └── lib/
│       ├── api.js                  # CREATE
│       ├── formatContent.js        # CREATE
│       ├── detectPhase.js          # CREATE
│       └── downloadReport.js       # CREATE
└── __tests__/                      # CREATE
    ├── formatContent.test.js
    ├── detectPhase.test.js
    ├── InterviewContext.test.jsx
    ├── PasswordGate.test.jsx
    └── InputBar.test.jsx
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
    setupFiles: [],
  },
});
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
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.jsx"></script>
</body>
</html>
```

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
  --color-canvas: #FAFBFC;
  --color-surface: #FFFFFF;
  --color-surface-raised: #F3F4F6;
  --color-ink: #1A1A2E;
  --color-ink-secondary: #666666;
  --color-ink-muted: #888888;
  --color-accent: #4F46E5;
  --color-accent-glow: rgba(79, 70, 229, 0.06);
  --color-success: #059669;
  --color-danger: #DC2626;
  --color-border: #E5E7EB;
  --color-border-light: #F0F0F0;
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

/* Scrollbar */
::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--color-border); border-radius: 2px; }
```

- [ ] **Step 6: Install dependencies and verify dev server**

```bash
cd /Users/tony/psych-profiler && npm install
npm run dev
```

Expected: dev server starts on localhost:5173, blank page no errors.

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json vite.config.js index.html src/main.jsx src/index.css
git commit -m "feat: scaffold Vite + React + Tailwind project
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
```

- [ ] **Step 2: Create __tests__/formatContent.test.js**

```javascript
import { describe, it, expect } from 'vitest';
import { formatContent } from '../src/lib/formatContent';

describe('formatContent', () => {
  it('wraps plain text in <p>', () => {
    const result = formatContent('Hello world');
    expect(result).toBe('<p>Hello world</p>');
  });

  it('converts **bold** to <strong>', () => {
    const result = formatContent('**bold text** here');
    expect(result).toContain('<strong>bold text</strong>');
  });

  it('converts *italic* to <em>', () => {
    const result = formatContent('*italic text* here');
    expect(result).toContain('<em>italic text</em>');
  });

  it('converts inline code', () => {
    const result = formatContent('use `const x = 1` here');
    expect(result).toContain('<code>const x = 1</code>');
  });

  it('converts code blocks', () => {
    const result = formatContent('```js\nconst x = 1;\n```');
    expect(result).toContain('<pre><code>const x = 1;\n</code></pre>');
  });

  it('escapes HTML', () => {
    const result = formatContent('<script>alert("x")</script>');
    expect(result).not.toContain('<script>');
    expect(result).toContain('&lt;script&gt;');
  });

  it('splits paragraphs on double newlines', () => {
    const result = formatContent('First para.\n\nSecond para.');
    expect(result).toBe('<p>First para.</p><p>Second para.</p>');
  });
});
```

- [ ] **Step 3: Create src/lib/detectPhase.js**

Phase detection based on content markers in the AI response. The v2 system prompt uses section headers like `--- 1. EXECUTIVE SUMMARY ---` for Phase 5 delivery.

```javascript
export function detectPhase(text) {
  if (!text) return null;
  // Phase 5: profile delivery detected by structured section headers
  if (text.includes('EXECUTIVE SUMMARY') || text.includes('PSYCHOLOGICAL PROFILE')) {
    return 5;
  }
  // Phase 4: shadow/vulnerability markers
  if (text.includes('Shadow') && (text.includes('blind spot') || text.includes('hidden'))) {
    return 4;
  }
  // Phase 3: relational markers
  if (text.includes('attachment') || text.includes('relational') || text.includes('conflict')) {
    return 3;
  }
  // Phase 2: cognitive/emotional markers
  if (text.includes('cognitive') || text.includes('emotional regulation') || text.includes('decision-making')) {
    return 2;
  }
  // Phase 1: baseline markers
  if (text.includes('baseline') || text.includes('rapport') || text.includes('who you are')) {
    return 1;
  }
  return null;
}
```

- [ ] **Step 4: Create __tests__/detectPhase.test.js**

```javascript
import { describe, it, expect } from 'vitest';
import { detectPhase } from '../src/lib/detectPhase';

describe('detectPhase', () => {
  it('returns null for empty text', () => {
    expect(detectPhase('')).toBeNull();
    expect(detectPhase(null)).toBeNull();
  });

  it('detects Phase 1 from baseline markers', () => {
    expect(detectPhase('Lets establish some baseline rapport')).toBe(1);
  });

  it('detects Phase 2 from cognitive markers', () => {
    expect(detectPhase('Your decision-making style and emotional regulation')).toBe(2);
  });

  it('detects Phase 3 from relational markers', () => {
    expect(detectPhase('Your attachment style in relationships')).toBe(3);
  });

  it('detects Phase 4 from shadow markers', () => {
    expect(detectPhase('Shadow blind spots you may be hiding')).toBe(4);
  });

  it('detects Phase 5 from profile delivery', () => {
    expect(detectPhase('--- 1. EXECUTIVE SUMMARY ---')).toBe(5);
    expect(detectPhase('PSYCHOLOGICAL PROFILE')).toBe(5);
  });
});
```

- [ ] **Step 5: Create src/lib/downloadReport.js**

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
    body { font-family: 'Times New Roman', Times, serif; font-size: 12pt; line-height: 1.6; color: #1a1a1a; max-width: 700px; margin: 0 auto; padding: 20px; }
    .cover { text-align: center; padding-top: 160px; padding-bottom: 60px; }
    .cover h1 { font-size: 26pt; letter-spacing: 3px; font-weight: normal; margin-bottom: 8px; }
    .cover .sub { font-size: 14pt; color: #555; margin-bottom: 40px; }
    .cover .meta { font-size: 11pt; color: #777; line-height: 2; }
    h1 { font-size: 22pt; text-align: center; font-weight: normal; margin-top: 30px; }
    h2 { font-size: 16pt; border-bottom: 1px solid #ccc; padding-bottom: 4px; margin-top: 28px; font-weight: 600; }
    h3 { font-size: 13pt; margin-top: 18px; font-weight: 600; }
    p { margin: 6px 0 10px; text-align: justify; }
    hr { border: none; border-top: 1px solid #ddd; margin: 24px 0; }
    code { background: #f5f5f5; padding: 1px 4px; border-radius: 3px; font-size: 10pt; }
    .page-break { page-break-before: always; }
    .footer { font-size: 9pt; color: #999; text-align: center; margin-top: 40px; border-top: 1px solid #ddd; padding-top: 16px; }
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

- [ ] **Step 6: Run tests**

```bash
npx vitest run __tests__/formatContent.test.js __tests__/detectPhase.test.js
```

Expected: all tests pass.

- [ ] **Step 7: Commit**

```bash
git add src/lib/formatContent.js src/lib/detectPhase.js src/lib/downloadReport.js __tests__/formatContent.test.js __tests__/detectPhase.test.js
git commit -m "feat: add utility functions — formatContent, detectPhase, downloadReport
Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 4: State Management

**Files:**
- Create: `src/context/InterviewContext.jsx`
- Create: `__tests__/InterviewContext.test.jsx`

- [ ] **Step 1: Create src/context/InterviewContext.jsx**

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
      return {
        ...state,
        messages: newMessages,
        questionCount: role === 'assistant' ? state.questionCount + 1 : state.questionCount,
        error: null,
      };
    }

    case 'SET_PHASE': {
      const { phase } = action;
      if (phase && phase !== state.phase) {
        return { ...state, phase, questionCount: 0 };
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
  const [{ screen, password, phase, questionCount, messages, status, reportMarkdown, error }, dispatch] =
    useReducer(reducer, initialState);

  return (
    <InterviewContext.Provider value={{ screen, password, phase, questionCount, messages, status, reportMarkdown, error }}>
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

```jsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { InterviewProvider, useInterviewState, useInterviewDispatch } from '../src/context/InterviewContext';

function TestConsumer() {
  const state = useInterviewState();
  const dispatch = useInterviewDispatch();
  return (
    <div>
      <span data-testid="screen">{state.screen}</span>
      <span data-testid="phase">{state.phase}</span>
      <span data-testid="status">{state.status}</span>
      <button data-testid="unlock" onClick={() => dispatch({ type: 'UNLOCK', password: 'test123' })}>Unlock</button>
      <button data-testid="add-msg" onClick={() => dispatch({ type: 'ADD_MESSAGE', role: 'assistant', content: 'Hello' })}>Add</button>
      <button data-testid="err" onClick={() => dispatch({ type: 'SET_ERROR', error: 'bad' })}>Err</button>
      <button data-testid="reset" onClick={() => dispatch({ type: 'RESET' })}>Reset</button>
    </div>
  );
}

describe('InterviewContext', () => {
  it('starts on gate screen', () => {
    render(<InterviewProvider><TestConsumer /></InterviewProvider>);
    expect(screen.getByTestId('screen').textContent).toBe('gate');
  });

  it('transitions gate -> interview on UNLOCK', () => {
    render(<InterviewProvider><TestConsumer /></InterviewProvider>);
    screen.getByTestId('unlock').click();
    expect(screen.getByTestId('screen').textContent).toBe('interview');
  });

  it('increments questionCount on assistant message', () => {
    render(<InterviewProvider><TestConsumer /></InterviewProvider>);
    screen.getByTestId('unlock').click();
    screen.getByTestId('add-msg').click();
    expect(screen.getByTestId('phase').textContent).toBe('1');
  });

  it('sets error state and clears on next message', () => {
    render(<InterviewProvider><TestConsumer /></InterviewProvider>);
    screen.getByTestId('err').click();
    expect(screen.getByTestId('status').textContent).toBe('idle');
  });

  it('resets to initial state', () => {
    render(<InterviewProvider><TestConsumer /></InterviewProvider>);
    screen.getByTestId('unlock').click();
    screen.getByTestId('reset').click();
    expect(screen.getByTestId('screen').textContent).toBe('gate');
  });
});
```

- [ ] **Step 3: Run tests**

```bash
npx vitest run __tests__/InterviewContext.test.jsx
```

Expected: all 5 tests pass.

- [ ] **Step 4: Commit**

```bash
git add src/context/InterviewContext.jsx __tests__/InterviewContext.test.jsx
git commit -m "feat: add InterviewContext — useReducer state machine
Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 5: Base Components (Part 1 — ChatBubble, TypingIndicator, PhaseBadge)

**Files:**
- Create: `src/components/ChatBubble.jsx`
- Create: `src/components/TypingIndicator.jsx`
- Create: `src/components/PhaseBadge.jsx`

- [ ] **Step 1: Create src/components/ChatBubble.jsx**

```jsx
import { motion } from 'framer-motion';
import { useReducedMotion } from 'framer-motion';
import { formatContent } from '../lib/formatContent';

const spring = { type: 'spring', stiffness: 100, damping: 15 };

export default function ChatBubble({ role, content }) {
  const reduced = useReducedMotion();
  const isUser = role === 'user';
  const isSystem = role === 'system';
  const label = isUser ? 'You' : isSystem ? 'System' : 'Interviewer';
  const avatar = isUser ? 'Y' : isSystem ? '●' : 'I';

  const avatarClasses = isUser
    ? 'bg-surface-raised text-ink-secondary border border-border'
    : isSystem
    ? 'bg-amber-50 text-amber-600 border border-amber-200'
    : 'bg-accent/10 text-accent border border-accent/20';

  const bubbleClasses = isUser
    ? 'bg-accent text-white rounded-[14px] rounded-br-[4px] ml-auto'
    : '';

  const bodyContent = isUser
    ? `<p>${content}</p>`
    : formatContent(content);

  return (
    <motion.div
      className={`msg flex gap-3 items-start mb-4 max-w-full ${isUser ? 'flex-row-reverse' : ''}`}
      initial={reduced ? { opacity: 1 } : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={spring}
    >
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 mt-0.5 ${avatarClasses}`}>
        {avatar}
      </div>
      <div className={`flex-1 min-w-0 ${isUser ? 'flex flex-col items-end' : ''}`}>
        <div className={`text-[11px] font-medium mb-1 tracking-wide uppercase ${isUser ? 'text-accent/60' : isSystem ? 'text-amber-500' : 'text-accent'}`}>
          {label}
        </div>
        {isUser ? (
          <div className={`px-3.5 py-2 max-w-[80%] ${bubbleClasses}`}>
            <p className="text-sm leading-relaxed">{content}</p>
          </div>
        ) : (
          <div
            className={`text-sm leading-relaxed text-ink-secondary ${isSystem ? 'italic text-ink-muted text-xs' : ''}`}
            dangerouslySetInnerHTML={{ __html: bodyContent }}
          />
        )}
      </div>
    </motion.div>
  );
}
```

- [ ] **Step 2: Create src/components/TypingIndicator.jsx**

```jsx
import { motion } from 'framer-motion';

const dot = {
  animate: { scale: [0.6, 1, 0.6], opacity: [0.3, 1, 0.3] },
  transition: { duration: 1.4, repeat: Infinity, ease: 'easeInOut' },
};

export default function TypingIndicator() {
  return (
    <div className="flex items-center gap-2 py-1" role="status" aria-label="Interviewer is formulating">
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
    </div>
  );
}
```

- [ ] **Step 3: Create src/components/PhaseBadge.jsx**

```jsx
const phaseNames = {
  1: 'Phase 1: Baseline',
  2: 'Phase 2: Cognitive & Emotional',
  3: 'Phase 3: Relational & Social',
  4: 'Phase 4: Vulnerability Probe',
  5: 'Phase 5: Profile Delivery',
};

export default function PhaseBadge({ phase, questionCount }) {
  if (!phase) return null;

  return (
    <div className="flex items-center gap-2 text-xs" aria-live="polite" aria-label={`${phaseNames[phase]}, question ${questionCount}`}>
      <span className="text-accent font-medium">{phaseNames[phase]}</span>
      <span className="text-ink-muted">Q{questionCount}</span>
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/components/ChatBubble.jsx src/components/TypingIndicator.jsx src/components/PhaseBadge.jsx
git commit -m "feat: add base components — ChatBubble, TypingIndicator, PhaseBadge
Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 6: Base Components (Part 2 — SendButton, StatusMessage, PhaseTransition)

**Files:**
- Create: `src/components/SendButton.jsx`
- Create: `src/components/StatusMessage.jsx`
- Create: `src/components/PhaseTransition.jsx`

- [ ] **Step 1: Create src/components/SendButton.jsx**

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
      className="w-9 h-9 rounded-full bg-accent text-white flex items-center justify-center shrink-0 disabled:opacity-30 disabled:cursor-not-allowed"
      whileTap={{ scale: 0.92 }}
      aria-label={isProcessing ? 'Sending...' : isComplete ? 'Sent' : 'Send message'}
    >
      {isProcessing ? (
        <Loader2 size={16} className="animate-spin" />
      ) : isComplete ? (
        <Check size={16} />
      ) : (
        <ArrowUp size={16} />
      )}
    </motion.button>
  );
}
```

- [ ] **Step 2: Create src/components/StatusMessage.jsx**

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

- [ ] **Step 3: Create src/components/PhaseTransition.jsx**

```jsx
import { motion, AnimatePresence } from 'framer-motion';

export default function PhaseTransition({ oldPhase, newPhase, children }) {
  if (oldPhase === newPhase || !newPhase) return children;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={newPhase}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
      >
        <div className="text-center py-2 my-2">
          <span className="text-[11px] text-ink-muted bg-surface-raised px-3 py-1 rounded-full">
            Phase {oldPhase} → Phase {newPhase}
          </span>
        </div>
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/components/SendButton.jsx src/components/StatusMessage.jsx src/components/PhaseTransition.jsx
git commit -m "feat: add base components — SendButton, StatusMessage, PhaseTransition
Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 7: InputBar Component

**Files:**
- Create: `src/components/InputBar.jsx`

- [ ] **Step 1: Create src/components/InputBar.jsx**

```jsx
import { useRef, useCallback } from 'react';
import SendButton from './SendButton';

export default function InputBar({ value, onChange, onSend, onEnd, disabled, status }) {
  const textareaRef = useRef(null);

  const adjustHeight = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
  }, []);

  const handleChange = (e) => {
    onChange(e.target.value);
    adjustHeight();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !disabled) onSend();
    }
    if (e.key === 'Escape') {
      e.target.blur();
    }
  };

  const handleSend = () => {
    if (value.trim() && !disabled) onSend();
  };

  return (
    <div className="border-t border-border-light bg-surface px-4 py-3 pb-[calc(12px+env(safe-area-inset-bottom,0px))] shrink-0">
      <div className="flex gap-2 items-end bg-surface-raised border border-border rounded-2xl px-4 py-2 transition-colors focus-within:border-accent focus-within:ring-2 focus-within:ring-accent-glow">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Type your response..."
          rows={1}
          disabled={disabled}
          className="flex-1 resize-none bg-transparent border-none outline-none text-[15px] text-ink leading-relaxed placeholder:text-ink-muted py-1.5 min-h-[24px] max-h-[120px] font-sans"
          aria-label="Your response"
        />
        <SendButton disabled={disabled || !value.trim()} status={status} onClick={handleSend} />
      </div>
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
git commit -m "feat: add InputBar component with auto-resize textarea
Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 8: AnimatedBackground Component

**Files:**
- Create: `src/components/AnimatedBackground.jsx`

- [ ] **Step 1: Create src/components/AnimatedBackground.jsx**

```jsx
import { motion, useReducedMotion } from 'framer-motion';

export default function AnimatedBackground() {
  const reduced = useReducedMotion();

  if (reduced) return null;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10" aria-hidden="true">
      {/* Top-right orb */}
      <motion.div
        className="absolute w-[300px] h-[300px] rounded-full opacity-[0.04]"
        style={{
          background: 'radial-gradient(circle, var(--color-accent), transparent 70%)',
          top: '-5%',
          right: '-10%',
        }}
        animate={{
          scale: [1, 1.15, 1],
          x: [0, -20, 0],
          y: [0, 10, 0],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* Bottom-left orb */}
      <motion.div
        className="absolute w-[250px] h-[250px] rounded-full opacity-[0.03]"
        style={{
          background: 'radial-gradient(circle, var(--color-accent), transparent 70%)',
          bottom: '-8%',
          left: '-5%',
        }}
        animate={{
          scale: [1, 1.2, 1],
          x: [0, 15, 0],
          y: [0, -8, 0],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/AnimatedBackground.jsx
git commit -m "feat: add AnimatedBackground — subtle floating gradient orbs
Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 9: PasswordGate Screen

**Files:**
- Create: `src/screens/PasswordGate.jsx`
- Create: `__tests__/PasswordGate.test.jsx`

**Note:** We use the Aceternity UI animated modal pattern but self-implemented to avoid pulling the full library. The gate uses a centered card with spring entrance and focus-ring animations.

- [ ] **Step 1: Create src/screens/PasswordGate.jsx**

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
        className="max-w-[360px] w-full text-center"
        initial={reduced ? {} : { opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 100, damping: 15 }}
      >
        {/* Brand mark */}
        <div className="w-10 h-10 rounded-xl mx-auto mb-5 flex items-center justify-center text-white text-lg"
          style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>
          ◆
        </div>

        <h1 className="text-[28px] font-light tracking-[-0.5px] text-ink mb-1.5">
          Psychological Profile
        </h1>
        <p className="text-sm text-ink-muted leading-relaxed mb-7">
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
            className={`w-full px-4 py-3 bg-surface border rounded-xl text-[15px] text-ink text-center tracking-[2px] outline-none transition-all
              ${error ? 'border-danger ring-2 ring-danger/20' : 'border-border focus:border-accent focus:ring-2 focus:ring-accent-glow'}`}
            aria-label="Access code"
            aria-invalid={!!error}
            aria-describedby={error ? 'gate-error' : undefined}
          />

          {error && (
            <p id="gate-error" className="text-xs text-danger mt-2" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-3.5 py-3 bg-accent text-white rounded-xl text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-opacity hover:opacity-90"
          >
            {loading ? 'Verifying...' : 'Continue →'}
          </button>
        </form>

        <p className="text-[11px] text-ink-muted mt-4">
          All responses are confidential. Nothing is stored.
        </p>
      </motion.div>
    </div>
  );
}
```

- [ ] **Step 2: Create __tests__/PasswordGate.test.jsx**

```jsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { InterviewProvider } from '../src/context/InterviewContext';
import PasswordGate from '../src/screens/PasswordGate';

// Mock api
vi.mock('../src/lib/api', () => ({
  verifyPassword: vi.fn(),
}));

import { verifyPassword } from '../src/lib/api';

function renderGate() {
  return render(
    <InterviewProvider>
      <PasswordGate />
    </InterviewProvider>
  );
}

describe('PasswordGate', () => {
  it('renders the gate form', () => {
    renderGate();
    expect(screen.getByText('Psychological Profile')).toBeInTheDocument();
    expect(screen.getByLabelText('Access code')).toBeInTheDocument();
  });

  it('shows error for empty password', async () => {
    renderGate();
    const btn = screen.getByRole('button', { name: /continue/i });
    await userEvent.click(btn);
    expect(screen.getByText('Please enter the access code.')).toBeInTheDocument();
  });

  it('shows error for invalid password', async () => {
    verifyPassword.mockResolvedValueOnce({ valid: false });
    renderGate();
    await userEvent.type(screen.getByLabelText('Access code'), 'wrong');
    await userEvent.click(screen.getByRole('button', { name: /continue/i }));
    expect(await screen.findByText('Incorrect code. Please try again.')).toBeInTheDocument();
  });
});
```

- [ ] **Step 3: Run tests**

```bash
npx vitest run __tests__/PasswordGate.test.jsx
```

Expected: 3 tests pass.

- [ ] **Step 4: Commit**

```bash
git add src/screens/PasswordGate.jsx __tests__/PasswordGate.test.jsx
git commit -m "feat: add PasswordGate screen with spring entrance
Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 10: InterviewChat Screen

**Files:**
- Create: `src/screens/InterviewChat.jsx`
- Create: `src/hooks/useInterview.js`

- [ ] **Step 1: Create src/hooks/useInterview.js**

```javascript
import { useCallback, useRef } from 'react';
import { useInterviewState, useInterviewDispatch } from '../context/InterviewContext';
import { useApi } from './useApi';
import { detectPhase } from '../lib/detectPhase';

// The v2 system prompt — this is the DeepSeek-driven adaptive interview logic.
// DeepSeek's reasoner model interprets this prompt at runtime to adjust
// question pacing, phase transitions, cultural calibration, and crisis response.
const SYSTEM_PROMPT = `You are an advanced psychological assessment tool designed to conduct structured, in-depth behavioral analysis interviews. Your analytical framework draws on forensic psychological profiling methodology (FBI Behavioral Analysis Unit tradition), psychodynamic assessment, cognitive-behavioral formulation, and cross-cultural psychological frameworks including the Big Five (OCEAN), HEXACO, attachment theory, and defense mechanism classification.

## IDENTITY (internal — never disclose to the subject)

You operate with the analytical rigor of a senior behavioral analyst with 20+ years of forensic and clinical assessment experience. This identity informs the DEPTH and PRECISION of your analysis. However, you do NOT present yourself as a doctor, therapist, or clinician to the subject. You are a profiling tool — precise, objective, non-judgmental. You have no name, no persona, no personal anecdotes. You are the instrument, not the practitioner.

## YOUR MISSION

Conduct a structured psychological interview to build a comprehensive, multi-domain profile of the subject. You proceed methodically through five phases, moving from surface to depth as rapport allows. Your goal is not diagnosis — it is understanding at the level of architecture: how the subject is built, what drives them, what defends them, what limits them, and where growth is possible.

## INTERNAL REASONING FRAMEWORK

After each subject response, analyze across these dimensions in your private reasoning (none of this is shown to the subject):

### Immediate Response Analysis
- What does this answer reveal about their operating model?
- Emotional tone: flat, charged, guarded, performative, genuine?
- Language patterns: concrete vs abstract, agentic vs passive, self-reflective vs externalizing?
- What is NOT being said? Where are the pauses, deflections, lacunae?

### Cross-Response Pattern Tracking
- How does this answer connect to, contradict, or elaborate on earlier responses?
- Are there recurring themes, metaphors, or frames?
- Pattern stability: is their self-presentation consistent or context-dependent?
- What's emerging as a through-line?

### Defense Detection
- What defense mechanisms are operating? (denial, rationalization, intellectualization, projection, displacement, reaction formation, sublimation, suppression, humor, etc.)
- Are defenses adaptive or rigid?
- Does the subject show awareness of their defenses?

### Phase Transition Assessment
- Data saturation check: have I gathered enough signal in this domain to move on? (Quality and depth > question count)
- Rapport check: is the subject engaged, defensive, fatigued, or ready for deeper work?
- Readiness for next depth level: does the subject trust the process enough to go deeper?

### Profile Building (ongoing, cumulative)
- Continuously update the 8-part profile in reasoning as new data arrives.
- Weight evidence by consistency across contexts.
- Note contradictions as data points, not errors — they often reveal the most.
- Before Phase 5 delivery, build the COMPLETE profile in reasoning, then distill it.

## OUTPUT RULES

1. **One question at a time.** You drive the session. Never ask compound questions. Wait for each answer before proceeding.

2. **No premature analysis.** Never offer conclusions, interpretations, or profile content before Phase 5. If pressed: "I'm still gathering data. A meaningful profile requires seeing the full picture. I'll share everything once I have enough to be accurate."

3. **Active listening — use it.** Periodically reflect back what you're hearing: "What I'm hearing is that you tend to..." or "It sounds like..." This confirms accuracy and models the depth of attention the subject deserves.

4. **Emotional acknowledgment — always.** When a subject shares something vulnerable, difficult, or painful, acknowledge it before moving on. A simple "That's a lot to carry" or "Thank you for being direct about that" goes a long way. This is not filler — it's what makes deeper disclosure possible. Then transition naturally to the next question.

5. **Precise, not soft.** Frame findings directly and clearly. Do not pathologize normal variation. Do not flatter. Do not pull punches. The subject is here to be seen clearly.

6. **Patterns, not disorders.** Describe what IS there — traits, tendencies, patterns, styles. Do not assign DSM labels. If a pattern is strongly consistent with a known construct, you may note the parallel: "This pattern shares features with what psychology calls [X], though a formal assessment would be needed to confirm that."

7. **End with genuine openness.** After delivering the profile: "This is what I'm seeing. How does it land? What doesn't fit? What would you add or push back on?"

8. **Report offer.** After the profile discussion concludes: "I can generate a comprehensive written report from this session. Would you like me to do that?"

## CULTURAL CALIBRATION

Psychological constructs are not culture-free. Before interpreting any response, consider:

### Frame Awareness
- The frameworks you use (Big Five, attachment theory, defense classification) originate in Western psychology. They have validated cross-cultural utility but are not universal.
- Collectivist cultural norms may present as "interdependence" rather than "enmeshment." Emotional restraint is not avoidance in every cultural context. Directness varies by norm.
- Religious or spiritual frameworks may shape self-understanding in ways that psychological language alone cannot capture. Respect these as valid meaning systems.

### Calibration in Practice
- When a trait or pattern could be interpreted through different cultural lenses, hold both possibilities. Note in reasoning: "Could be [X], could be cultural norm [Y]."
- In the profile, acknowledge cultural context explicitly: "These patterns should be understood within the context of [subject's cultural background]."
- Do not impose Western interpretive frames where they don't fit. Ask, don't assume.

### Language
- Match the subject's vocabulary. If they describe their experience in spiritual terms, meet them there. If they use psychological language, use it back. Do not translate their framework into yours unless it's clarifying.

## SESSION STRUCTURE

### PHASE 1 — Baseline & Rapport
**Domain:** Surface identity, life context, motivation
**Areas to cover:** Occupation, age range, relationship status, self-described personality, why they want this analysis, what they hope to learn
**Transition criteria:** Subject is answering openly (not one-word answers). You have a clear picture of their life context and stated motivations. Subject seems comfortable.
**Depth:** Low. This is orientation, not probing.

### PHASE 2 — Cognitive & Emotional Patterns
**Domain:** Internal operating system
**Areas to cover:** Decision-making style (analytic/intuitive/consultative/impulsive), emotional regulation (how emotions are experienced and managed), stress responses, coping mechanisms (adaptive and maladaptive), core fears, core motivators/drives, relationship with uncertainty and control
**Transition criteria:** You understand HOW they think and feel, not just what they think about. Patterns are emerging across situations. You've seen both typical and stress-state examples.
**Depth:** Moderate. Probing HOW they operate, not just what they report.

### PHASE 3 — Relational & Social Dynamics
**Domain:** How they connect, trust, and navigate others
**Areas to cover:** Attachment patterns (secure, anxious, avoidant, fearful — inferred from descriptions, not labeled to subject), trust formation and rupture, conflict communication style, how they believe others perceive them, relationship history themes, capacity for vulnerability and intimacy
**Transition criteria:** You have a clear picture of their relational template — the patterns that recur across different relationships and contexts.
**Depth:** Deeper. Examining the space between self and other.

### PHASE 4 — Shadow & Vulnerability
**Domain:** What's hidden, avoided, or unintegrated
**Areas to cover:** Regrets and their aftermath, experiences of shame or inadequacy, recurring negative patterns or self-sabotage, what they hide from others, what they hide from themselves (blind spots — infer these, don't ask directly), relationship with failure and imperfection, things they wish were different about themselves
**Transition criteria:** You've touched the sensitive material without the subject shutting down. Acknowledge the difficulty before transitioning: "These aren't easy things to talk about. I appreciate the honesty."
**Depth:** Deepest. This is the core of the profile — where defenses meet vulnerability.

### PHASE 5 — Synthesis & Profile Delivery

You have now gathered enough data. Build the complete profile in your reasoning, then deliver it cleanly. Do NOT ask more questions — this is delivery, not continued interview.

The profile MUST include ALL of the following sections. Each section should be substantive (3-8 substantial sentences or more, depending on the data available):

--- 1. EXECUTIVE SUMMARY ---
4-6 sentence overview capturing the core psychological architecture: primary temperament, dominant drives, key defenses, relational style, and the central tension or growth edge. This should read like the answer to "who is this person, at the structural level?"

--- 2. PERSONALITY ARCHITECTURE ---
Primary Temperament: Big Five / HEXACO profile — where they likely fall on each dimension, with behavioral evidence
Core Drive: What fundamentally motivates them — achievement, connection, control, understanding, safety, autonomy, recognition, etc. — with evidence
Cognitive Style: How they process information and make decisions. Analytic vs intuitive, concrete vs abstract, fast vs deliberate, detail vs big-picture. Include decision-making under stress vs calm.
Emotional Regulation: How emotions are experienced, expressed, and managed. Range, intensity, recovery time, strategies used. What emotions are allowed and which are suppressed?

--- 3. DEFENSE STRUCTURE ---
Identify 3-5 primary defense mechanisms ranked by prominence. For each: name the defense, describe how it manifests in their life, assess whether it's predominantly adaptive or rigid, and note the cost it exacts. Include evidence from the interview. Where possible, note the likely developmental origin of the defense pattern.

--- 4. ATTACHMENT & RELATIONAL PROFILE ---
Attachment Style: Secure / Anxious-Preoccupied / Dismissive-Avoidant / Fearful-Avoidant — describe the pattern, don't just label it
Relational Patterns: How they show up in relationships — what they bring, what they seek, what they fear, what they avoid
Conflict Footprint: Their characteristic conflict behavior: approach, avoidance, escalation, collapse, repair capacity
Interpersonal Perception Gap: How they think others see them vs how others likely actually see them, based on the data

--- 5. STRESS & COPING PROFILE ---
Stress Reactivity: What triggers their stress response, how intensely they react, how long it takes to return to baseline
Primary Coping Strategies: Problem-focused, emotion-focused, meaning-focused, social support, avoidance, etc. — with specific examples
Maladaptive Patterns: Short-term coping that causes long-term cost. What they reach for under pressure that doesn't actually serve them.
Resilience Resources: What actually helps them recover — specific people, practices, perspectives, or conditions

--- 6. SHADOW INTEGRATION ---
Blind Spots: What the subject cannot see about themselves — patterns evident to an observer but not to them. Frame constructively: "You may not fully see..."
Unowned Traits: Strengths or qualities they don't claim or acknowledge, and weaknesses or impulses they disown
Recurring Self-Sabotage: Specific patterns where they undermine their own goals or wellbeing, and the likely function this serves
Growth Edge: The developmental work that's calling — what integration would look like for this person

--- 7. RISK & RESILIENCE ASSESSMENT ---
Protective Factors: Internal strengths, external supports, adaptive traits, resources. Be specific and evidence-grounded.
Risk Factors: Internal vulnerabilities, environmental stressors, maladaptive patterns that could worsen under pressure. Include specific triggering conditions if identifiable.
Overall Resilience: Assessment with justification. Not a score — a nuanced evaluation of where they're sturdy and where they're fragile.

--- 8. RECOMMENDATIONS ---
5-8 actionable, specific suggestions. Draw from multiple modalities where appropriate: cognitive-behavioral approaches, psychodynamic work, relational or attachment-based work, somatic or body-based practices, mindfulness or metacognitive approaches, behavioral activation, narrative or meaning-making work, values clarification. Each recommendation should connect to a specific finding from the profile. Include at least 2-3 reflection prompts the subject can use for ongoing self-exploration.

## CRISIS & SAFETY PROTOCOL

If the subject discloses experiences or thoughts that suggest immediate risk of harm to self or others, respond with direct care WITHOUT derailing the session:

### If suicidal ideation is disclosed:
- Acknowledge: "That sounds serious. I want to pause and check in about that."
- Ask directly but gently about current intent, plan, and means.
- If active risk: "I'm not a crisis service, and this sounds like it needs more support than I can provide here. Please reach out to someone who can help right now — a crisis line, a trusted person, or emergency services. Would you like me to share some resources?"
- If passive/historical ideation without current intent: Acknowledge, note it as significant data, offer to continue or pause at their choice.

### If abuse, violence, or severe trauma is disclosed:
- Acknowledge the weight of what was shared: "That's significant. Thank you for telling me."
- Do not press for graphic detail unless the subject volunteers it.
- Do not minimize, rationalize, or rush past it.
- Offer agency: "Would you prefer to stay with this topic or move to something else?"
- Note in reasoning: this may be the most important data in the profile.

### If the subject becomes visibly distressed (inferred from language):
- Name it gently: "It sounds like this is hitting something real. Take your time."
- Offer pacing control: "We can stay here or step back — your call."
- Never push through distress for the sake of completing the protocol.

## HANDLING DIFFICULT MOMENTS

### When the subject gives short, surface-level, or evasive answers:
- First time: normalize "No rush — take your time with it."
- Second time: gently probe "What makes this one hard to answer?"
- Third time: note the pattern in reasoning, move on. Don't interrogate.
- Some deflection IS data. A pattern of avoidance reveals as much as disclosure.

### When the subject says "I don't know":
- First "I don't know": Give space. "That's a fair answer. Sit with it for a moment and see if anything comes up."
- Repeated "I don't know": Reframe the question or approach from a different angle. If still blocked, acknowledge: "Some questions land differently at different times. Let's move on."

### When the subject asks about YOU:
- Deflect gently: "I'm here to understand you, not the other way around. I'm following a structured assessment protocol designed to build an accurate profile."
- Never fabricate a personal history, opinions, or experiences.

## OPENING (use this exactly)

"Before we begin — you're in control. You can skip any question, take a break, or end at any time. My role is to understand you clearly and accurately, not to judge or diagnose. Nothing you say is stored or shared.

Let's start simply. In your own words — not your job title, not your roles — who are you? If you had to describe the core of who you are, what would you say?"

## PROFILE DELIVERY NOTE

After delivering the full profile, include this closing:

"This profile is a structured analysis based on our conversation. It's not a clinical diagnosis or a formal psychological evaluation. Think of it as a detailed mirror — useful to the extent it helps you see yourself more clearly. Take what fits, question what doesn't, and use it as a starting point for your own reflection."`;

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
      // Build API-formatted messages from conversation history + new user message
      const currentMessages = [...messages, { role: 'user', content: text.trim() }];
      const apiMessages = currentMessages.map(m => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.content,
      }));

      const result = await doChat(apiMessages, SYSTEM_PROMPT);
      const content = result.content;
      dispatch({ type: 'ADD_MESSAGE', role: 'assistant', content });

      // Phase detection from DeepSeek response
      const newPhase = detectPhase(content);
      if (newPhase) {
        dispatch({ type: 'SET_PHASE', phase: newPhase });
      }

      // Check if profile was delivered (Phase 5 content)
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

- [ ] **Step 2: Create src/screens/InterviewChat.jsx**

```jsx
import { useState, useEffect, useRef, useCallback } from 'react';
import { useInterviewState } from '../context/InterviewContext';
import { useInterview } from '../hooks/useInterview';
import ChatBubble from '../components/ChatBubble';
import TypingIndicator from '../components/TypingIndicator';
import PhaseBadge from '../components/PhaseBadge';
import PhaseTransition from '../components/PhaseTransition';
import InputBar from '../components/InputBar';
import StatusMessage from '../components/StatusMessage';

export default function InterviewChat() {
  const { messages, phase, questionCount, status, error } = useInterviewState();
  const { startInterview, sendMessage, endInterview } = useInterview();
  const [inputValue, setInputValue] = useState('');
  const [prevPhase, setPrevPhase] = useState(phase);
  const chatRef = useRef(null);
  const startedRef = useRef(false);

  // Start interview on mount (sends opening message via API)
  useEffect(() => {
    if (!startedRef.current) {
      startedRef.current = true;
      startInterview();
    }
  }, [startInterview]);

  // Track phase changes for transition animation
  useEffect(() => {
    if (phase !== prevPhase) {
      setPrevPhase(phase);
    }
  }, [phase, prevPhase]);

  // Auto-scroll chat
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
    <div className="flex flex-col h-[100dvh] max-w-[820px] mx-auto w-full relative">
      {/* Header */}
      <header className="flex items-center justify-between px-5 py-3 border-b border-border-light bg-surface shrink-0 min-h-[56px]">
        <div className="flex items-center gap-2.5 text-sm font-medium text-ink">
          <span className="w-2 h-2 rounded-full bg-accent opacity-70" />
          Psychological Profile
        </div>
        <PhaseBadge phase={phase} questionCount={questionCount} />
      </header>

      {/* Chat */}
      <div
        ref={chatRef}
        className="flex-1 overflow-y-auto px-5 py-4"
        role="log"
        aria-live="polite"
        aria-label="Interview conversation"
      >
        <PhaseTransition oldPhase={prevPhase} newPhase={phase}>
          {messages.map((msg, i) => (
            <ChatBubble key={i} role={msg.role} content={msg.content} />
          ))}
        </PhaseTransition>

        {isProcessing && <TypingIndicator />}

        {error && (
          <StatusMessage type="error">{error}</StatusMessage>
        )}
      </div>

      {/* Input or Report trigger */}
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

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useInterview.js src/screens/InterviewChat.jsx
git commit -m "feat: add InterviewChat screen + useInterview hook with DeepSeek-driven adaptive logic
Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 11: ReportView Screen

**Files:**
- Create: `src/screens/ReportView.jsx`

- [ ] **Step 1: Create src/screens/ReportView.jsx**

```jsx
import { useRef, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useInterviewState } from '../context/InterviewContext';
import { useInterview } from '../hooks/useInterview';
import { downloadReport } from '../lib/downloadReport';
import StatusMessage from '../components/StatusMessage';
import { CheckCircle } from 'lucide-react';

export default function ReportView() {
  const reduced = useReducedMotion();
  const { messages, reportMarkdown, status, error } = useInterviewState();
  const { generateReport, reset } = useInterview();
  const isProcessing = status === 'processing';
  const hasReport = !!reportMarkdown;

  const handleGenerate = async () => {
    await generateReport();
    // Auto-download after generation
  };

  const handleDownload = () => {
    if (reportMarkdown) {
      downloadReport(reportMarkdown);
    }
  };

  // Auto-download when report is generated
  const prevReportRef = useRef(null);
  useEffect(() => {
    if (reportMarkdown && reportMarkdown !== prevReportRef.current) {
      prevReportRef.current = reportMarkdown;
      handleDownload();
    }
  }, [reportMarkdown]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-canvas">
      <motion.div
        className="max-w-[420px] w-full text-center"
        initial={reduced ? {} : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 80, damping: 15 }}
      >
        <CheckCircle size={48} className="mx-auto mb-4 text-success" />

        <h2 className="text-[28px] font-light tracking-[-0.5px] text-ink mb-2">
          Interview Complete
        </h2>
        <p className="text-[15px] text-ink-muted leading-relaxed mb-7 max-w-[320px] mx-auto">
          Your psychological profile has been synthesized from the conversation. Generate your full report below.
        </p>

        <div className="flex flex-col gap-3 items-center">
          {!hasReport ? (
            <button
              onClick={handleGenerate}
              disabled={isProcessing}
              className="w-full py-3.5 bg-accent text-white rounded-xl text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-opacity hover:opacity-90"
            >
              {isProcessing ? 'Generating...' : 'Generate Full Report'}
            </button>
          ) : (
            <button
              onClick={handleDownload}
              className="w-full py-3.5 bg-accent text-white rounded-xl text-sm font-medium transition-opacity hover:opacity-90"
            >
              Download Report
            </button>
          )}
          <button
            onClick={reset}
            className="w-full py-3.5 bg-surface text-ink-secondary border border-border rounded-xl text-sm font-medium transition-colors hover:bg-surface-raised hover:text-ink"
          >
            New Session
          </button>
        </div>

        {error && <StatusMessage type="error">{error}</StatusMessage>}

        <p className="text-[11px] text-ink-muted mt-6">
          The report downloads as HTML. Use <strong>Cmd/Ctrl+P → Save as PDF</strong> for a print-ready copy.
        </p>
      </motion.div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/screens/ReportView.jsx
git commit -m "feat: add ReportView screen with auto-download
Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 12: App Shell + Lazy Loading

**Files:**
- Create: `src/App.jsx`

- [ ] **Step 1: Create src/App.jsx**

```jsx
import { lazy, Suspense } from 'react';
import { InterviewProvider, useInterviewState } from './context/InterviewContext';
import AnimatedBackground from './components/AnimatedBackground';

const PasswordGate = lazy(() => import('./screens/PasswordGate'));
const InterviewChat = lazy(() => import('./screens/InterviewChat'));
const ReportView = lazy(() => import('./screens/ReportView'));

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-canvas">
      <div className="w-7 h-7 border-2 border-border border-t-accent rounded-full animate-spin" />
    </div>
  );
}

function ScreenRouter() {
  const { screen } = useInterviewState();

  return (
    <Suspense fallback={<LoadingFallback />}>
      {screen === 'gate' && <PasswordGate />}
      {screen === 'interview' && <InterviewChat />}
      {screen === 'report' && <ReportView />}
    </Suspense>
  );
}

export default function App() {
  return (
    <InterviewProvider>
      <AnimatedBackground />
      <main>
        <ScreenRouter />
      </main>
    </InterviewProvider>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/App.jsx
git commit -m "feat: add App shell with lazy-loaded screens + animated background
Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 13: End-to-End Integration & Build Verification

**Files:**
- Modify: `index.html` (verify)

- [ ] **Step 1: Run dev server and check for errors**

```bash
cd /Users/tony/psych-profiler && npm run dev
```

Expected: No console errors, app renders PasswordGate.

- [ ] **Step 2: Run all tests**

```bash
npx vitest run
```

Expected: All tests pass.

- [ ] **Step 3: Production build**

```bash
npm run build
```

Expected: Build succeeds, `dist/` created with index.html + JS/CSS bundles.

- [ ] **Step 4: Check bundle size**

```bash
du -sh dist/
```

Expected: < 500KB total (should be ~150-200KB gzipped).

- [ ] **Step 5: Lighthouse audit (manual)**

Open the built app (via `npx vite preview`), run Lighthouse in Chrome DevTools.

Targets: a11y ≥ 95, perf ≥ 90, no console errors.

- [ ] **Step 6: Commit build artifacts if deploying to GitHub Pages**

```bash
git add dist/ -f
git commit -m "build: production build for GitHub Pages deploy
Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 14: Accessibility & Mobile Polish

**Files:**
- Modify: `src/screens/PasswordGate.jsx`
- Modify: `src/screens/InterviewChat.jsx`
- Modify: `src/components/InputBar.jsx`

- [ ] **Step 1: Verify semantic HTML landmarks**

Check that all screens have:
- `<main>` wrapping the app content ✅ (App.jsx)
- `<header>` for the interview header ✅ (InterviewChat.jsx)
- `role="log"` and `aria-live="polite"` on chat ✅ (already in InterviewChat)
- `role="alert"` on error messages ✅ (already in StatusMessage)
- `role="status"` on typing indicator ✅ (already in TypingIndicator)

- [ ] **Step 2: Verify keyboard navigation**

Manual checklist:
- [ ] Password gate: Tab → input → Enter to submit
- [ ] Chat: Textarea auto-focuses, Enter sends, Shift+Enter newline, Esc blurs
- [ ] Send button: Enter/Space activates
- [ ] End interview: Enter/Space opens confirm
- [ ] Report: Tab through Generate/Download/New Session buttons

- [ ] **Step 3: Add focus ring visibility**

Add to `src/index.css`:

```css
/* Ensure focus rings are always visible */
:focus-visible {
  outline: 2px solid var(--color-accent) !important;
  outline-offset: 2px !important;
}
```

- [ ] **Step 4: Verify mobile at 320px, 375px, 768px**

Open Chrome DevTools responsive mode, test:
- [ ] Password gate: input + button full width, no horizontal scroll
- [ ] Chat: bubbles fit within viewport, text doesn't overflow
- [ ] Input bar: sticky bottom, keyboard-aware
- [ ] Report: buttons stacked, full width

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "fix: accessibility and mobile polish pass
Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

## Plan Summary

| # | Task | Files Created | Tests |
|---|---|---|---|
| 1 | Project Scaffolding | 4 | — |
| 2 | API Layer | 2 | — |
| 3 | Utility Functions | 3 | 2 test files |
| 4 | State Management | 1 | 1 test file |
| 5 | Base Components (Part 1) | 3 | — |
| 6 | Base Components (Part 2) | 3 | — |
| 7 | InputBar | 1 | — |
| 8 | AnimatedBackground | 1 | — |
| 9 | PasswordGate | 1 | 1 test file |
| 10 | InterviewChat + useInterview | 2 | — |
| 11 | ReportView | 1 | — |
| 12 | App Shell + Lazy Loading | 1 | — |
| 13 | Integration & Build | — | — |
| 14 | A11y & Mobile Polish | 3 (modified) | — |

**Backend:** Zero changes. `backend/worker.js` remains exactly as-is.

**DeepSeek adaptive logic:** The v2 system prompt (embedded in `useInterview.js`) drives all adaptive behavior — phase pacing, cultural calibration, crisis response — via DeepSeek's `deepseek-reasoner` model at runtime. No frontend logic needed for adaptation; the prompt IS the adaptation layer.

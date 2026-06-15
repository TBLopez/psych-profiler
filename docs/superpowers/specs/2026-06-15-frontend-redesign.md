# Frontend Redesign — Psych Profiler

**Date:** 2026-06-15
**Status:** Design approved — ready for implementation plan

## Summary

Rebuild the psychological profiler frontend as a React SPA using Aceternity UI (Tailwind + Framer Motion), with a Clinical Precision aesthetic (light, clean, high-trust) and full Aceternity motion (ambient animations, spring transitions, morphing elements). Mobile-first, same 3 screens (password gate → interview chat → report), same backend API.

---

## 1. Design System

### Palette

| Token | Hex | Usage |
|---|---|---|
| Canvas | `#FAFBFC` | Page background |
| Surface | `#FFFFFF` | Cards, header, input bar |
| Surface Raised | `#F3F4F6` | Input fields, hover states |
| Ink | `#1A1A2E` | Primary text |
| Ink Secondary | `#666666` | Secondary text |
| Ink Muted | `#888888` | Captions, hints |
| Accent | `#4F46E5` | Buttons, links, user bubbles, focus rings |
| Accent Glow | `rgba(79,70,229,0.06)` | Ambient orbs, focus shadows |
| Success | `#059669` | Status messages |
| Danger | `#DC2626` | Errors |
| Border | `#E5E7EB` | Card/input borders |

### Typography

| Token | Size/Weight | Use |
|---|---|---|
| Heading XL | 40px / 300 | Gate title, report cover |
| Heading L | 28px / 400 | Phase headers, section titles |
| Heading M | 20px / 500 | Card titles |
| Body | 16px / 400 | Chat messages, question text (1.65 line-height) |
| Caption | 13px / 400 | Labels, meta text |
| Mono | 13px / 400 | SF Mono / JetBrains Mono for code blocks |

### Spacing

- 8px base grid
- Touch targets ≥ 44px
- Safe area aware: `env(safe-area-inset-*)` for iOS
- Keyboard-aware input positioning on mobile

### Design References

- **Refero** — SaaS polish, clear information hierarchy, professional restraint
- **Mobbin** — Mobile patterns: thumb-friendly controls, full-width inputs, large touch targets
- **Godly** — Bold typography moments, creative whitespace, premium minimalism
- **Aceternity UI** — Component library: spring animations, glass morphism, gradient orbs

---

## 2. Architecture

### Tech Stack

- **Vite** — build tool, fast HMR, simple config
- **React 18** — component architecture
- **Tailwind CSS** — utility-first styling, custom tokens in `tailwind.config.js`
- **Framer Motion** — animation library (Aceternity dependency)
- **Aceternity UI** — component library (AnimatedModal, FloatingGradient, Sparkles, plus motion primitives)
- **No router** — 3-screen state machine, no URL routing needed

### Project Structure

```
psych-profiler/
├── index.html                    # Vite entry
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── package.json
├── backend/                      # UNCHANGED
│   └── worker.js
├── src/
│   ├── main.jsx                  # React root
│   ├── App.jsx                   # State machine: gate | chat | report
│   ├── context/
│   │   └── InterviewContext.jsx  # useReducer state management
│   ├── screens/
│   │   ├── PasswordGate.jsx
│   │   ├── InterviewChat.jsx
│   │   └── ReportView.jsx
│   ├── components/
│   │   ├── AnimatedBackground.jsx  # Aceternity FloatingGradient orbs
│   │   ├── ChatBubble.jsx          # Spring-animated message
│   │   ├── TypingIndicator.jsx     # 3-dot bounce
│   │   ├── PhaseBadge.jsx          # Animated number transition
│   │   ├── PhaseTransition.jsx     # Full-width wipe between phases
│   │   ├── InputBar.jsx            # Auto-resize textarea + send button
│   │   ├── SendButton.jsx          # Morphs arrow → spinner → check
│   │   ├── ReportActions.jsx       # Generate + download + reset
│   │   └── StatusMessage.jsx       # Success/error toast
│   ├── hooks/
│   │   ├── useInterview.js         # State reducer + side effects
│   │   └── useApi.js               # fetch wrapper with auth headers
│   ├── lib/
│   │   ├── api.js                  # API_BASE config, apiPost helper
│   │   ├── formatContent.js        # Markdown → HTML
│   │   ├── detectPhase.js          # Phase detection from response text
│   │   └── downloadReport.js       # HTML report generation + download
│   └── styles/
│       └── index.css               # Tailwind directives + custom tokens
└── public/
    └── (static assets if any)
```

### State Management

```javascript
// InterviewContext — single context, one reducer, 3 consumers
{
  phase: 1-5,
  questionCount: number,
  messages: [{ role: 'user'|'assistant', content: string }],
  status: 'idle' | 'processing' | 'complete',
  reportMarkdown: string | null,
  error: string | null,
}

// Actions
ADD_MESSAGE     → adds to messages[], updates phase/questionCount
SET_STATUS      → transitions idle/processing/complete
SET_REPORT      → stores generated markdown
SET_ERROR       → sets error state
RESET           → returns to initial state
```

### Data Flow

```
User input → InputBar → dispatch(ADD_MESSAGE)
  → useInterview handles side effect:
    POST /api/chat with message history
    → dispatch(ADD_MESSAGE) with AI response
    → detectPhase() → update phase/questionCount
    → if phase 5 + profile markers → SET_STATUS 'complete'
  → ReportView renders with actions
  → Generate Report:
    POST /api/generate-report with conversation
    → SET_REPORT with markdown
    → downloadReport() wraps in HTML, triggers download
```

### Backend

**No changes.** The Cloudflare Worker (`backend/worker.js`) stays exactly as-is. All three endpoints (`/api/verify`, `/api/chat`, `/api/generate-report`) are consumed identically by the React frontend.

---

## 3. Motion Design

### Principles

1. **Every entrance is earned.** No animation should play more than once per element.
2. **Duration scales with importance.** Phase transitions > bubble entrances > micro-interactions.
3. **Spring physics feel alive.** Use `stiffness: 100, damping: 15` for entrances, `stiffness: 300, damping: 25` for button morphs.
4. **Reduced motion is respected.** All animations wrap in `prefers-reduced-motion` checks. No animation is essential to understanding the UI.

### Animation Catalog

| Element | Trigger | Animation | Duration |
|---|---|---|---|
| Gate card | Mount | Spring scale 0.9→1, fade in | 0.4s |
| Ambient orb | Continuous | Slow rotation + pulse, CSS (not JS) | 20s cycle |
| Chat bubble | Mount | Spring from y:6, opacity 0→1 | 0.3s |
| Typing dots | processing=true | Staggered opacity bounce | 1.4s loop |
| Phase transition | Phase change (1→2, 2→3, etc., not every question) | Full-width horizontal wipe revealing new phase label | 0.4s |
| Send button idle→loading | Click | Morph arrow icon → spinner (layoutId) | 0.2s |
| Send button loading→done | API response | Spinner → checkmark, scale bounce | 0.3s |
| Report download | Click | Sparkles/confetti burst (Aceternity Sparkles) | 0.8s |
| Error shake | Auth fail | Horizontal shake on gate input | 0.4s |
| Phase badge number | Phase change | Animated number count-up | 0.3s |

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

All Framer Motion components use `useReducedMotion()` hook to disable springs and fall back to instant opacity changes.

---

## 4. Accessibility Plan (WCAG 2.1 AA)

### Semantic Structure

```html
<main>                   ← App shell
  <section aria-label="Password gate">   ← Gate screen
  <section aria-label="Interview">       ← Chat screen
  <section aria-label="Report">          ← Report screen
```

### Keyboard Navigation

| Element | Key | Action |
|---|---|---|
| Password input | Enter | Submit password |
| Chat textarea | Enter | Send message |
| Chat textarea | Shift+Enter | New line |
| Chat textarea | Escape | Blur (defocus) |
| Send button | Enter / Space | Send message |
| End interview | Enter / Space | Confirm dialog |
| Generate report | Enter / Space | Generate |
| Download report | Enter / Space | Download |
| New session | Enter / Space | Reset |

### ARIA

| Element | Role | ARIA |
|---|---|---|
| Chat area | `role="log"` | `aria-live="polite"` for new messages |
| Typing indicator | `status` | `aria-label="Interviewer is typing"` |
| Phase badge | `status` | `aria-label="Phase 2, question 4 of 8"` |
| Error message | `alert` | `role="alert"` for screen reader announcement |
| Send button | — | `aria-label="Send message"` |
| Loading overlay | `alertdialog` | `aria-label="Processing"`, traps focus |

### Focus Management

- Password gate: auto-focus input on mount
- After unlock: focus moves to chat textarea
- After send: focus returns to textarea
- After error: focus moves to error message, then back
- Report generation: focus moves to download button when ready
- Loading overlay: focus trapped while visible

### Color & Contrast

- All text/background combinations meet 4.5:1 ratio (AA)
- Focus rings: 3px indigo outline + 2px offset (visible in all states)
- Error states: never rely on color alone — always include text and icon

### Targets

- MSI (Minimum Size Initiative): all interactive elements ≥ 24×24px
- Spacing between touch targets ≥ 8px
- Send button: 44×44px on mobile

---

## 5. Performance Targets

| Metric | Target | Strategy |
|---|---|---|
| LCP | < 1.5s | Inline critical CSS, defer Aceternity components |
| INP | < 100ms | Debounced input, no layout thrash on scroll |
| CLS | < 0.05 | Reserve space for chat bubbles, fixed input bar |
| Lighthouse a11y | ≥ 95 | Semantic HTML, ARIA labels, keyboard nav |
| Lighthouse perf | ≥ 90 | Code splitting, tree shaking, minimal deps |
| Bundle size | < 100KB gzipped | Vite code splitting, lazy load report view |
| Time to Interactive | < 2s | Minimal JS on gate screen, load rest after auth |

### Optimization Strategy

1. **Code split on screens** — gate loads immediately, `InterviewChat` and `ReportView` are loaded via `React.lazy()` + `Suspense` after auth succeeds
2. **Aceternity tree shaking** — import only used components, don't pull the full library
3. **Font optimization** — self-host Inter variable font (no Google Fonts round trip)
4. **No runtime CSS-in-JS** — Tailwind compiles to static CSS at build time
5. **API responses under 2KB** — worker already returns minimal JSON

---

## 6. Mobile Experience

### Breakpoints

| Breakpoint | Layout |
|---|---|
| < 640px (mobile) | Full-width, stacked, bottom input |
| 640-1024px (tablet) | Centered 640px max, padded |
| > 1024px (desktop) | Centered 820px max |

### Mobile-Specific Patterns (Mobbin-inspired)

- **Input bar is sticky bottom** — always visible above keyboard
- **Keyboard handling** — `visualViewport` API to adjust chat scroll when keyboard opens
- **Send button is round, 44px** — thumb-friendly, indigo fill
- **No horizontal scrolling ever** — `overflow-x: hidden` on all containers
- **Pull-to-refresh disabled** — prevents accidental chat loss (custom `overscroll-behavior: contain`)
- **Safe area padding** — `padding-bottom: env(safe-area-inset-bottom)` on input bar
- **Phase badge condenses** — hides on very small screens (< 375px), shows phase number only

### Touch

- All interactive elements: minimum 44px touch target
- Swipe-to-go-back: not implemented (risk of accidental interview exit)
- Long-press on message: native text selection only (no custom context menu)

---

## 7. Error Handling

| Error | Behavior |
|---|---|
| Network failure (chat) | Inline toast, message stays in textarea, retry on next send |
| Network failure (gate) | Error text below input, shake animation |
| Network failure (report) | Error text in report section, retry button |
| API error (any) | Toast with error message, doesn't clear chat |
| Empty response | Retry once, then show "Interviewer is taking longer than expected" |
| Rate limit | "Too many requests. Please wait a moment." with countdown |

---

## 8. Testing Strategy

### Unit Tests (Vitest)

- `detectPhase()` — all phase detection patterns
- `formatContent()` — markdown rendering edge cases
- `useInterview` reducer — all action types, state transitions
- `useApi` — mock fetch, error/success paths

### Component Tests (Vitest + Testing Library)

- PasswordGate — auth flow, error states
- ChatBubble — rendering, markdown
- InputBar — send, empty validation, keyboard shortcuts
- ReportView — generate/download/reset flows

### E2E (Playwright — optional stretch)

- Full interview flow: gate → chat → report → download
- Mobile viewport: 375px width, keyboard handling
- Error recovery: network failure → retry

---

## 9. Out of Scope

- No backend changes (worker.js untouched)
- No password management UI (deployer uses `wrangler secret`)
- No multi-language support (English only)
- No analytics or tracking
- No persistence beyond the current session (report downloads, nothing stored)
- No dark mode toggle (light-only Clinical Precision aesthetic)

---

## 10. Deployment

Same as current: `vite build` → commit `dist/` → GitHub Pages serves it. The `API_BASE` config points to the Cloudflare Worker (unchanged URL).

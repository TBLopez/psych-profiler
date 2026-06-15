# Frontend Redesign — Psych Profiler (v2: Warm Precision + Immersive)

**Date:** 2026-06-15
**Status:** Design approved — ready for implementation plan

## Summary

Rebuild the psychological profiler frontend as a React SPA using Vite + React + Tailwind CSS + Framer Motion + Aceternity UI, with a **Warm Precision** aesthetic (light, clinical foundation with gradient accent warmth) and **Immersive** animation density (phase-aware ambience, cinematic transitions, cursor-responsive lighting, spring physics throughout). Mobile-first, same 3 screens (password gate → interview chat → report), same backend API.

---

## 1. Design System

### 1.1 Palette — Warm Precision

| Token | Hex | Usage |
|---|---|---|
| Canvas | `#FAFBFC` | Page background |
| Surface | `#FFFFFF` | Cards, header, input bar |
| Surface Raised | `#F3F4F6` | Input fields, hover states |
| Surface Glass | `rgba(255,255,255,0.8)` | Glass morphism cards, floating elements |
| Ink | `#1A1A2E` | Primary text |
| Ink Secondary | `#555555` | Chat body text, secondary content |
| Ink Muted | `#888888` | Captions, hints, metadata |
| **Accent Primary** | `#4F46E5 → #6366F1` | Buttons, links, user bubbles, focus rings (Indigo 500→400) |
| **Accent Deep** | `#7C3AED → #8B5CF6` | Phase 3-4 accent, depth indicators (Violet 600→500) |
| **Accent Warm** | `#EC4899 → #F472B6` | Brand mark gradient stop, warmth accents, quotes (Rose 500→400) |
| **Accent Positive** | `#059669 → #10B981` | Phase 5 completion, success states, profile delivery (Emerald 600→500) |
| Accent Glow Primary | `rgba(79,70,229,0.08)` | Ambient orbs, focus shadows |
| Accent Glow Warm | `rgba(236,72,153,0.05)` | Warm ambient highlights |
| Success | `#059669` | Status messages |
| Danger | `#DC2626` | Errors |
| Border | `#E8EAF0` | Card/input borders |
| Border Light | `#F0F0F5` | Subtle separators |

**Phase-aware color strategy:** The ambient environment shifts accent emphasis as the interview deepens:
- **Phase 1-2 (Baseline/Cognitive):** Indigo-dominant. Warm neutral ambient orbs. The environment feels safe and clinical.
- **Phase 3-4 (Relational/Shadow):** Violet shift. The ambient orbs deepen toward violet. The environment mirrors the deepening exploration.
- **Phase 5 (Profile Delivery):** Emerald resolution. Ambient orbs shift to emerald/teal. The environment signals completion and clarity.

Rose is used sparingly throughout as a warmth accent — never dominant, always accenting.

### 1.2 Typography — Godly-Inspired Boldness

| Token | Size / Weight | Use |
|---|---|---|
| Heading XL | 36px / 200 | Gate title, report cover. Light weight for premium feel. |
| Heading L | 24px / 300 | Phase headers, section titles. Letter-spacing: -0.5px. |
| Heading M | 16px / 500 | Card titles, report section headers. |
| Body | 15px / 400 | Chat messages (1.7 line-height for breathing room). |
| Caption | 12px / 400 | Labels, meta text. |
| Mono | 13px / 400 | SF Mono / JetBrains Mono for code blocks. |

**Godly-inspired moments:**
- Gate title is set large (36px) and light (200 weight) with tight letter-spacing — a statement.
- Section breaks in the interview use generous whitespace and light headings.
- Report cover uses typography as the primary design element — no decoration needed.
- The brand mark uses a gradient icon, not text — memorable and distinctive.

### 1.3 Spacing

- 8px base grid
- Generous vertical rhythm: 24px between chat messages, 16px between paragraphs within messages
- Touch targets ≥ 44px
- Safe area aware: `env(safe-area-inset-*)` for iOS
- Keyboard-aware input positioning on mobile via `visualViewport` API
- Max content width: 820px (up from spec's implicit ~720px — more breathing room)

### 1.4 Design References

- **Aceternity UI** — Spring animations, glass morphism, gradient orbs, sparkle particles, animated modals
- **Refero** — SaaS polish, clear information hierarchy, professional restraint, premium component design
- **Mobbin** — Mobile patterns: thumb-friendly controls, full-width inputs, large touch targets, keyboard-aware layouts
- **Godly** — Bold typography moments, creative whitespace, premium minimalism, art-directed scale

---

## 2. Architecture

### 2.1 Tech Stack

- **Vite 6** — build tool, fast HMR, simple config
- **React 18** — component architecture
- **Tailwind CSS 4** — utility-first styling, custom tokens via `@theme`
- **Framer Motion 12** — animation library (spring physics, layout animations, AnimatePresence)
- **Aceternity UI** — Sparkles component + motion primitives (selected imports only, tree-shaken)
- **Lucide React** — icons (ArrowUp, Loader2, Check, CheckCircle, Sparkles)
- **No router** — 3-screen state machine, no URL routing needed

### 2.2 Project Structure

```
psych-profiler/
├── index.html                    # Vite entry
├── vite.config.js
├── package.json
├── backend/                      # UNCHANGED
│   └── worker.js
├── src/
│   ├── main.jsx                  # React root
│   ├── App.jsx                   # State machine + screen transition orchestrator
│   ├── index.css                 # Tailwind directives + custom tokens + keyframes
│   ├── context/
│   │   └── InterviewContext.jsx  # useReducer state management
│   ├── screens/
│   │   ├── PasswordGate.jsx      # Cinematic gate with radial reveal
│   │   ├── InterviewChat.jsx     # Immersive chat with phase-aware ambience
│   │   └── ReportView.jsx        # Multi-step report experience
│   ├── components/
│   │   ├── AmbientEnvironment.jsx     # Phase-aware gradient orbs + cursor glow + noise texture
│   │   ├── ScreenTransition.jsx       # Cinematic transition orchestrator (gate→chat, chat→report, report→gate)
│   │   ├── ChatBubble.jsx             # Rich message cards: glass interviewer, gradient user, structured profile
│   │   ├── TypingIndicator.jsx        # 3-dot bounce with breathing effect on input
│   │   ├── PhaseIndicator.jsx         # Animated gradient pill with progress dots and counter
│   │   ├── CinematicPhaseChange.jsx   # Viewport-level phase transition with gradient trail + zoom-blur
│   │   ├── InputBar.jsx               # Floating glass input with state-morphing send button
│   │   ├── SendButton.jsx             # 3-state morph: arrow → spinner → checkmark (layoutId)
│   │   ├── StaggeredReveal.jsx        # Paragraph-by-paragraph staggered text reveal
│   │   ├── SparkleBurst.jsx           # Aceternity Sparkles wrapper for celebration moments
│   │   ├── StatsCounter.jsx           # Animated number count-up for interview stats
│   │   ├── ReportPreview.jsx          # Section cards preview before download
│   │   └── StatusMessage.jsx          # Success/error inline toast
│   ├── hooks/
│   │   ├── useInterview.js            # State reducer + side effects + phase-aware orchestration
│   │   ├── useApi.js                  # Fetch wrapper with auth headers
│   │   ├── usePhaseAmbience.js        # Phase-aware color interpolation + ambient state
│   │   └── useCursorGlow.js           # Desktop cursor tracking for lighting effect
│   ├── lib/
│   │   ├── api.js                     # API_BASE config, apiPost helper
│   │   ├── formatContent.js           # Markdown → HTML
│   │   ├── detectPhase.js             # Phase detection from response text
│   │   ├── downloadReport.js          # HTML report generation + download (print-styled)
│   │   └── phaseColors.js             # Phase → color mapping, interpolation utilities
│   └── styles/
│       └── index.css                  # Tailwind directives + custom tokens + keyframes
└── __tests__/
    ├── setup.js
    ├── formatContent.test.js
    ├── detectPhase.test.js
    ├── InterviewContext.test.jsx
    ├── PasswordGate.test.jsx
    └── phaseColors.test.js
```

### 2.3 State Management

```javascript
// InterviewContext — single context, one reducer, 3 consumers
{
  screen: 'gate' | 'interview' | 'report',
  password: string,
  phase: 1-5,
  questionCount: number,
  messages: [{ role: 'user'|'assistant', content: string }],
  status: 'idle' | 'processing' | 'complete',
  reportMarkdown: string | null,
  error: string | null,
  stats: {              // NEW — computed from conversation
    phasesCompleted: number,
    questionsAnswered: number,
    domainsAnalyzed: number,
  },
}

// Actions
ADD_MESSAGE     → adds to messages[], updates phase/questionCount/stats
SET_STATUS      → transitions idle/processing/complete
SET_REPORT      → stores generated markdown
SET_ERROR       → sets error state
RESET           → returns to initial state
```

### 2.4 Data Flow

```
User input → InputBar → dispatch(ADD_MESSAGE)
  → useInterview handles side effect:
    POST /api/chat with message history
    → dispatch(ADD_MESSAGE) with AI response
    → detectPhase() → update phase/questionCount
    → if phase changed → trigger CinematicPhaseChange
    → if phase 5 + profile markers → SET_STATUS 'complete'
  → ReportView renders with animated stats
  → Generate Report:
    POST /api/generate-report with conversation
    → Animated generation sequence
    → SET_REPORT with markdown
    → SparkleBurst celebration
    → Auto-download via downloadReport()
```

### 2.5 Backend

**No changes.** The Cloudflare Worker (`backend/worker.js`) stays exactly as-is.

---

## 3. Motion Design

### 3.1 Principles

1. **Every entrance is earned.** No animation plays more than once per element.
2. **Duration scales with importance.** Phase transitions > bubble entrances > micro-interactions.
3. **Spring physics feel alive.** Use `stiffness: 100, damping: 15` for entrances, `stiffness: 300, damping: 25` for button morphs.
4. **The environment breathes.** Ambient orbs, gradients, and lighting shift continuously but subtly — never distracting.
5. **Reduced motion is respected.** All animations wrap in `prefers-reduced-motion` checks. No animation is essential to understanding the UI.

### 3.2 Animation Catalog

| Element | Trigger | Animation | Duration |
|---|---|---|---|
| **Gate card** | Mount | Spring scale 0.92→1, fade in, brand mark glow pulse | 0.5s |
| **Gate → Chat transition** | Unlock | Radial reveal from Continue button outward, brand mark → header dot morph, ambient orbs bloom in | 0.6s |
| **Ambient orbs** | Continuous | Slow rotation + drift + cursor attraction (desktop only). Phase-aware hue interpolation. | 20-30s cycle |
| **Chat bubble (interviewer)** | Mount | Spring from y:8, opacity 0→1, glass card with subtle border shimmer | 0.35s |
| **Chat bubble (user)** | Mount | Spring from y:8, opacity 0→1, gradient fill with glow pulse | 0.35s |
| **Staggered paragraphs** | Long interviewer message | Paragraphs reveal sequentially with 80ms stagger | 80ms × N paragraphs |
| **Typing dots** | status=processing | Staggered opacity bounce + subtle breathing scale on input area | 1.4s loop |
| **Phase transition** | Phase change (1→2, 2→3, etc.) | Viewport-level gradient trail wipe + subtle zoom-blur + ambient color shift + phase badge counter animation | 0.5s |
| **Phase badge** | Phase change | Animated number count-up, gradient fill transition, progress dot highlight | 0.4s |
| **Send button idle→loading** | Click | Morph arrow icon → spinner (layoutId shared layout animation) | 0.2s |
| **Send button loading→done** | API response | Spinner → checkmark, scale bounce (spring) | 0.35s |
| **Input bar** | Focus | Glass container lifts (translateY -2px), border glow intensifies | 0.25s |
| **Input bar** | First keystroke | Subtle pulse on the container (scale 1.005) | 0.2s |
| **Cursor glow** | Mouse move (desktop) | Soft radial gradient follows cursor at opacity 0.03-0.05 | Continuous |
| **Profile delivery** | Phase 5 begins | Emerald ambient shift, SparkleBurst particles, phase badge → completion indicator | 0.8s sparkles, 0.4s shift |
| **Chat → Report transition** | Status → complete | Gentle zoom-out + emerald gradient flash + report card scales in | 0.5s |
| **Stats counters** | Report mount | Numbers count up from 0 with easing | 1.2s staggered |
| **Report generation** | Generate click | Section titles appear sequentially, progress indicator, sparkle burst on completion | 2-4s (depends on API) |
| **Report ready** | SET_REPORT | SparkleBurst celebration, download button pulse | 0.8s sparkles, 0.4s pulse |
| **Report → Gate exit** | New Session click | Report scale-down + fade, gate blooms back in, ambient orbs reset to Phase 1 warmth | 0.5s |
| **Error shake** | Auth fail | Horizontal shake on gate input | 0.4s |

### 3.3 Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

All Framer Motion components use `useReducedMotion()` hook to disable springs and fall back to instant opacity changes. StaggeredReveal shows all content at once. Phase transitions become instant cuts.

---

## 4. Screen Transitions (Cinematic)

### 4.1 Gate → Chat: Radial Reveal

When the password is verified:
1. A circular clip-path expands from the "Continue" button's position, revealing the chat screen beneath.
2. The gate card fades out inside the shrinking clip region.
3. The brand mark (◆) morphs into the chat header's status dot via a shared layout animation.
4. The ambient orbs bloom in from opacity 0 with a 200ms delay.
5. The first interviewer message appears with a 400ms delay.

Total duration: ~600ms.

### 4.2 Chat → Report: Zoom-Out Resolution

When the interview completes (status → 'complete'):
1. A subtle emerald gradient flash overlays the viewport (opacity 0→0.15→0, 300ms).
2. The chat viewport does a gentle scale (1→0.97) and fades.
3. The report completion card scales in (0.9→1) with spring physics.
4. Stats counters begin their animation after card entrance.
5. SparkleBurst particles fire on card arrival.

Total duration: ~500ms.

### 4.3 Report → Gate: Graceful Reset

When the user clicks "New Session":
1. The report card scales down (1→0.95) and fades out.
2. The gate screen fades in with spring scale (0.95→1).
3. The ambient orbs interpolate back to Phase 1 warm-neutral hues.
4. The password input auto-focuses.

Total duration: ~500ms.

---

## 5. Component Specifications

### 5.1 AmbientEnvironment (formerly AnimatedBackground)

**Purpose:** Phase-aware ambient presence — gradient orbs, cursor-responsive lighting, and noise texture.

**Features:**
- 3-4 gradient orbs positioned at different viewport corners
- Each orb has independent animation parameters (scale, drift, rotation speed)
- Orb hues interpolate based on current interview phase (see PhaseAmbience)
- On desktop, orbs drift subtly toward cursor position (max 20px displacement)
- A CSS `background-image` noise texture overlay at opacity 0.015 for depth
- Respects `prefers-reduced-motion` — hides entirely if reduced motion
- `pointer-events: none`, `aria-hidden="true"`

**Phase color mapping:**
```
Phase 1: warm-neutral (canvas-toned)
Phase 2: indigo-tinted
Phase 3: violet-shifted
Phase 4: deep violet
Phase 5: emerald/teal
```

### 5.2 ScreenTransition (NEW)

**Purpose:** Orchestrates cinematic transitions between screens.

**Props:** `{ from, to, onComplete }`

**Implementation:**
- Uses Framer Motion `AnimatePresence` with `mode="wait"`
- Each transition direction has its own animation variant
- Gate→Chat uses clip-path radial reveal
- Chat→Report uses scale + gradient flash overlay
- Report→Gate uses scale-down exit + fade-in entrance
- Fires `onComplete` callback when transition finishes

### 5.3 ChatBubble (Enhanced)

**Props:** `{ role, content, isProfileDelivery?, paragraphIndex? }`

**Features:**
- **Interviewer messages:** Glass-morphism card (`bg-white/80 backdrop-blur-sm`) with subtle gradient border (`border-indigo-100`). StaggeredReveal for paragraphs in long messages.
- **User messages:** Indigo-violet gradient fill (`bg-gradient-to-br from-accent-primary to-accent-deep`) with soft box-shadow glow. Right-aligned with rounded-br-sm for speech bubble feel.
- **Phase 5 profile sections:** Structured card treatment — each `--- SECTION ---` header becomes a card with subtle divider. Different background tint per section type.
- **System messages:** Italic, muted, smaller text. Amber/warm tone for system notifications.
- Spring entrance animation: `{ opacity: 0, y: 8 } → { opacity: 1, y: 0 }` with `stiffness: 100, damping: 15`.

### 5.4 StaggeredReveal (NEW)

**Purpose:** Paragraph-by-paragraph reveal for long interviewer messages.

**Props:** `{ html, delay?: 80, disabled?: boolean }`

**Features:**
- Splits HTML content into paragraphs
- Each paragraph animates in with 80ms stagger
- Uses Framer Motion `staggerChildren`
- Skips for messages under 200 chars
- Respects reduced motion — shows all content at once

### 5.5 PhaseIndicator (Enhanced, was PhaseBadge)

**Purpose:** Shows current phase with animated gradient pill + progress dots.

**Features:**
- Animated pill container with gradient fill that shifts with phase
- 5 progress dots showing completed/current/upcoming phases
- Phase number counter animates on change (count-up or crossfade)
- `aria-live="polite"` with descriptive label
- Collapses on screens < 375px (shows phase number only)
- Phase names: "Baseline" → "Cognitive & Emotional" → "Relational & Social" → "Vulnerability Probe" → "Profile Delivery"

### 5.6 CinematicPhaseChange (Enhanced, was PhaseTransition)

**Purpose:** Viewport-level phase transition with gradient trail + zoom-blur + ambient color shift.

**Props:** `{ oldPhase, newPhase, children }`

**Features:**
- Horizontal wipe with gradient trail (indigo → violet gradient, 500ms)
- Subtle zoom-blur effect during transition (scale 1→1.02→1, blur 0→2px→0)
- AmbientEnvironment receives new phase for color interpolation
- PhaseIndicator triggers its counter + dot animation
- Haptic-like visual pulse on completion (brief scale bounce on the new content)
- Uses `AnimatePresence mode="wait"`

### 5.7 InputBar (Enhanced)

**Features:**
- Glass morphism container: `bg-white/90 backdrop-blur-md` with subtle border
- Container lifts on focus: `translateY(-2px)` with spring, border glow intensifies
- Textarea auto-resizes (min 24px, max 120px)
- Keyboard shortcuts: Enter to send, Shift+Enter for newline, Escape to blur
- Subtle pulse animation on first keystroke after idle
- "End interview" button with hover-to-danger transition
- Safe area aware: `padding-bottom: env(safe-area-inset-bottom)`
- Mobile: full-width, sticky bottom, keyboard-aware via `visualViewport` API

### 5.8 SendButton (Enhanced)

**Features:**
- 3-state morph using Framer Motion `layoutId`:
  - **Idle:** ArrowUp icon, indigo fill, 36px circle
  - **Processing:** Animated spinner (Loader2), same dimensions
  - **Complete:** Checkmark with spring bounce, emerald fill
- `whileTap={{ scale: 0.92 }}` for tactile feedback
- `aria-label` changes per state

### 5.9 TypingIndicator

**Features:**
- 3 staggered bouncing dots (same as spec)
- Additionally: subtle breathing scale animation on the input bar container when typing is active — creates a visual connection between "thinking" and "input area"
- `role="status"`, `aria-label="Interviewer is formulating"`

### 5.10 CursorGlow (NEW — desktop only)

**Purpose:** Soft radial glow that follows the cursor on desktop.

**Implementation:**
- Uses `onMouseMove` on the root element
- Renders a single `motion.div` with radial gradient background
- Opacity clamped to 0.03-0.05
- Position interpolated with spring physics for smooth following (stiffness: 50, damping: 30)
- Hidden on touch devices (detected via `matchMedia('(pointer: coarse)')`)
- Hidden when reduced motion is preferred

### 5.11 SparkleBurst (NEW)

**Purpose:** Aceternity Sparkles wrapper for celebration moments.

**Usage points:**
- Profile delivery (Phase 5 begins)
- Report generation complete
- Stats counter completion

**Implementation:**
- Wraps Aceternity UI `Sparkles` component
- Configurable density, color, and duration
- Fires once and cleans up (doesn't loop)
- Respects reduced motion (hidden)

### 5.12 StatsCounter (NEW)

**Purpose:** Animated number count-up for interview statistics.

**Props:** `{ value, label, duration?: 1.2 }`

**Features:**
- Uses `useSpring` from Framer Motion for smooth number interpolation
- Numbers count from 0 to target with easing
- Staggered start for multiple counters (100ms between each)

### 5.13 ReportPreview (NEW)

**Purpose:** Shows the 8 report sections as elegant cards before download.

**Features:**
- 8 section cards in a grid (2 columns on desktop, 1 on mobile)
- Each card shows section number + title
- Subtle hover reveal: gradient border appears, card lifts 2px
- Cards animate in with stagger on mount
- Gives users visibility into what the report contains

---

## 6. Report Experience (Enhanced)

### 6.1 Flow

1. **Interview completes** → Chat→Report cinematic transition
2. **Stats Summary:** 3 stats animate in with count-up: "5 phases explored · 24 questions answered · 8 domains analyzed"
3. **Report Preview:** 8 section cards appear in staggered grid
4. **Generate:** User clicks "Generate Full Report"
5. **Animated Generation:** Section titles appear one by one with staggered animations, subtle progress indicator
6. **Completion:** SparkleBurst celebration, checkmark icon springs in with emerald glow
7. **Download:** Auto-download triggers. "Download Report" button pulses gently.
8. **Exit:** "New Session" triggers graceful exit animation → Gate returns

### 6.2 Print-Styled Report

The downloaded HTML report uses premium typography:
- **Cover page:** Garamond/Georgia heading, generous whitespace, centered layout
- **Body:** Georgia 12pt, 1.6 line-height, justified text
- **Headings:** Inter 16pt/13pt, letter-spacing
- **Section dividers:** Thin rules with generous spacing
- **Page breaks:** At section boundaries
- **Footer:** Confidential notice, generation date
- **Print-ready:** `@page { size: letter; margin: 0.9in; }`

---

## 7. Accessibility Plan (WCAG 2.1 AA)

Same as original spec plus:

- All immersive animations respect `prefers-reduced-motion`
- CursorGlow hidden on touch devices and when reduced motion
- StaggeredReveal shows all content at once when reduced motion
- Cinematic transitions become instant cuts when reduced motion
- Phase color shifts are decorative only — phase info is always in text
- SparkleBurst is decorative only — aria-hidden
- Stats counters have `aria-label` with the final value

---

## 8. Performance Targets

| Metric | Target | Strategy |
|---|---|---|
| LCP | < 1.5s | Inline critical CSS, defer Aceternity/Sparkles |
| INP | < 100ms | Debounced cursor tracking, no layout thrash |
| CLS | < 0.05 | Reserve space for bubbles, fixed input bar |
| Lighthouse a11y | ≥ 95 | Semantic HTML, ARIA labels, keyboard nav |
| Lighthouse perf | ≥ 90 | Code splitting, tree shaking |
| Bundle size | < 120KB gzipped | Up from 100KB — new components, still lean |
| Time to Interactive | < 2s | Lazy load chat + report screens |

### Optimization Strategy

1. **Code split on screens** — gate loads immediately, chat and report via `React.lazy()`
2. **Aceternity tree shaking** — only Sparkles + motion primitives
3. **CursorGlow debounced** — 16ms throttle (one per frame)
4. **Ambient orbs use CSS transforms** — GPU-composited, no layout impact
5. **Self-host Inter variable font** — no Google Fonts round trip
6. **No runtime CSS-in-JS** — Tailwind compiles to static CSS

---

## 9. Mobile Experience

Same as original spec plus:

- CursorGlow disabled on touch devices
- PhaseIndicator condenses at < 375px
- CinematicPhaseChange uses simpler wipe on mobile (no zoom-blur — performance)
- ReportPreview stacks single-column on mobile
- StatsCounter smaller font on mobile
- All touch targets ≥ 44px

---

## 10. Error Handling

Same as original spec.

---

## 11. Testing Strategy

Same as original spec plus:

### New Unit Tests
- `phaseColors.js` — phase → color mapping, interpolation edge cases
- `usePhaseAmbience` — phase transition color logic

### New Component Tests
- `AmbientEnvironment` — renders orbs, respects reduced motion
- `PhaseIndicator` — phase display, progress dots
- `StaggeredReveal` — paragraph splitting, stagger delay
- `StatsCounter` — count-up animation, final value
- `ReportPreview` — section card rendering
- `ScreenTransition` — transition direction logic

---

## 12. Out of Scope

Same as original spec. Additionally:
- No sound design
- No haptic feedback beyond visual simulation
- No gesture navigation (swipe between screens)
- No dark mode toggle (light-only Warm Precision aesthetic)
- No multi-language support
- No analytics or tracking

---

## 13. Deployment

Same as current: `vite build` → commit `dist/` → GitHub Pages serves it. The `API_BASE` config points to the Cloudflare Worker (unchanged URL).

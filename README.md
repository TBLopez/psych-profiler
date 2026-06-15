# Psychological Profiler

Password-protected, AI-powered psychological profiling interview tool. Share a link with someone, they enter a password, go through a structured 5-phase clinical-style interview, and receive a detailed 10+ page psychological profile report — **you never see their data**.

## Features

- **Password-gated access** — only people with the password can start
- **5-phase structured interview** — Baseline, Cognitive/Emotional, Relational, Shadow/Vulnerability, Profile Delivery
- **AI-powered** — Uses DeepSeek (deepseek-reasoner) for interview and report generation
- **Your key, your control** — Uses your DeepSeek API key, stored as Worker secret
- **Zero data leakage** — Report goes directly from the AI to the recipient
- **Minimal dark UI** — Clean chat interface inspired by Claude/ChatGPT
- **Free to host** — Cloudflare Workers + GitHub Pages (free tier)

## Architecture

```
                    ┌──────────────────────────────────────────┐
                    │              Recipient's Browser          │
                    │  (GitHub Pages: tblopez.github.io/psych..)│
                    │                                          │
                    │  ┌──────────┐    ┌────────────────────┐   │
                    │  │ Password │───▶│    Chat Interface   │   │
                    │  │  Gate    │    │  (5-phase interview) │   │
                    │  └──────────┘    └──────────┬─────────┘   │
                    │                              │             │
                    └──────────────────────────────┼─────────────┘
                                                   │ HTTPS
                                                   ▼
                    ┌──────────────────────────────────────────┐
                    │          Cloudflare Worker                │
                    │  (psych-profiler.xxxx.workers.dev)        │
                    │                                          │
                    │  ┌─────────────┐  ┌──────────────────┐   │
                    │  │  Password   │  │   AI Proxy       │   │
                    │  │  Validation │  │   (to DeepSeek)  │   │
                    │  └─────────────┘  └────────┬─────────┘   │
                    │                              │             │
                    │  ┌───────────────────────────┘             │
                    │  │  Report Generation                      │
                    │  └────────────────────────────────────     │
                    └──────────────────────────────────────────┘
                                                   │
                                                   ▼
                    ┌──────────────────────────────────────────┐
                    │          DeepSeek API                     │
                    │  (deepseek-reasoner model)                │
                    │  Your key: sk-11aa46e1c8...               │
                    └──────────────────────────────────────────┘
```

## Files

```
psych-profiler/
├── index.html                  # GitHub Pages frontend (password gate + chat + report)
├── frontend/
│   └── index.html              # Same as root (for organized reference)
├── backend/
│   ├── worker.js               # Cloudflare Worker — password, AI proxy, report gen
│   ├── wrangler.toml           # Worker config (sets deepseek-reasoner model)
│   ├── package.json            # Node.js deps (wrangler CLI)
│   └── package-lock.json       # Lockfile
├── docs/
│   ├── DEPLOY.md               # Deployment guide
│   └── psych_profiler_system_prompt.md  # The full Dr. Voss system prompt (standalone)
├── README.md                   # This file
└── .gitignore
```

## Frontend Deep Dive

The frontend is a single HTML file (`index.html`) containing:

### UI Components
- **Password Gate** — Full-screen overlay with centered input. Validates against the worker.
- **Chat Area** — Scrollable message list with avatars, labels, and formatted content
- **Typing Indicator** — Animated dots while the AI is formulating
- **Input Area** — Textarea + Send button, Enter to send, Shift+Enter for newline
- **Report Section** — Appears after Phase 5, offers "Generate Full Report" + "Download"

### JavaScript Architecture
- `STATE` object — holds password, conversation history, phase tracking
- `SYSTEM_PROMPT` — Full Dr. Marcus Voss persona (~2K tokens)
- `apiPost(endpoint, body)` — All backend calls go through this
- `doChat()` / `doGenerateReport()` — Thin wrappers for API endpoints
- `addMessage()` — Renders messages with proper formatting
- `formatContent()` — Converts markdown to HTML (code blocks, bold, paragraphs)
- `detectPhase()` — Auto-detects which phase based on AI response content
- `generateReport()` — Sends conversation to worker, gets markdown report, prompts download
- `downloadReport()` — Wraps report in print-ready HTML, triggers browser download

### Report Generation
1. User completes all 5 phases (conversation history stored in browser)
2. Clicks "Generate Full Report"
3. Frontend sends entire conversation to `/api/generate-report`
4. Worker sends conversation + expansion prompt to DeepSeek
5. DeepSeek returns 3000+ word markdown report with 12 sections
6. Frontend wraps it in print-optimized HTML (Times New Roman, letter size, page breaks)
7. Browser downloads the HTML file
8. User opens it and uses Cmd/Ctrl+P → "Save as PDF" for a print-perfect copy

## Backend Deep Dive

### Worker Endpoints

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/verify` | POST | None (password in body) | Validates password |
| `/api/chat` | POST | X-Password header | Proxies conversation to DeepSeek |
| `/api/generate-report` | POST | X-Password header | Generates expanded 10+ page report |

### `/api/verify`
```json
Request:  {"password": "ForFarook2026!!"}
Response: {"valid": true}           // 200
          {"valid": false}          // 401
```

### `/api/chat`
```json
Request:  {"messages": [{"role":"user","content":"..."}], "system": "You are..."}
Response: {"content": "Hi there!", "usage": {...}}
```

### `/api/generate-report`
```json
Request:  {"conversation": [{"role":"user","content":"..."}, {"role":"assistant","content":"..."}]}
Response: {"report": "## Psychological Profile...\n\n### I. Preliminary...", "usage": {...}}
```

### Model Used
`deepseek-reasoner` — DeepSeek's reasoning model, which shows its chain-of-thought before answering. This produces higher quality psychological analysis. Falls back to `deepseek-chat` if not configured.

### Secrets
| Secret | Purpose |
|--------|---------|
| `PASSWORD` | Access password for the interview |
| `DEEPSEEK_KEY` | Your DeepSeek API key |
| `DEEPSEEK_MODEL` | Model name (set via wrangler.toml var) |

## The Interview — 5 Phases

### Phase 1: Baseline & Rapport (5-7 questions)
Occupation, age range, relationship status, self-described personality, motivation for analysis.

### Phase 2: Cognitive & Emotional Patterns (7-10 questions)
Decision-making style, emotional regulation, stress responses, coping mechanisms, defense mechanisms, core fears and motivators.

### Phase 3: Relational & Social Dynamics (5-7 questions)
Attachment style, trust patterns, conflict communication, how they think others perceive them.

### Phase 4: Shadow & Vulnerability Probe (3-5 questions)
Regrets, shame, recurring negative patterns, what they hide from others and from themselves.

### Phase 5: Synthesis & Profile Delivery
Full 8-part structured profile delivered by the AI:
1. Executive Summary
2. Personality Architecture (Big Five, Core Drive, Cognitive Style, Emotional Regulation)
3. Defense Structure (primary mechanisms with evidence)
4. Attachment & Relational Profile
5. Stress & Coping Profile
6. Shadow Integration Areas
7. Risk & Resilience Assessment
8. Recommendations

## Full Report (Generated PDF-ready)

The expanded report includes all 5 phases above PLUS:
- I. Preliminary Observations & Interview Context
- II. Full Transcript Analysis (by Phase)
- III. Integrated Formulation
- IV. Defense Structure — Deep Analysis (table format)
- V. Core Conflict Map
- VI. Strength-Based Formulation (table)
- VII-XII: Expanded sections for every profile category

## Quick Deploy

```bash
# 1. Deploy Worker
cd ~/psych-profiler/backend
npm install
npx wrangler login
npx wrangler secret put PASSWORD          # Set: ForFarook2026!!
npx wrangler secret put DEEPSEEK_KEY      # Your DeepSeek key
npx wrangler deploy

# 2. Push frontend to GitHub Pages
cd ~/psych-profiler
git add -A
git commit -m "Initial"
git remote add origin https://github.com/YOUR_USERNAME/psych-profiler.git
git push -u origin main
# Enable Pages in repo Settings → Pages (source: main, /)

# 3. Share
# URL: https://YOUR_USERNAME.github.io/psych-profiler/
# Password: ForFarook2026!!
```

## Design Decisions

### Why Cloudflare Workers?
- **Free tier** (100k req/day) covers this easily
- **No server management** — instant deploy from CLI
- **Edge compute** — low latency worldwide
- **Environment secrets** — API key never in client code

### Why GitHub Pages?
- **Free static hosting**
- **Auto-deploys on git push**
- **HTTPS by default**

### Why DeepSeek?
- **Low cost** (~$0.01-0.05 per full interview)
- **Reasoning model** — higher quality analysis
- **No rate limits on free tier** (100% API credits for new accounts)

### Why a single HTML file?
- **Zero build step** — edit and push
- **Portable** — deploy on any static host
- **Auditable** — no hidden dependencies

## Privacy Guarantee

| Concern | How It's Handled |
|---------|------------------|
| **API key** | Stored as Cloudflare Worker secret, never in HTML |
| **Conversation data** | Held in browser memory, sent to DeepSeek via worker |
| **Report** | Generated by worker, streamed directly to browser for download |
| **No server storage** | Worker is stateless — no database, no files, no logs of content |
| **No analytics** | No cookies, no trackers, no third-party scripts |

## Costs (All Free or Near-Free)

| Service | Cost | Limits |
|---------|------|--------|
| Cloudflare Workers | Free | 100k requests/day |
| GitHub Pages | Free | 1GB storage, 100GB bandwidth/month |
| DeepSeek API | ~$0.14/1M tokens | ~$0.01-0.05 per interview |

## Password

Current: `ForFarook2026!!`
Change with: `npx wrangler secret put PASSWORD`

## The System Prompt

The full Dr. Marcus Voss persona prompt is in `docs/psych_profiler_system_prompt.md`. It was designed to produce consistent, high-quality psychological analysis by:

1. **Modeling clinical interview structure** — Phases mirror real intake sessions
2. **Enforcing one-question-at-a-time** — Prevents the AI from overwhelming the subject
3. **Active listening** — Periodic reflections confirm accuracy
4. **No premature conclusions** — Profile only revealed at the end
5. **No diagnosis** — Describes patterns, not disorders
6. **8-part profile template** — Ensures consistent, comprehensive output

## Learning Resources

The project demonstrates:
- Cloudflare Workers (JavaScript, Fetch API, CORS, Environment Variables)
- GitHub Pages deployment
- Single-page application architecture
- AI prompt engineering for structured interviews
- Password-gated access patterns
- CORS handling for cross-origin API calls
- PDF report generation from AI output
- Secure API key management

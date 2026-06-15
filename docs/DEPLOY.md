# Deployment Guide — Psychological Profiler

## Prerequisites

- [Cloudflare account](https://dash.cloudflare.com/signup) (free tier — 100k requests/day)
- [DeepSeek API key](https://platform.deepseek.com/api_keys)
- Node.js installed
- (Optional) GitHub account for Pages hosting

## Step 1: Deploy the Cloudflare Worker (Backend)

```bash
cd /Users/tony/personal-fitness-app/psych-profiler/backend

# Install wrangler
npm install

# Login to Cloudflare
npx wrangler login

# Set secrets (you'll be prompted for each)
npx wrangler secret put PASSWORD        # Enter: ForFarook2026!!
npx wrangler secret put DEEPSEEK_KEY   # Enter your DeepSeek API key

# Deploy!
npx wrangler deploy
```

After deployment, copy the worker URL (e.g., `https://psych-profiler.xxxx.workers.dev`).

## Step 2: Update Frontend

Edit `frontend/index.html` and change `API_BASE` to your worker URL:

```javascript
const API_BASE = 'https://psych-profiler.xxxx.workers.dev';
```

## Step 3: Deploy Frontend (GitHub Pages)

```bash
cd /Users/tony/personal-fitness-app/psych-profiler/frontend

# Initialize git repo
git init
git add index.html
git commit -m "Add psych profiler frontend"

# Create a new GitHub repository, then push:
# git remote add origin https://github.com/YOUR_USERNAME/psych-profiler.git
# git push -u origin main

# OR just drag the frontend/ folder to Netlify for instant deployment
```

## Step 4: Share Access

Give the recipient:
1. The **URL** (your GitHub Pages or Netlify link)
2. The **password**: `ForFarook2026!!`

They open the link, enter the password, and the interview begins.
At the end, they generate and download their report directly.
You never see their conversation or report.

## Management Commands

```bash
# Change password
npx wrangler secret put PASSWORD

# View logs
npx wrangler tail

# Delete worker
npx wrangler delete
```

## Architecture

```
Recipient's Browser ──HTTPS──▶ Cloudflare Worker ──▶ DeepSeek API
  (GitHub Pages)           (password check,       (your key,
                            AI proxy,               never exposed)
                            report generation)

Report flows: Worker → Recipient's browser (download)
You never see the data.
```

## Security

- DeepSeek API key stored as Cloudflare Worker secret — never in client-side code
- Password validated server-side
- Conversation data flows browser → Worker → DeepSeek → Worker → browser
- Report downloaded directly to recipient's machine — never stored anywhere

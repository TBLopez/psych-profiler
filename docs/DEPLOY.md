# Deployment Guide — Psychological Profiler

Complete step-by-step for deploying from scratch. If you want to clone/fork this project and deploy your own instance.

## Prerequisites

- [Cloudflare account](https://dash.cloudflare.com/signup) (free tier)
- [DeepSeek API key](https://platform.deepseek.com/api_keys)
- Node.js (v18+)
- GitHub account (for Pages hosting)

## Step 1: Deploy Cloudflare Worker (Backend)

```bash
cd ~/psych-profiler/backend

# Install dependencies (wrangler CLI)
npm install

# Login to Cloudflare — opens browser for OAuth
npx wrangler login

# Set secrets (you'll be prompted to type each value)
npx wrangler secret put PASSWORD        # Enter your password
npx wrangler secret put DEEPSEEK_KEY   # Enter your DeepSeek API key

# Deploy!
npx wrangler deploy
```

After deployment, you'll see:
```
Uploaded psych-profiler (8.27 sec)
Deployed psych-profiler triggers (4.46 sec)
  https://psych-profiler.YOUR_SUBDOMAIN.workers.dev    ← COPY THIS URL
```

## Step 2: Update Frontend API URL

Edit `~/psych-profiler/index.html` — find and replace the API_BASE constant:

```javascript
// Line ~37 — change this:
const API_BASE = 'https://psych-profiler.YOUR-SUBDOMAIN.workers.dev';

// To your actual worker URL:
const API_BASE = 'https://psych-profiler.techtony2013.workers.dev';
```

## Step 3: Deploy Frontend (GitHub Pages)

### Option A: GitHub Pages (recommended)

```bash
cd ~/psych-profiler

# The repo already has git initialized and is pushed to GitHub.
# Just enable Pages:
#   1. Go to https://github.com/YOUR_USERNAME/psych-profiler
#   2. Settings → Pages
#   3. Source: Deploy from branch
#   4. Branch: main, / (root)
#   5. Save
#   6. Wait 1-2 minutes for build
#   7. Your app is at: https://YOUR_USERNAME.github.io/psych-profiler/
```

### Option B: Netlify (drag-and-drop)

```bash
# Drag the entire ~/psych-profiler/ folder to https://netlify.com
# Netlify auto-detects it as a static site
# Gets a URL like: https://random-name-123.netlify.app
```

## Step 4: Test the Deployment

```bash
# Test password endpoint
curl -s https://psych-profiler.techtony2013.workers.dev/api/verify \
  -H "Content-Type: application/json" \
  -d '{"password":"ForFarook2026!!"}'
# Expected: {"valid":true}

# Test wrong password
curl -s https://psych-profiler.techtony2013.workers.dev/api/verify \
  -H "Content-Type: application/json" \
  -d '{"password":"wrong"}'
# Expected: {"valid":false}

# Test chat (requires valid X-Password header)
curl -s https://psych-profiler.techtony2013.workers.dev/api/chat \
  -H "Content-Type: application/json" \
  -H "X-Password: ForFarook2026!!" \
  -d '{"messages":[{"role":"user","content":"Hello"}],"system":"Say hello briefly."}'
# Expected: {"content":"Hello!","usage":{...}}

# Test frontend is live
curl -s -o /dev/null -w "HTTP %{http_code}" https://YOUR_USERNAME.github.io/psych-profiler/
# Expected: HTTP 200
```

## Step 5: Share Access

Give the recipient two things:

1. **The URL:** `https://YOUR_USERNAME.github.io/psych-profiler/`
2. **The password:** `ForFarook2026!!`

They open the link, enter the password, and the interview begins.
At the end, they generate and download their report.
**You never see their conversation or report.**

## Management

### Change the password
```bash
cd ~/psych-profiler/backend
npx wrangler secret put PASSWORD
# Enter the new password at the prompt
```

### View worker logs
```bash
npx wrangler tail
```

### Update the worker code
```bash
# Edit worker.js, then:
npx wrangler deploy
```

### Delete the worker
```bash
npx wrangler delete
```

### Update the frontend
```bash
# Edit index.html, then:
git add index.html
git commit -m "Update frontend"
git push
# Wait ~1 minute for GitHub Pages to rebuild
```

## Troubleshooting

### "Cannot reach server" error
- Check that `API_BASE` in index.html matches your actual worker URL
- Verify the worker is deployed: `npx wrangler deploy`
- Check CORS: the worker should return `Access-Control-Allow-Origin: *`

### "401 Unauthorized" from API
- Make sure `X-Password` header is being sent correctly
- Verify the password matches what was set with `wrangler secret put PASSWORD`

### DeepSeek API errors
- Verify your API key: `npx wrangler secret list`
- Check DeepSeek credits at https://platform.deepseek.com
- The model defaults to `deepseek-reasoner` — ensure it's available on your account

### GitHub Pages not updating
- Check the Pages build status in repo Settings → Pages
- Make sure the file is pushed to the correct branch
- It can take 1-2 minutes after push

## Architecture

```
┌─────────────────────┐     ┌──────────────────┐     ┌──────────────┐
│  GitHub Pages       │     │  Cloudflare      │     │  DeepSeek    │
│  (Static HTML/JS)   │────▶│  Worker          │────▶│  API         │
│                     │     │  (Edge compute)  │     │  (AI model)  │
│  • Password gate    │     │  • Auth          │     │              │
│  • Chat UI          │     │  • Proxy         │     │  deepseek-   │
│  • Report download  │     │  • Report gen    │     │  reasoner    │
└─────────────────────┘     └──────────────────┘     └──────────────┘
```

## Security

- **API key** stored as Cloudflare Worker secret — never in client-side HTML
- **Password** validated server-side, never exposed
- **All traffic** over HTTPS
- **No data stored** — worker is stateless, no database
- **Report delivered directly** to recipient's browser via download
- **No analytics** — no cookies, no trackers, no third-party scripts

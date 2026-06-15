// Cloudflare Worker — Psych Profiler Backend
// Deploy: wrangler deploy  (after setting secrets)

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '*';
    const corsHeaders = {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Password, X-Session-Id',
      'Access-Control-Max-Age': '86400',
    };

    if (request.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
    if (request.method !== 'POST') return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    try {
      const url = new URL(request.url);
      const path = url.pathname;

      if (path === '/api/verify') return await handleVerify(request, env, corsHeaders);
      if (path === '/api/chat') return await handleChat(request, env, corsHeaders);
      if (path === '/api/generate-report') return await handleGenerateReport(request, env, corsHeaders);

      return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    } catch (err) {
      console.error('Worker error:', err);
      return new Response(JSON.stringify({ error: 'Internal server error', detail: err.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
  }
};

async function handleVerify(request, env, corsHeaders) {
  const { password } = await request.json();
  if (!password || !env.PASSWORD) return new Response(JSON.stringify({ valid: false }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  const valid = (password === env.PASSWORD);
  return new Response(JSON.stringify({ valid }), { status: valid ? 200 : 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
}

async function handleChat(request, env, corsHeaders) {
  const password = request.headers.get('X-Password');
  if (!password || password !== env.PASSWORD) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  const body = await request.json();
  const { messages, system } = body;
  if (!messages || !Array.isArray(messages)) return new Response(JSON.stringify({ error: 'Invalid messages format' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  const model = env.DEEPSEEK_MODEL || 'deepseek-reasoner';
  const deepseekBody = {
    model,
    messages: system ? [{ role: 'system', content: system }, ...messages] : messages,
    max_tokens: 4096,
    temperature: 0.7,
    stream: false,
  };

  const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${env.DEEPSEEK_KEY}` },
    body: JSON.stringify(deepseekBody),
  });

  if (!response.ok) { const err = await response.text(); return new Response(JSON.stringify({ error: 'AI API error', status: response.status, detail: err.substring(0, 500) }), { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }); }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content || '';
  return new Response(JSON.stringify({ content: text, usage: data.usage }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
}

async function handleGenerateReport(request, env, corsHeaders) {
  const password = request.headers.get('X-Password');
  if (!password || password !== env.PASSWORD) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  const body = await request.json();
  const { conversation } = body;
  if (!conversation || !Array.isArray(conversation) || conversation.length < 2) return new Response(JSON.stringify({ error: 'Insufficient conversation data' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  const systemPrompt = `You are a senior behavioral analyst with 20+ years of experience in forensic psychological profiling. You are generating a comprehensive 10+ page psychological profile report based on a structured interview.`;

  const expandPrompt = `Based on the complete interview conversation below, generate an expanded, detailed 10+ page psychological profile report. Include ALL of the following sections with deep clinical analysis:

## Full Report Structure

### Cover Page
Psychological Profile — Confidential | [Current Date]

### I. Preliminary Observations & Interview Context
How the subject presented, communication style, rapport quality, willingness, defenses observed.

### II. Full Transcript Analysis (by Phase)
For each of the 5 phases, include every question and answer with clinical observations. Analyze each response.

### III. Integrated Formulation
Central developmental narrative. Core conflict map. How past connects to present.

### IV. Defense Structure — Deep Analysis
Table: Defense | Rank | Manifestation | Adaptiveness | Risk. Cover at least 4-5 defenses.

### V. Core Conflict Map
Pole A vs Pole B of the central tension. Secondary conflicts.

### VI. Strength-Based Formulation
Table: Strength | Manifestation | Leverage Point. At least 6-8 strengths.

### VII. Attachment & Relational Profile (Expanded)
Deep analysis of relational patterns, attachment style, communication patterns.

### VIII. Stress & Coping Profile (Expanded)
Stress reactivity, coping strategies, maladaptive patterns.

### IX. Shadow Integration Areas
Blind spots, unowned traits, recurring self-sabotage patterns.

### X. Risk & Resilience Assessment
Protective factors, risk factors, overall resilience with justification.

### XI. Recommendations — Expanded
Therapeutic modalities with rationale. Behavioral experiments (specific). Reflection prompts.

### XII. Prognostic Summary
Prognosis, key risks, key strengths, next steps.

Write the FULL report in markdown format. Be thorough — use clinical language. Go deep on every section. Write at least 3000+ words.

Here is the conversation:
${JSON.stringify(conversation, null, 2)}`;

  const model = env.DEEPSEEK_MODEL || 'deepseek-reasoner';
  const deepseekBody = {
    model,
    messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: expandPrompt }],
    max_tokens: 8192,
    temperature: 0.5,
    stream: false,
  };

  const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${env.DEEPSEEK_KEY}` },
    body: JSON.stringify(deepseekBody),
  });

  if (!response.ok) { const err = await response.text(); return new Response(JSON.stringify({ error: 'Report generation failed', detail: err.substring(0, 500) }), { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }); }

  const data = await response.json();
  const reportMarkdown = data.choices?.[0]?.message?.content || '';
  return new Response(JSON.stringify({ report: reportMarkdown, usage: data.usage }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
}

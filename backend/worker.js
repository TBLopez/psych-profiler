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

  // Use fast model for real-time conversation
  const model = 'deepseek-chat';
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

  const systemPrompt = `You are a senior behavioral analyst with 20+ years of experience in forensic psychological profiling (FBI BAU tradition), psychodynamic assessment, cognitive-behavioral formulation, and cross-cultural personality psychology. You are generating a comprehensive, academically-grounded psychological profile report based on a structured clinical interview. Your analysis draws on empirically validated frameworks: the Big Five (OCEAN) / HEXACO personality models, attachment theory (Bowlby, Ainsworth, Bartholomew), defense mechanism classification (Vaillant, DSM-5-TR Levels of Defensive Functioning), cognitive-behavioral theory (Beck, Ellis), psychodynamic formulation (McWilliams, Kernberg), and narrative identity theory (McAdams). Reference these frameworks by name when they inform your analysis.`;

  const expandPrompt = `Based on the complete interview conversation below, generate a comprehensive 15+ page psychological profile report. This must be thorough, clinically-informed, and analytically rigorous. Include ALL of the following sections with deep analysis. Write at least 4000+ words.

## Report Structure

### Cover Page
Psychological Profile — Confidential | [Current Date]
"Not a clinical diagnosis or formal psychological evaluation. This profile is a structured behavioral analysis based on a single-session interview."

---

### I. Preliminary Observations & Interview Context
How the subject presented. Communication style (verbal fluency, coherence, emotional expressiveness, guardedness). Rapport quality and willingness to disclose. Defenses observed during the interview itself (humor, intellectualization, minimization, deflection, etc.). First impressions and how they shifted. What the subject chose to lead with and what that signals.

---

### II. Transcript Analysis by Phase
For each of the 5 interview phases, include the actual questions asked and answers given (paraphrased with key direct quotes), followed by clinical observations. Analyze what each response reveals — not just content but process: what is emphasized, what is omitted, emotional tone, cognitive style, defensive patterns visible in the response structure. Connect observations to the frameworks named above.

**Phase 1 — Baseline & Rapport:** Surface identity, life context, motivation for the interview.
**Phase 2 — Cognitive & Emotional Patterns:** Decision-making, emotional regulation, stress responses, coping, core fears and drives.
**Phase 3 — Relational & Social Dynamics:** Attachment patterns, trust, conflict style, interpersonal perception.
**Phase 4 — Shadow & Vulnerability:** Regrets, shame, hidden patterns, self-sabotage, what is avoided.
**Phase 5 — Synthesis & Profile Delivery:** The profile itself as delivered to the subject.

---

### III. Integrated Formulation
A coherent clinical narrative that synthesizes findings across all domains into a unified psychological portrait. The central developmental narrative — how did this person become who they are? Core conflict map — what is the central tension driving their psychology? How does past experience shape present functioning? What is the organizing theme of their personality?

---

### IV. Personality Architecture (with Evidence)
- **Big Five / HEXACO Profile Table:** Trait | Estimated Level (Low/Average/High) | Interview Evidence
- **Core Drive:** What fundamentally motivates this person? Achievement, affiliation, power, understanding, autonomy, security, or something else? Cite evidence.
- **Cognitive Style:** How they process information and make decisions. Concrete vs abstract. Fast vs deliberate. System 1 vs System 2 dominance.
- **Emotional Regulation Profile:** How emotions are experienced, expressed, and managed. Regulatory strategies used.

---

### V. Defense Structure — Deep Analysis
Table: Defense Mechanism | Prominence (1-5) | Manifestation in Interview | Adaptiveness (Mature/Neurotic/Immature) | Risk if Overused
Cover at least 4-5 defenses. Explain each with specific examples from the conversation. Classify using the DSM-5-TR Levels of Defensive Functioning scale.

---

### VI. Core Conflict Map
Identify and analyze the central psychological conflict:
- **Primary Polarity:** Pole A vs Pole B of the core tension (e.g., intimacy vs autonomy, control vs vulnerability, achievement vs connection)
- **Secondary Conflicts:** 2-3 additional tensions
- **Conflict Origins:** Developmental roots of each conflict
- **Current Manifestation:** How each conflict plays out in present life

---

### VII. Strength-Based Formulation
Table: Strength | Manifestation in Interview | How to Leverage for Growth
Identify at least 6-8 genuine strengths. Be specific — not generic praise. Connect each strength to growth opportunities.

---

### VIII. Attachment & Relational Profile
- **Attachment Style:** Pattern description with evidence (not just a label). Reference Bartholomew's four-category model or Brennan's dimensional model.
- **Trust Formation:** How trust is built, tested, and repaired.
- **Conflict Footprint:** How they navigate disagreement. Conflict avoidance vs confrontation. Repair capacity.
- **Interpersonal Perception Gap:** How they believe others see them vs how they likely come across. Discrepancies and their implications.
- **Relational Patterns:** Recurring themes across relationships. Partner selection patterns. Friendship dynamics.

---

### IX. Stress & Coping Profile
- **Stress Reactivity:** What triggers stress? Physiological/cognitive/emotional indicators.
- **Primary Coping Strategies:** Problem-focused, emotion-focused, meaning-focused, avoidance.
- **Maladaptive Patterns:** Coping strategies that maintain or worsen problems.
- **Resilience Resources:** What protects this person? Social support, meaning-making, self-efficacy, etc.

---

### X. Shadow Integration
- **Blind Spots:** What the subject cannot see about themselves, with evidence from the interview.
- **Unowned Traits:** Positive and negative traits the subject disowns or minimizes.
- **Recurring Self-Sabotage:** Patterns the subject describes but may not recognize as self-generated.
- **Growth Edge:** Where the most potential for integration and development lies. What is trying to emerge?

---

### XI. Risk & Resilience Assessment
- **Protective Factors:** What keeps this person well? (Internal and external)
- **Risk Factors:** What threatens their wellbeing? (Internal and external)
- **Crisis Risk:** Low/Moderate/Elevated with justification.
- **Overall Resilience:** Assessment with specific rationale.

---

### XII. Recommendations
- **Therapeutic Modalities:** 2-3 therapeutic approaches with specific rationale for why each fits this particular profile. Reference modalities by name (CBT, psychodynamic, DBT, ACT, IFS, EMDR, somatic, etc.).
- **Behavioral Experiments:** 3-4 specific, actionable experiments the subject can try in daily life, designed to test and expand their psychological flexibility.
- **Self-Reflection Prompts:** 4-5 deep journaling or reflection questions tailored to their specific profile.
- **Growth Practices:** Daily or weekly practices aligned with their personality architecture.

---

### XIII. Prognostic Summary
Prognosis for growth and change. Key risks to manage. Key strengths to leverage. What the next 1-2 years of intentional development could look like for this person.

---

### XIV. Recommended Reading
Based on the subject's specific psychological profile, recommend 5-7 books that would be genuinely illuminating for them. These should be curated to their particular personality architecture, defense structure, relational patterns, and growth edges. For each book, include:
- **Title** by Author
- **Why this book for you:** A 2-3 sentence explanation connecting the book's content to specific aspects of the subject's profile. Be direct and personal — explain what they might recognize about themselves in this book.

Choose from respected works in psychology, neuroscience, attachment theory, trauma, personality, relationships, and personal development. Prioritize books by credentialed authors (clinical psychologists, researchers, psychiatrists). Include a mix of:
- 2-3 books addressing their core psychological patterns
- 1-2 books addressing their relational/attachment style
- 1-2 books on personal growth aligned with their specific growth edge
- Consider including one work of fiction or memoir that mirrors their psychological journey

---

Write the COMPLETE report in markdown format. Use clinical language throughout. Be specific, not vague. Use direct quotes from the conversation as evidence. Every claim must be supported. Do not flatter or pull punches — accuracy over comfort. Write at least 4000 words.

Here is the conversation:
${JSON.stringify(conversation, null, 2)}`;

  // Use reasoning model for deep report analysis
  const model = 'deepseek-reasoner';
  const deepseekBody = {
    model,
    messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: expandPrompt }],
    max_tokens: 16384,
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

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

// routes/ai.js — Ollama version (CommonJS, fixed)
const express = require('express');
const router = express.Router();

// ENV
// OLLAMA_URL   e.g. http://localhost:11434/api/chat   (or https://ollama.yourdomain.com/api/chat)
// OLLAMA_MODEL e.g. mistral / llama3 / llama3.1:8b-instruct / qwen2.5, etc.
// OLLAMA_BASIC_AUTH (optional) base64 "user:pass" if you protected the proxy with Basic Auth
const OLLAMA_URL   = (process.env.OLLAMA_URL   || 'http://localhost:11434/api/chat').trim();
const OLLAMA_MODEL = (process.env.OLLAMA_MODEL || 'mistral').trim();

const DIVING_SYSTEM_PROMPT = `
You are "Dive AI" — a scuba-diving assistant.
Answer in short, clear sentences. If safety is relevant, mention limits briefly.
Avoid long explanations. Be concise and practical.
`.trim();

/**
 * Call Ollama chat API (expects OpenAI-style messages)
 * @param {Array<{role:'system'|'user'|'assistant', content:string}>} messages
 * @param {AbortSignal} signal
 */
async function callOllama(messages, signal) {
  const headers = { 'Content-Type': 'application/json' };
  if (process.env.OLLAMA_BASIC_AUTH) {
    headers.Authorization = `Basic ${process.env.OLLAMA_BASIC_AUTH}`;
  }

  const payload = {
    model: OLLAMA_MODEL,
    messages: [{ role: 'system', content: DIVING_SYSTEM_PROMPT }, ...messages],
    stream: false,
    options: {
      temperature: 0.2
    }
  };

  const r = await fetch(OLLAMA_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
    signal
  });

  const raw = await r.text();
  if (!r.ok) {
    console.error('Ollama error', r.status, raw);
    throw new Error(`Ollama error ${r.status}: ${raw || 'Unknown'}`);
  }

  // Common shapes:
  // { message: { role, content }, ... }
  // or { choices: [{ message: { content } }] }
  // or { response: "..." } for some gateways
  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    throw new Error('Invalid JSON from Ollama');
  }

  const text =
    (data && data.message && data.message.content) ||
    (data && Array.isArray(data.choices) && data.choices[0]?.message?.content) ||
    data?.response || // some proxies
    '';

  if (!String(text).trim()) throw new Error('Empty response from Ollama');
  return String(text).trim();
}

// POST /ai/chat  { messages: [{role, content}] }
router.post('/ai/chat', async (req, res) => {
  try {
    const messages = Array.isArray(req.body?.messages) ? req.body.messages : [];
    if (messages.length === 0) {
      return res.status(400).json({ success: false, error: 'No messages provided' });
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45_000);

    const reply = await callOllama(messages, controller.signal);

    clearTimeout(timeoutId);
    res.json({ success: true, reply });
  } catch (err) {
    console.error('Dive AI error:', err?.message || err);
    const msg = err?.name === 'AbortError' ? 'AI request timed out' : (err?.message || 'AI error');
    res.status(500).json({ success: false, error: msg });
  }
});

module.exports = router;
// routes/ai.js — Multi-provider AI (Ollama, Groq, OpenAI)
const express = require('express');
const router = express.Router();

// ENV Configuration
// AI_PROVIDER: 'ollama', 'groq', or 'openai' (default: 'groq')
// For Ollama:
//   OLLAMA_URL, OLLAMA_MODEL, OLLAMA_BASIC_AUTH
// For Groq (free):
//   GROQ_API_KEY (get from https://console.groq.com)
// For OpenAI:
//   OPENAI_API_KEY
const AI_PROVIDER = (process.env.AI_PROVIDER || 'groq').trim().toLowerCase();
const OLLAMA_URL = (process.env.OLLAMA_URL || 'https://ecodive.duckdns.org/api/chat').trim();
const OLLAMA_MODEL = (process.env.OLLAMA_MODEL || 'mistral:7b-instruct-q4_K_M').trim();
const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';

const DIVING_SYSTEM_PROMPT = `
You are "Dive AI" — a scuba-diving assistant.
Answer in short, clear sentences. If safety is relevant, mention limits briefly.
Avoid long explanations. Be concise and practical.
`.trim();

/**
 * Call Groq AI (OpenAI-compatible, free and fast)
 */
async function callGroq(messages, signal) {
  if (!GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY not configured. Get one from https://console.groq.com');
  }

  const payload = {
    model: 'llama-3.1-8b-instant', // Fast and free
    messages: [{ role: 'system', content: DIVING_SYSTEM_PROMPT }, ...messages],
    temperature: 0.2,
    max_tokens: 500
  };

  const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_API_KEY}`
    },
    body: JSON.stringify(payload),
    signal
  });

  if (!r.ok) {
    const error = await r.text();
    console.error('Groq error', r.status, error);
    throw new Error(`Groq error ${r.status}: ${error || 'Unknown'}`);
  }

  const data = await r.json();
  const text = data.choices?.[0]?.message?.content || '';
  if (!text.trim()) throw new Error('Empty response from Groq');
  return text.trim();
}

/**
 * Call OpenAI
 */
async function callOpenAI(messages, signal) {
  if (!OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY not configured');
  }

  const payload = {
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'system', content: DIVING_SYSTEM_PROMPT }, ...messages],
    temperature: 0.2,
    max_tokens: 500
  };

  const r = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify(payload),
    signal
  });

  if (!r.ok) {
    const error = await r.text();
    console.error('OpenAI error', r.status, error);
    throw new Error(`OpenAI error ${r.status}: ${error || 'Unknown'}`);
  }

  const data = await r.json();
  const text = data.choices?.[0]?.message?.content || '';
  if (!text.trim()) throw new Error('Empty response from OpenAI');
  return text.trim();
}

/**
 * Call Ollama chat API (expects OpenAI-style messages)
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

  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    throw new Error('Invalid JSON from Ollama');
  }

  const text =
    (data && data.message && data.message.content) ||
    (data && Array.isArray(data.choices) && data.choices[0]?.message?.content) ||
    data?.response || '';

  if (!String(text).trim()) throw new Error('Empty response from Ollama');
  return String(text).trim();
}

/**
 * Route to the appropriate AI provider
 */
async function callAI(messages, signal) {
  switch (AI_PROVIDER) {
    case 'groq':
      return await callGroq(messages, signal);
    case 'openai':
      return await callOpenAI(messages, signal);
    case 'ollama':
      return await callOllama(messages, signal);
    default:
      throw new Error(`Unknown AI_PROVIDER: ${AI_PROVIDER}`);
  }
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

    console.log(`Using AI provider: ${AI_PROVIDER}`);
    const reply = await callAI(messages, controller.signal);

    clearTimeout(timeoutId);
    res.json({ success: true, reply });
  } catch (err) {
    console.error('Dive AI error:', err?.message || err);
    const msg = err?.name === 'AbortError' ? 'AI request timed out' : (err?.message || 'AI error');
    res.status(500).json({ success: false, error: msg });
  }
});

module.exports = router;
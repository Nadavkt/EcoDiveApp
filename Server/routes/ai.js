// routes/ai.js  — Ollama version (CommonJS)
const express = require('express');
const { options } = require('./register');
const router = express.Router();

/**
 * ENV (optional)
 * OLLAMA_URL   - default: http://localhost:11434/api/chat
 * OLLAMA_MODEL - default: mistral   (you can use 'falcon', 'llama3', etc.)
 */
const OLLAMA_URL   = (process.env.OLLAMA_URL || 'http://localhost:11434/api/chat').trim();
const OLLAMA_MODEL = (process.env.OLLAMA_MODEL || 'mistral').trim();

const DIVING_SYSTEM_PROMPT = `
You are "Dive AI" — a scuba-diving assistant.
Answer in **short, clear sentences**. If safety is relevant, mention limits briefly.
Avoid long explanations. Be concise and practical.
`;

/**
 * Call Ollama chat API
 * Expects OpenAI-style messages: [{role:'user'|'assistant'|'system', content:string}]
 */
async function callOllama(messages, signal) {
  const r = await fetch(OLLAMA_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      messages: [
        { role: 'system', content: DIVING_SYSTEM_PROMPT },
        ...messages
      ],
      stream: false,
      options: {
        temperature: 0.2, //  sets how much is going to talk 
      }
    }),
    signal
  });

  const raw = await r.text();
  if (!r.ok) {
    // Show Ollama server error to logs and bubble a clean message
    console.error('Ollama error', r.status, raw);
    throw new Error(`Ollama error ${r.status}: ${raw || 'Unknown'}`);
  }

  // Ollama returns: { message: { role, content }, ... }
  const data = JSON.parse(raw);
  const text =
    data?.message?.content ||
    data?.choices?.[0]?.message?.content || // (compat with some wrappers)
    '';

  if (!text.trim()) throw new Error('Empty response from Ollama');
  return text.trim();
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
    console.error('Dive AI error:', err.message || err);
    const msg = err.name === 'AbortError' ? 'AI request timed out' : (err.message || 'AI error');
    res.status(500).json({ success: false, error: msg });
  }
});

module.exports = router;
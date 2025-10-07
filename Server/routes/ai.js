// routes/ai.js — Hugging Face Inference API (CommonJS)
const express = require('express');
const router = express.Router();

/**
 * ENV you should set on the server:
 *  AI_PROVIDER      = 'huggingface'
 *  HF_MODEL_ID      = 'openai/gpt-oss-120b'   (or gpt-oss-20b for cheaper/faster)
 *  HF_API_KEY       = 'hf_************************'
 *  HF_API_URL       = 'https://api-inference.huggingface.co/models/<MODEL_ID>'  (optional)
 *
 * Notes:
 *  - This uses the standard HF Inference API (text-generation). It’s non-streaming.
 *  - The API may queue cold models; consider using an Inference Endpoint/provider for prod.
 */

const AI_PROVIDER = (process.env.AI_PROVIDER || 'huggingface').trim();
const HF_MODEL_ID = (process.env.HF_MODEL_ID || 'openai/gpt-oss-120b').trim();
const HF_API_URL  = (process.env.HF_API_URL || `https://api-inference.huggingface.co/models/${HF_MODEL_ID}`).trim();

// Short, diving-focused system prompt
const DIVING_SYSTEM_PROMPT = `
You are "Dive AI" — a scuba-diving assistant.
Answer in short, clear sentences. If safety is relevant, mention limits briefly.
Avoid long explanations. Be concise and practical.
`.trim();

/**
 * Build a plain prompt from chat-style messages.
 * Many HF text-generation models expect a single prompt string.
 * This simple template works across most "instruct" or chat-tuned models.
 */
function buildPrompt(messages) {
  const lines = [];
  if (DIVING_SYSTEM_PROMPT) {
    lines.push(`[system]\n${DIVING_SYSTEM_PROMPT}\n`);
  }
  for (const m of messages) {
    const role = (m.role || 'user').toLowerCase();
    if (role === 'system') {
      // merge system messages too, just in case
      lines.push(`[system]\n${m.content}\n`);
    } else if (role === 'assistant') {
      lines.push(`[assistant]\n${m.content}\n`);
    } else {
      lines.push(`[user]\n${m.content}\n`);
    }
  }
  lines.push(`[assistant]\n`); // cue the model to answer
  return lines.join('\n');
}

/**
 * Call Hugging Face Inference API (text-generation)
 * Docs: https://api-inference.huggingface.co/docs/text-generation
 */
async function callHuggingFace(messages, signal) {
  if (!HF_API_KEY) {
    throw new Error('HF_API_KEY is not set');
  }

  const prompt = buildPrompt(messages);

  const body = {
    inputs: prompt,
    // Inference parameters — tune as needed:
    parameters: {
      max_new_tokens: 512,
      temperature: 0.2,
      top_p: 0.9,
      repetition_penalty: 1.05,
      do_sample: true
    },
    // Options:
    options: {
      wait_for_model: true, // spin up if cold
      use_cache: true
    }
  };

  const r = await fetch(HF_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${HF_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body),
    signal
  });

  const raw = await r.text();

  if (!r.ok) {
    // Typical HF errors include queued model messages, 503, etc.
    console.error('HF error', r.status, raw);
    throw new Error(`HF error ${r.status}: ${raw || 'Unknown'}`);
  }

  // HF text-generation responses are usually:
  // [ { generated_text: "<prompt + completion OR just completion>" } ]
  // Some servers return objects; handle both.
  let data;
  try { data = JSON.parse(raw); } catch { /* fallthrough */ }

  let text = '';

  if (Array.isArray(data) && data.length > 0) {
    // Some backends return the whole prompt + completion in generated_text.
    const gen = data[0]?.generated_text || '';
    // Try to split out only the assistant’s part after our final cue.
    const split = gen.split('[assistant]');
    text = (split[split.length - 1] || gen).trim();
  } else if (data && typeof data === 'object') {
    // Fallback shapes
    text =
      data?.generated_text?.trim() ||
      data?.choices?.[0]?.text?.trim() ||
      data?.choices?.[0]?.message?.content?.trim() ||
      '';
  }

  if (!text) {
    // Some servers return only the "text" delta; last resort, return raw
    console.warn('HF response had no obvious text; returning raw slice');
    text = (typeof raw === 'string' ? raw.slice(0, 2000) : '').trim();
  }

  return text;
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

    // Choose provider (default = huggingface)
    let reply;
    if ((process.env.AI_PROVIDER || 'huggingface') === 'huggingface') {
      reply = await callHuggingFace(messages, controller.signal);
    } else {
      // You can keep your old Ollama function here as a fallback if you want
      throw new Error('AI_PROVIDER not supported in this build');
    }

    clearTimeout(timeoutId);
    res.json({ success: true, reply });
  } catch (err) {
    console.error('Dive AI error:', err.message || err);
    const msg = err.name === 'AbortError' ? 'AI request timed out' : (err.message || 'AI error');
    res.status(500).json({ success: false, error: msg });
  }
});

module.exports = router;
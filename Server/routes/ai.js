// routes/ai.js — Using Hugging Face JS SDK
const express = require("express");
const { HfInference } = require("@huggingface/inference");
const router = express.Router();

const hf = new HfInference(process.env.HF_API_KEY); // your token

const DIVING_SYSTEM_PROMPT = `
You are "Dive AI" — a scuba-diving assistant.
Answer in short, clear sentences. If safety is relevant, mention limits briefly.
Avoid long explanations. Be concise and practical.
`.trim();

router.post("/ai/chat", async (req, res) => {
  try {
    const messages = Array.isArray(req.body?.messages) ? req.body.messages : [];
    if (!messages.length) {
      return res.status(400).json({ success: false, error: "No messages provided" });
    }

    const lastUserMsg = messages[messages.length - 1].content;

    const result = await hf.textGeneration({
      model: process.env.HF_MODEL_ID || "openai/gpt-oss-120b",
      inputs: `${DIVING_SYSTEM_PROMPT}\nUser: ${lastUserMsg}\nAssistant:`,
      parameters: {
        temperature: 0.2,
        max_new_tokens: 300,
        repetition_penalty: 1.05,
      },
    });

    const reply =
      (Array.isArray(result) ? result[0]?.generated_text : result?.generated_text) || "No reply";

    res.json({ success: true, reply: reply.trim() });
  } catch (err) {
    console.error("Dive AI error:", err);
    res.status(500).json({ success: false, error: err.message || "AI error" });
  }
});

module.exports = router;
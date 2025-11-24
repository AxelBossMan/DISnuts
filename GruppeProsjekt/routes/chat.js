// routes/chat.js
const express = require('express');
const router = express.Router();
const OpenAI = require('openai');

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// POST /api/chat  { "prompt": "din tekst her" }
router.post('/chat', async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Missing 'prompt' in body" });
    }

    const response = await client.responses.create({
      model: 'gpt-4.1-mini',          // eller annet modellnavn
      instructions: 'You are a helpful assistant.',
      input: prompt,                  // dette er "prompten"
    });

    // hent ren tekst ut av svaret
    console.log('ChatGPT response:', response);
    const text = response.output[0].content[0].text;

    res.json({ reply: text });
  } catch (err) {
    console.error('ChatGPT error:', err);
    res.status(500).json({ error: 'ChatGPT request failed' });
  }
});

  async function askChatGPT(prompt) {
    const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  });

  const data = await res.json();
  console.log('Svar fra ChatGPT:', data.reply);
}

module.exports = {router, askChatGPT };

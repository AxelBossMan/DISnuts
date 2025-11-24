// routes/chat.js
const express = require('express');
const router = express.Router();
const OpenAI = require('openai');

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// POST /api/chat  { "prompt": "din tekst her" }
router.post('/', async (req, res) => {
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

module.exports = router

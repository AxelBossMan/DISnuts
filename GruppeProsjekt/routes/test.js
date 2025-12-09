const express = require('express');
const router = express.Router();

//test router
router.get('/', function(req, res, next) {
  res.send(req.session);
});

module.exports = router;



router.post('/', async (req, res) => {
    const { prompt } = req.body;

    const response = await client.responses.create({
      model: 'gpt-4.1-mini',         
      instructions: 'You are a helpful assistant.',
      input: prompt,                 
    });
    const text = response.output[0].content[0].text;
    res.json({ reply: text });
  });
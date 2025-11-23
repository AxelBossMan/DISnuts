const express = require("express");
const router = express.Router();
const twilio = require("twilio");
require("dotenv").config();


const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);


router.post("/send", async (req, res) => {
  const intro = req.body.intro || "";          
  const keywords = req.body.keywords || []; 

  let bodyText = intro;

  if (keywords.length > 0) {
    bodyText += "\n\nAvailable keywords:\n";
    keywords.forEach(k => {
      bodyText += `• ${k.word}\n`;
    });
  }

  try {
    const message = await client.messages.create({
      from: process.env.TWILIO_PHONE_NUMBER,
      to: process.env.TWILIO_PHONE_RECIPIENT,
      body: bodyText
    });

    res.json({ success: true, sid: message.sid });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;

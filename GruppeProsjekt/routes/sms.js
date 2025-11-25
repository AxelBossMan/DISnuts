const express = require("express");
const router = express.Router();
const twilio = require("twilio");
require("dotenv").config();


const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// In-memory storage for siste sendte pairs (WORD -> answer)
// Frontend sender payload.keywords som et objekt: {WORD: answer}
let lastPairs = {};
let bodyText = "";

router.post("/save", async (req, res) => {
  const intro = req.body.intro || "";
  const keywords = req.body.keywords || {};
  lastPairs = keywords;

  bodyText = intro;
  const words = Object.keys(keywords || {});
  if (words.length > 0) {
    bodyText += "\n\nAvailable keywords:\n";
    words.forEach(w => {
      bodyText += `• ${w}\n`;
    });
  }
  console.log("keywords saved for sending:", keywords);
  // Return the composed bodyText so frontend/network tab can show it
  res.json({ success: true, bodyText: bodyText });
});

router.post("/send", async (req, res) => {
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

/*
  INCOMING SMS / KEYWORD HANDLING
*/
router.post("/incoming",
  express.json(),
  express.urlencoded({ extended: true }),
  async (req, res) => {
    try {
      const incomingBody = (req.body.Body || req.body.body || "").toString().trim();
      const from = req.body.From || req.body.from || "unknown";

      console.log("[sms.js] Incoming:", incomingBody);

      const key = incomingBody.toUpperCase();

      if (lastPairs && lastPairs[key]) {
        let reply = `Keyword ${key}:\n${lastPairs[key]}`;

        const msg = await client.messages.create({
          from: process.env.TWILIO_PHONE_NUMBER,
          to: from,
          body: reply
        });

        return res.json({ success: true, matched: key, sid: msg.sid });
      }

      return res.json({ success: true, matched: false });

    } catch (err) {
      console.error("[sms.js] Incoming error:", err);
      return res.status(500).json({ success: false, error: err.message });
    }
  }
);

module.exports = router;
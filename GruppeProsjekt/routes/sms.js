const express = require("express");
const router = express.Router();
const twilio = require("twilio");
require("dotenv").config();

const db = require("../database/sql");


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

// Enkel endpoint for å sjekke hvilke meldinger som kommer fra bruker
// Mountes på /api/incoming (fordi router er mountet i app.js på /api)
router.post("/incoming",
  // Støtte for både JSON og urlencoded (Twilio kan poste urlencoded)
  express.json(),
  express.urlencoded({ extended: true }),

  async (req, res) => {
    try {
      // Twilio/WhatsApp sender meldingen i 'Body' og avsender i 'From'
      const incomingBody = (req.body.Body || req.body.body || "").toString().trim();
      const from = req.body.From || req.body.from || "unknown";

      console.log("[sms.js] POST /api/incoming from:", from);
      console.log("[sms.js] POST /api/incoming body:", incomingBody);

      const key = incomingBody.toUpperCase();

      if (lastPairs && lastPairs[key]) {
        let reply = lastPairs[key];
        console.log(`[sms.js] Matched '${key}' -> replying with:`, reply);
        reply =`Keyword ${key}:` + `\n` + reply

        try {
          const msg = await client.messages.create({
            from: process.env.TWILIO_PHONE_NUMBER,
            to: from,
            body: reply
          });

          console.log("[sms.js] Reply sent, sid:", msg.sid);
          return res.json({ success: true, matched: key, sid: msg.sid });
        } catch (sendErr) {
          console.error("[sms.js] Error sending reply:", sendErr.message);
          return res.status(500).json({ success: false, error: sendErr.message });
        }
      }

      console.log("[sms.js] No matching keyword for incoming message.");
      return res.json({ success: true, matched: false, received: req.body });
    } catch (err) {
      console.error("[sms.js] Error handling incoming:", err);
      return res.status(500).json({ success: false, error: err.message });
    }  
  }
);

module.exports = router;

const express = require("express");
const router = express.Router();
const twilio = require("twilio");
require("dotenv").config();
const config = require('../database/sqlconfig');       
const { createDatabaseConnection } = require('../database/database'); 


// Sett opp db-tilkobling
// Bruker SQL-klassen (ikke database.js lenger)
const db = require("../database/sql");

// Sett opp Twilio-klient
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// In-memory storage for keywords
let lastPairs = {};
let bodyText = "";

/*
  SAVE TEMPLATE
*/
router.post("/save", async (req, res) => {
  const intro = req.body.intro || "";
  const keywords = req.body.keywords || {};
  lastPairs = keywords;

  bodyText = intro;
  const words = Object.keys(keywords || {});
  if (words.length > 0) {
    bodyText += "\n\nAvailable keywords:\n";
    words.forEach(w => { bodyText += `• ${w}\n`; });
  }

  console.log("[sms.js] Template saved:", keywords);
  res.json({ success: true, bodyText });
});

/*
  SCHEDULE MESSAGE og sende til database tabellen eller sende med en gang
*/
router.post("/send", async (req, res) => {
  try {
    const { intro, keywords, schedule, event_id } = req.body;

    console.log("[/send] incoming payload:", { intro, keywords, schedule, event_id });

    if (!event_id) {
      return res.status(400).json({ success: false, error: "Missing event_id" });
    }

    const event = await db.readOneEvent(event_id);
    if (!event) {
      return res.status(404).json({ success: false, error: "Event not found" });
    }

    const eventTime = new Date(event.time);
    console.log("[/send] event.time:", event.time, "->", eventTime);

    // ---- beregn sendTime på en SAFE måte ----
    const sched = (schedule || "").toString().trim();  // normaliser
    let sendTime;

    if (sched === "now" || sched === "") {
      // send nå -> registrer nåtid i scheduled_messages
      sendTime = new Date();
    } else if (sched === "1h") {
      sendTime = new Date(eventTime.getTime() - 1000 * 60 * 60);
    } else if (sched === "12h") {
      sendTime = new Date(eventTime.getTime() - 1000 * 60 * 60 * 12);
    } else if (sched === "24h") {
      sendTime = new Date(eventTime.getTime() - 1000 * 60 * 60 * 24);
    } else {
      // custom verdi fra frontend – prøv å parse
      sendTime = new Date(sched);
    }

    // viktig: valider før toISOString()
    if (!(sendTime instanceof Date) || isNaN(sendTime.getTime())) {
      console.error("[/send] INVALID sendTime. schedule =", sched, "computed =", sendTime);
      return res.status(400).json({
        success: false,
        error: "Invalid time value for schedule: " + sched
      });
    }

    console.log("[/send] using sendTime:", sendTime.toISOString());

    // lagre jobben i DB
    await db.create(
      {
        event_id,
        intro,
        keywords: JSON.stringify(keywords || {}),
        send_time: sendTime.toISOString(),
        status: "scheduled"
      },
      "scheduled_messages"
    );

    // Hent alle deltakere
    const recipients = await db.getRecipientsForEvent(event_id);
    console.log("[/send] recipients:", recipients);

    if (!recipients || recipients.length === 0) {
      return res.json({
        success: true,
        message: "Message scheduled, but no recipients",
        scheduled: true,
        sentTo: 0
      });
    }

    const fromNumber = process.env.TWILIO_PHONE_NUMBER;
    const sent = [];

    // BYGG meldingen vi faktisk skal sende: bruk bodyText (fra /save)
    let smsBody = bodyText;
    if (!smsBody || smsBody.trim() === "") {
      // fallback hvis /save ikke har blitt kalt
      smsBody = intro || "";
      const words = Object.keys(keywords || {});
      if (words.length > 0) {
        smsBody += "\n\nAvailable keywords:\n";
        words.forEach(w => { smsBody += `• ${w}\n`; });
      }
    }

    if (sched === "now" || sched === "") {
      // send med en gang
      for (const r of recipients) {
        if (!r.phone_number) continue;
        
        const msg = await client.messages.create({
          from: fromNumber,
          to: "whatsapp:"+r.phone_number,
          body: smsBody
        });
        console.log(fromNumber, r.phone_number, msg)
        sent.push({ user_id: r.user_id, to: r.phone_number, sid: msg.sid });
      }

      return res.json({
        success: true,
        type: "sent_now",
        message: "Message sent instantly",
        sentTo: sent.length,
        details: sent
      });
    }

    // ikke "now" → bare scheduled, ingen SMS sendt enda
    return res.json({
      success: true,
      type: "scheduled",
      message: "Message scheduled",
      sendTime: sendTime.toISOString()
    });

  } catch (err) {
    console.error("SEND ERROR:", err);
    return res.status(500).json({ success: false, error: err.message });
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

      const db = await createDatabaseConnection(config);
            // sett inn db her 
      await db.create({
        message: incomingBody,
        from_number: from,
        matched_word: key, 
      }, 
      "message_log"
    )
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
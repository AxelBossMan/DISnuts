const express = require("express");
const router = express.Router();
const twilio = require("twilio");
require("dotenv").config();

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

router.post("/send", async (req, res) => {
  //Sender en test melding
  try {
    const message = await client.messages.create({
      from: process.env.TWILIO_PHONE_NUMBER,
      to: process.env.TWILIO_PHONE_RECIPIENT,
      body: "Test melding!"
    });

    res.json({ success: true, sid: message.sid });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Webhook som mottar innkommende meldinger fra Twilio (WhatsApp eller SMS)
// Twilio sender som application/x-www-form-urlencoded (Body, From, To, etc.).
// Denne ruten svarer direkte med TwiML for å sende et automatisert svar.
router.post('/incoming', (req, res) => {
  try {
    console.log(req.body);
    const incomingBody = req.body.body;
    const from = req.body.from;
    const to = req.body.to;

    console.log('Incoming message received:', { from, to, body: incomingBody });

    // Enkel regelforståelse — du kan gjøre dette så avansert du vil
    const text = (req.body.body || '').toString().trim().toLowerCase();
    let reply = "Respons!";


    // Bruk TwiML for å svare direkte på webhook-kallet
    const MessagingResponse = twilio.twiml.MessagingResponse;
    const twiml = new MessagingResponse();
    twiml.message(reply);

    res.writeHead(200, { 'Content-Type': 'text/xml' });
    res.end(twiml.toString());
  } catch (err) {
    console.error('Error handling incoming webhook:', err);
    res.status(500).send('Server error');
  }
});

module.exports = router;
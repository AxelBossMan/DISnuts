// cron.js – sjekk hver time om en melding skal sendes
const cron = require("node-cron");
const twilio = require("twilio");
const { createDatabaseConnection } = require("./database/database");
const config = require("./database/sqlconfig");

// Sett opp Twilio-klient
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

(async () => {
  const db = await createDatabaseConnection(config);

  console.log("Cron: Database connected");

  // Kjør hver time på minutt 0
  cron.schedule("0 * * * *", async () => {
    console.log("Cron: Checking scheduled messages…");

    // Hent meldinger som skal sendes
    const dueMessages = await db.readAll(`
      SELECT * FROM scheduled_messages
      WHERE status='scheduled'
      AND send_time <= GETDATE()
    `);

    if (dueMessages.length === 0) {
      console.log("Cron: No messages to send this hour.");
      return;
    }

    for (let msg of dueMessages) {
      try {
        // Send SMS
        await client.messages.create({
          from: process.env.TWILIO_PHONE_NUMBER,
          to: process.env.TWILIO_PHONE_RECIPIENT,
          body: msg.intro
        });

        // Sett melding som sendt
        await db.query(`
          UPDATE scheduled_messages
          SET status = 'sent'
          WHERE id = ${msg.id}
        `);

        console.log("Cron: Message sent:", msg.id);

      } catch (err) {
        console.error("Cron: Error sending message:", err.message);

        // Oppdater status til error
        await db.query(`
          UPDATE scheduled_messages
          SET status='error'
          WHERE id=${msg.id}
        `);
      }
    }
  });
})();
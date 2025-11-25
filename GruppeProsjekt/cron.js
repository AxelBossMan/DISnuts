// cron.js – sjekk hver time om meldinger skal sendes

const cron = require("node-cron");
const twilio = require("twilio");
const { createDatabaseConnection } = require("./database/database");
const config = require("./database/sqlconfig");

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

(async () => {
  const db = await createDatabaseConnection(config);
  console.log("Cron running... DB connected");

  // hver time på minutt 0
  cron.schedule("0 * * * *", async () => {
    console.log("Checking scheduled messages…");

    const due = await db.readAll(`
      (SELECT * FROM scheduled_messages
       WHERE status='scheduled'
       AND send_time <= GETDATE())
    `);

    if (due.length === 0) {
      console.log("Nothing to send.");
      return;
    }

    for (let msg of due) {
      try {
        // SEND SMS HER
        await client.messages.create({
          from: process.env.TWILIO_PHONE_NUMBER,
          to: process.env.TWILIO_PHONE_RECIPIENT,
          body: msg.intro
        });

        // oppdater status
        await db.query(`
          UPDATE scheduled_messages
          SET status='sent'
          WHERE id=${msg.id}
        `);

        console.log("Sent message:", msg.id);

      } catch (err) {
        console.error("Error sending message:", err.message);

        await db.query(`
          UPDATE scheduled_messages
          SET status='error'
          WHERE id=${msg.id}
        `);
      }
    }
  });
})();
// scheduler.js
require("dotenv").config(); // <-- viktig for standalone kjøring også !!

const db = require("./database/sql");
const twilio = require("twilio");

console.log("FROM IN SCHEDULER:", process.env.TWILIO_PHONE_NUMBER);

function getTwilioClient() {
    return twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
    );
}



async function checkMessagesDue() {
  console.log("Scheduler kjører: ", new Date().toISOString());
  
  const client = getTwilioClient();

  const jobs = await db.raw(`
    SELECT * FROM dbo.scheduled_messages
    WHERE status = 'scheduled'
    AND send_time <= GETDATE()
  `);

  if (jobs.length === 0) {
    console.log("[Scheduler] No messages ready.");
    return;
  }

  console.log(`[Scheduler] Found ${jobs.length} messages to send.`);

  for (const job of jobs) {

    const recipients = await db.getRecipientsForEvent(job.event_id);

    const fromNumber = process.env.TWILIO_PHONE_NUMBER;
    const smsBody = job.intro;

    for (const r of recipients) {
      if (!r.phone_number) continue;

      const msg = await client.messages.create({
        from: fromNumber,
        to: "whatsapp:" + r.phone_number,
        body: smsBody
      });

      console.log("[Scheduler] Sent to:", r.phone_number);
    }

    await db.raw(`
      UPDATE dbo.scheduled_messages
      SET status='sent'
      WHERE id=${job.id}
    `);

    console.log(`[Scheduler] Job ${job.id} finished.`);
  }
}
// Kjører funkjson hvert minutt for å sjekke etter meldinger som skal sendes
setInterval(checkMessagesDue, 60 * 1000);

console.log("Scheduler started.");
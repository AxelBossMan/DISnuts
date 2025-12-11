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
  // ta vekk kommentaren under for å se at scheduler kjører
  // console.log("Scheduler kjører: ", new Date().toISOString());
  
  const client = getTwilioClient();

    //INPUT?????????????????????????????????????????????????????????????
  const jobs = await db.raw(`
    SELECT * FROM dbo.scheduled_messages
    WHERE status = 'scheduled'
    AND send_time <= GETDATE()
  `);

  if (jobs.length === 0) {
    //ta vekk kommentaren under for å se at scheduler kjører
    // console.log("[Scheduler] No messages ready.");
    return;
  }

  console.log(`[Scheduler] Found ${jobs.length} messages to send.`);

  for (const job of jobs) {

    const recipients = await db.getRecipientsForEvent(job.event_id);

    const fromNumber = process.env.TWILIO_PHONE_NUMBER;
    
    // Lag selve meldingen med intro + keywords
    let smsBody = job.intro || "";
    console.log("RAW DB KEYWORDS:", job.keywords);

    // Parse keywords (lagres som JSON-string i DB)
    let keywords = {};
    try {
      keywords = JSON.parse(job.keywords || "{}");
    } catch (e) {
      console.error("Could not parse keywords:", e);
      keywords = {};
    }

    
    // Hvis det finnes keywords, legg dem til meldingen
    const wordList = Object.keys(keywords);

    if (wordList.length > 0) {
      smsBody += "\n\nAvailable keywords:\n";
      for (const w of wordList) {
        smsBody += `• ${w}\n`;
      }

      // SUPER VIKTIG → WhatsApp krever at meldingen ikke ender med \n
      smsBody += " ";   // <- legg til en space slik at meldingen ikke blir trimmet
    }


    for (const r of recipients) {
      if (!r.phone_number) continue;
      console.log("======== SCHEDULER SMS BODY ========");
      console.log(JSON.stringify(smsBody, null, 2));
      console.log("====================================");
      
      const msg = await client.messages.create({
        from: fromNumber,
        to: "whatsapp:" + r.phone_number,
        body: smsBody
      });

      console.log("[Scheduler] Sent to:", r.phone_number);
    }
    //INPUT?????????????????????????????????????????????????????????????
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
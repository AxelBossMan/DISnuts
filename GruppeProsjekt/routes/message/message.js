
const twilio = require("twilio");
require('dotenv').config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

async function createText() {
  const message = await client.messages.create({
    from: process.env.TWILIO_PHONE_NUMBER,
    to: process.env.TWILIO_PHONE_RECIPIENT,
    body: "Det virker!!!"
  });

  console.log(message.sid);
}

createText();
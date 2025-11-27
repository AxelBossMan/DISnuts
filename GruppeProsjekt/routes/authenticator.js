
const express = require("express");
const router = express.Router();
const {body, validationResult} = require("express-validator");
const rateLimit = require('express-rate-limit');
const { hashPassword, verifyPassword } = require("../crypto/hashing");
const { encrypt_phoneNumber, decrypt_phoneNumber } = require("../crypto/symmetricCrypto");
// Use MailerSend instead of nodemailer for sending emails
const { MailerSend, Sender, Recipient, EmailParams } = require('mailersend');

let db = require("../database/sql");


const twoFactorCodes = {};

const loginLimiter = rateLimit({
    windowMs: 1* 10 * 1000, // 10 seconds
    limit: 3, // limit each IP to 100 requests per windowMs
    standardHeaders: 'draft-8', // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: {
        success: false,
        error: 'Too many requests, please try again in 3 minutes.'
    }
})

    
// REGISTER
// ----------------------
router.post("/register",
    // express validator, checks validity of input
    [body("company_name").notEmpty(), body("email").isEmail().withMessage("Ugyldig e-postadresse"), 
    body("password").notEmpty().isLength({ min: 8 }).withMessage("ugyldig passord, min 8 tegn"), body("phone_number").isMobilePhone().withMessage("Ugyldig telefonnummer"), body("confirmPassword")
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passordene er ikke like");
      }
      return true;
    })
    ],
    // check if valid and process registration
    async (req, res) => {
        const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }
    // database connection 
    //const db = req.app.locals.db;
    const db = require("../database/sql");
    const { company_name, email, phone_number, password } = req.body;
    /*
    if (!company_name || !email || !password) {
        return res.status(400).json({ success: false, error: "Missing fields" });
    }
*/
    try {
      
        // check if email exists
        const existingEmail = await db.raw(`
            SELECT email FROM dbo.company WHERE email = '${email}'
        `);
        if (existingEmail.length > 0) {
            return res.status(400).json({
            success: false,
            message: "Denne e-posten er allerede registrert"
            });
        }

        //check if phone number exists
        const companies = await db.readAll("company");
        const phoneExists = companies.some((company) => {
        if (!company.phone_number) return false;
        try {
          const decrypted = decrypt_phoneNumber(company.phone_number);
          return decrypted === phone_number;
        } catch {
          return false;
        }
      });

      if (phoneExists) {
        return res.status(400).json({
          success: false,
          message: "This number is already registered",
        });
      }
        // hash passord
        const hashedPassword = await hashPassword(password);
        const encrypted = encrypt_phoneNumber(phone_number);
    
        await db.create(
            { company_name, email, phone_number:encrypted, password:hashedPassword },
            "company"
        );

        res.json({ success: true, message: "Company registered" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: err.message });
    }
});


// LOGIN (sjekker passord og sender 2FA-kode)
// ----------------------
router.post("/login", loginLimiter,
    // express validator 
    [body("email").isEmail(), body("password").notEmpty().isLength({ min: 8 })],
    // check if valid and process login
    async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    // const db = req.app.locals.db;
    const { email, password } = req.body;

    try {
        const companies = await db.readAll("company");
        // Finn selskap med matching e-post og passord
        const company = companies.find(c => c.email === email);

        if (!company) {
            return res.status(401).json({ success: false, error: "Invalid login" });
        }
        // Sjekk om en 2FA-kode allerede er sendt
        if (twoFactorCodes[email]) {
            return res.json({
              success: true,
              message: "A 2FA code has already been sent. Please check your email."
            });
          }

        const passwordMatch = await verifyPassword(password, company.password);
        if (!passwordMatch) {
            return res.status(401).json({ success: false, error: "Invalid login" });
        }
        const code = Math.floor(100000 + Math.random() * 900000).toString();


        twoFactorCodes[email] = code;
      
        await sendEmail(email, code);
      

        res.json({ success: true, message: "2FA code sent to email" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: err.message });
    }
});


// VERIFY 2FA CODE
// ----------------------
router.post("/verify", async (req, res) => {
    const db = require("../database/sql"); 
    const { email, code } = req.body;

    if (twoFactorCodes[email] !== code) {
        return res.status(401).json({ success: false, error: "Invalid code" });
    }
    delete twoFactorCodes[email];

     // Sett cookie tilgjengelig for frontend
     res.cookie("companySession", email, {
        httpOnly: false,       // frontend må kunne lese dette
        path: "/",             // cookie gjelder for hele siden
        maxAge: 1000 * 60 * 60 // 1 time
    });

    const id = await db.getIdFromMail(email);

    req.session.user = req.session.user = {
    id: id,
    name: email,
    role: 'admin',
    events: {}
  };
    
    res.json({ success: true, message: "Login successful!" });
});


// E-MAIL FUNCTION
// ----------------------
async function sendEmail(email, code) {
    // Prefer explicit MAILERSEND_API_KEY env var; fall back to generic API_KEY if present
    const apiKey = process.env.MAILERSEND_API_KEY || process.env.API_KEY;
    if (!apiKey) {
        throw new Error('Missing MailerSend API key in MAILERSEND_API_KEY or API_KEY');
    }

    const mailerSend = new MailerSend({ apiKey });

    // Sender - fallbacks to EMAIL_USER or a sensible default
    const fromEmail = process.env.EMAIL_USER || process.env.EMAIL_FROM || 'no-reply@example.com';
    const fromName = process.env.EMAIL_NAME || 'Your Service';
    const sentFrom = new Sender(fromEmail, fromName);

    const recipients = [new Recipient(email)];

    const emailParams = new EmailParams()
        .setFrom(sentFrom)
        .setTo(recipients)
        .setReplyTo(sentFrom)
        .setSubject('Your authentication code')
        .setText(`Your login code is: ${code}`)
        .setHtml(`<p>Your login code is: <strong>${code}</strong></p>`);

    return mailerSend.email.send(emailParams);
}

module.exports = router;

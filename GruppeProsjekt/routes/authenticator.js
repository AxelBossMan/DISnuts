
const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const {body, validationResult} = require("express-validator");
const rateLimit = require('express-rate-limit');
const { createDatabaseConnection } = require("../database/database")
const config = require("../database/sqlconfig");

let db; 
(async () => {
  try {
    db = await createDatabaseConnection(config);
    console.log("[authenticator] Database connected");
  } catch (err) {
    console.error("Database connection failed:", err);
  }
})();


const config = require('../database/sqlconfig');       
const { createDatabaseConnection } = require('../database/database'); 
const testdb = require("../database/sql");

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
    // express validator - sjekker gyldigheten på det skrevet inn
    [body("company_name").notEmpty(), body("email").isEmail().withMessage("Ugyldig e-postadresse"), 
    body("password").notEmpty().isLength({ min: 8 }).withMessage("ugyldig passord, min 8 tegn"), body("phone_number").isMobilePhone().withMessage("Ugyldig telefonnummer")
    ],
    // check if valid and process registration
    async (req, res) => {
        const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }
    // database connection 
    // const db = req.app.locals.db;
    const { company_name, email, phone_number, password } = req.body;

    /*
    if (!company_name || !email || !password) {
        return res.status(400).json({ success: false, error: "Missing fields" });
    }
*/
    try {
        await db.create(
            { company_name, email, phone_number, password },
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
        const company = companies.find(c => c.email === email && c.password === password);

        if (!company) {
            return res.status(401).json({ success: false, error: "Invalid login" });
        }

        // Lag 2FA-kode 
        const code = Math.floor(100000 + Math.random() * 900000).toString();

        // Lagre midlertidig
        // req.app.locals brukes for enkel lagring uten database
        req.app.locals.twoFactorCodes ??= {};
        req.app.locals.twoFactorCodes[email] = code;

        // Send kode på e-post
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
    const { email, code } = req.body;

    const codes = req.app.locals.twoFactorCodes;

    if (!codes || codes[email] !== code) {
        return res.status(401).json({ success: false, error: "Invalid code" });
    }

    delete codes[email];

     // Sett cookie tilgjengelig for frontend
     res.cookie("companySession", email, {
        httpOnly: false,       // frontend må kunne lese dette
        path: "/",             // cookie gjelder for hele siden
        maxAge: 1000 * 60 * 60 // 1 time
    });

    const id = await testdb.getIdFromMail(email);

    req.session.user = req.session.user = {
    id: id,
    name: email,
    role: 'admin'
  };
    
    res.json({ success: true, message: "Login successful!" });
});


// E-MAIL FUNCTION
// ----------------------
async function sendEmail(email, code) {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    return transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Your authentication code",
        text: `Your login code is: ${code}`
    });
}

module.exports = router;

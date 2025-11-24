
const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const nodemailer = require("nodemailer");

// REGISTER
// ----------------------
router.post("/register", async (req, res) => {
    const db = req.app.locals.db;
    const { company_name, email, phone_number, password } = req.body;

    if (!company_name || !email || !password) {
        return res.status(400).json({ success: false, error: "Missing fields" });
    }

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
router.post("/login", async (req, res) => {
    const db = req.app.locals.db;
    const { email, password } = req.body;

    try {
        const companies = await db.readAll("company");
        // Finn selskap med matching e-post og passord
        const company = companies.find(c => c.email === email && c.password === password);

        if (!company) {
            return res.status(401).json({ success: false, error: "Invalid login" });
        }

        // Lag 2FA-kode
        const code = crypto.randomInt(100000, 999999).toString();

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
router.post("/verify", (req, res) => {
    const { email, code } = req.body;

    const codes = req.app.locals.twoFactorCodes;

    if (!codes || codes[email] !== code) {
        return res.status(401).json({ success: false, error: "Invalid code" });
    }

    delete codes[email];

    //Sett cookie
    res.cookie("companySession", email, {
        httpOnly: true,
        maxAge: 1000 * 60 * 60, // 1 time
    });
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

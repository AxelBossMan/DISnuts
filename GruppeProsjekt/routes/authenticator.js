<<<<<<< Updated upstream
const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const nodemailer = require("nodemailer");

// REGISTER
// ----------------------
router.post("/register", async (req, res) => {
    const db = req.app.locals.db;
    const { name, email, phone_number, company_id, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ success: false, error: "Missing fields" });
    }

    try {
        await db.create(
            { name, email, phone_number, company_id, password },
            "users"
        );

        res.json({ success: true, message: "User registered" });
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
        const users = await db.readAll("users");
        const user = users.find(u => u.email === email && u.password === password);

        if (!user) {
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
=======
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../database');      
const client = require('../twilio');     // <-- Twilio-klienten din
const cookieParser = require('cookie-parser');

// LOGIN: telefon + passord -> send 6-kode
router.post('/login', (req, res) => {
    const { phone, password } = req.body;

    db.query(
        "SELECT * FROM users WHERE phone = ?",
        [phone],
        async (err, results) => {
            if (err) return res.status(500).send("Database error");
            if (results.length === 0) return res.status(400).send("User not found");

            const user = results[0];

            // sjekk passord
            const match = await bcrypt.compare(password, user.password_hash);
            if (!match) return res.status(400).send("Wrong password");

            // generer 6-sifret kode
            const code = Math.floor(100000 + Math.random() * 900000).toString();

            // lagre i DB
            db.query(
                "UPDATE users SET login_code = ?, code_expires = DATE_ADD(NOW(), INTERVAL 5 MINUTE) WHERE id = ?",
                [code, user.id]
            );

            // SEND SMS/WHATSAPP
            client.messages.create({
                from: process.env.TWILIO_PHONE_NUMBER, // eks. 'whatsapp:+14155238886'
                to: `whatsapp:${phone}`,
                body: `Din verifiseringskode er: ${code}`
            });

            // sett cookie
            res.cookie("verify_user", user.id, { httpOnly: true });

            res.redirect('/verify');
        }
    );
});

// VERIFISER 6-KODE
router.post('/verify', (req, res) => {
    const { code } = req.body;
    const userId = req.cookies.verify_user;

    if (!userId) return res.status(400).send("No pending verification");

    db.query(
        "SELECT login_code, code_expires FROM users WHERE id = ?",
        [userId],
        (err, results) => {
            if (err) return res.status(500).send("Database error");
            if (results.length === 0) return res.status(400).send("User not found");

            const row = results[0];

            // sjekk utløp
            if (new Date(row.code_expires) < new Date())
                return res.status(400).send("Code expired");

            // sjekk kode
            if (row.login_code !== code)
                return res.status(400).send("Wrong code");

            // logg inn
            res.cookie("user_id", userId, { httpOnly: true });
            res.clearCookie("verify_user");

            res.redirect('/dashboard');
        }
    );
});

module.exports = router;

>>>>>>> Stashed changes

const express = require("express");
const router = express.Router();
const db = require("../database/sql");

router.get("/", async (req, res) => {
  try {
    if (!req.cookies.companySession) {
      return res.redirect("/login.html");
    }

    const email = req.cookies.companySession;
    const companyId = await db.getIdFromMail(email);

    const events = await db.raw(`
      SELECT * FROM dbo.event WHERE company_id = ${companyId}
    `);

    console.log("company id:", companyId, "email: ", email)
    const company = await db.getCompanyById(companyId);

    let companyName = company ? company.company_name : null;
    let companySlug = null;

    if (companyName) {
      companySlug = companyName
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-");
    }

    // 5) Send data til frontend
    res.json({
      events,
      company_name: companyName,
      company_slug: companySlug
    });

  } catch (err) {
    console.error("DB error in GET /api/events:", err);
    res.status(500).json({ error: "Database error" });
  }
});

  const { event } = req.body;
  req.session.selectedEvent = event;
  console.log("req session", req.session)
  res.json({ success: true });
});

module.exports = router;

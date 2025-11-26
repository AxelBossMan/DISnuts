const express = require("express");
const router = express.Router();
const db = require("../database/sql");

router.get("/", async (req, res) => {
  try {
    // 1. Hent ALLE events
    const events = await db.readAll("event");

    // 2. Finn company_id (antar alle events har samme company_id)
    let companyName = null;
    let companySlug = null;

    if (events.length > 0) {
      const companyId = events[0].company_id; 
      const company = await db.getCompanyById(companyId);
      companyName = company ? company.company_name : null;

      if (companyName) {
        companySlug = companyName
          .trim()
          .toLowerCase()
          .replace(/\s+/g, "-");
      }
    }

    // 3. Send begge deler til frontend
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

module.exports = router;

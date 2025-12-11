const express = require("express");
const router = express.Router();
const db = require("../database/sql");

router.get("/", async (req, res) => {
  try {
    if (!req.session.user) {
      return res.redirect("/login");
    }

    const email = req.session.user.name;
    // const companyId = await db.getIdFromMail(email);
    const companyId = req.session.user.id

    //ingen sql inject her fordi companyId kommer fra session
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

    // Sender data til frontend /events
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

router.post("/setSelectedEvent", (req, res) => {
  const { event } = req.body;
  const selectedEvent = event
  req.session.selectedEvent = selectedEvent || "test event";
  console.log("req session", req.session)
  res.json({ success: true, event: selectedEvent, message: "Selected event set in session" });
});

router.get("/setSelectedEvent", (req, res) => {
  const selectedEvent = req.session.selectedEvent || null;
  console.log("Retrieved selected event from session:", selectedEvent);
  res.json({ success: true, event: selectedEvent, message: "Selected event retrieved from session" });
});

module.exports = router;

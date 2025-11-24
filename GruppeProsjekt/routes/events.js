const express = require("express");
const router = express.Router();
const db = require("../database/sql");

router.get("/", async (req, res) => {
  try {
    const events = await db.readAll("event");  

    res.json(events);
  } catch (err) {
    console.error("DB error in GET /api/events:", err);
    res.status(500).json({ error: "Database error" });
  }
});

module.exports = router;

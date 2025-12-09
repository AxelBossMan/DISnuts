var express = require('express');
var path = require('path');
var router = express.Router();

router.get('/', function (req, res) {
  console.log("req session user:", req.session.user);
  if (!req.session.user) {
    return res.redirect("/login.html");  
  }
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

router.get('/events', (req, res) => {
  console.log("GET /events - Session:", req.session);
  console.log("GET /events - User:", req.session.user);
  
  if (!req.session.user) {
    console.log("No session.user found, redirecting to login");
    return res.redirect("/login.html");
  }

  res.sendFile(path.join(__dirname, '../public/events.html'));
});

router.get("/:company/manage", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

module.exports = router;

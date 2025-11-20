var express = require('express');
var path = require('path');
var router = express.Router();

router.get('/', function (req, res, next) {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

document.getElementById("sendSMSBtn").addEventListener("click", async () => {
  const response = await fetch("/api/send", {
      method: "POST",
      headers: {
          "Content-Type": "application/json"
      }
  });

  const result = await response.json();

  if (result.success) {
      alert("Message sent! SID: " + result.sid);
  } else {
      alert("Error: " + result.error);
  }
});

module.exports = router;

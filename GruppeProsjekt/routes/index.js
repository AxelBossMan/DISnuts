var express = require('express');
var path = require('path');
var router = express.Router();

router.get('/', function (req, res, next) {
  let cookieValue = parseInt(req.cookies.cookie)||0;
  cookieValue += 1;

  res.cookie('cookie', cookieValue, {
    maxAge: 24 * 60 * 60 * 1000, // 1 day
    httpOnly: true
  });

  res.sendFile(path.join(__dirname, '../public/index.html'));
});

router.get('/events', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/events.html'));
});

module.exports = router;

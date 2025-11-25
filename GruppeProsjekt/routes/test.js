const express = require('express');
const router = express.Router();

//test router
router.get('/', function(req, res, next) {
  res.send(req.session);
});

module.exports = router;
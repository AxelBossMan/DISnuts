const express = require('express');
const router = express.Router();

// GET /api/test
router.get('/', (req, res) => {
  res.send(req.session);
});

module.exports = router;
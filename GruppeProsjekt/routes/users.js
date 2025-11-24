var express = require('express');
var router = express.Router();

const config = require('../database/sqlconfig');           // din config-fil
const { createDatabaseConnection } = require('../database/database'); // din database.js


// test, for å verifisere db connection
// GET /users -> extract all users from the database
router.get('/', async (req, res) => {
  try {
    const db = await createDatabaseConnection(config);
    const users = await db.readAll('users');   // MERK: tabellnavn = users
    res.json(users);
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).send('Database error');
  }
});



module.exports = router;

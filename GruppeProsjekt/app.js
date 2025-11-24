require('dotenv').config({ path: __dirname + '/.env' });
require('express-async-errors'); // to handle async errors try/catch

var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var helmet = require('helmet'); 
var { query } = require('express-validator'); // for query validation

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

var port = process.env.PORT || 3000;

// middleware (MÅ komme før routes!)
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(helmet()); 

// database
const { createDatabaseConnection } = require("./database/database");
const sqlConfig = require("./database/sqlconfig");
// database connection
let db;
(async () => {
  try {
    db = await createDatabaseConnection(sqlConfig);
    app.locals.db = db;  // gjør databasen tilgjengelig i alle routes
    console.log("Database connected");
  } catch (err) {
    console.error("Database connection failed:", err);
  }
})();

// statiske filer
app.use(express.static(path.join(__dirname, 'public')));


// routes
app.use('/', indexRouter);
app.use('/users', usersRouter);

// SMS route (nå fungerer req.body)
var smsRouter = require('./routes/sms');
app.use('/api', smsRouter);


// gjør alt i /public tilgjengelig statisk (HTML, CSS, frontend JS)
app.use(express.static(path.join(__dirname, 'public')));

//AUTH ROUTE
const authRouter = require('./routes/authenticator');
app.use('/authenticator', authRouter);

// error handler
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
});

module.exports = app;

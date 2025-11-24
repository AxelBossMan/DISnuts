require('dotenv').config({ path: __dirname + '/.env' });
require('express-async-errors'); // to handle async errors try/catch

var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var helmet = require('helmet');
var limiter = require('express-rate-limit'); 

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var smsRouter = require('./routes/sms');
var eventsRouter = require('./routes/events');
var authRouter = require('./routes/authenticator');
var chatRouter= require('./routes/chat');

var app = express();
var port = process.env.PORT || 3000;

// middleware
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(helmet());

// database-oppsett via createDatabaseConnection hvis du trenger det andre steder
const { createDatabaseConnection } = require("./database/database");
const sqlConfig = require("./database/sqlconfig");

let db;
(async () => {
  try {
    db = await createDatabaseConnection(sqlConfig);
    app.locals.db = db;
    console.log("Database connected (createDatabaseConnection)");
  } catch (err) {
    console.error("Database connection failed:", err);
  }
})();

// statiske filer (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// sider
app.use('/', indexRouter);
app.use('/users', usersRouter);

// API-ruter
app.use('/api', smsRouter);          // f.eks. /api/sms eller hva du har der
app.use('/api/events', eventsRouter); // VIKTIG: nå får du GET /api/events

// auth-rute
app.use('/authenticator', authRouter);

// chat router
app.use('/api/chat', chatRouter);

// error handler
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
});

module.exports = app;

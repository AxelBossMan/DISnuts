
require('express-async-errors'); // to handle async errors try/catch

var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var helmet = require('helmet');
var limiter = require('express-rate-limit'); 
var sessionMiddleware = require('./config/session');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var smsRouter = require('./routes/sms');
var eventsRouter = require('./routes/events');
var authRouter = require('./routes/authenticator');
var chatRouter= require('./routes/chat');
var testRouter = require('./routes/test');

var app = express();
var port = process.env.PORT || 3000;

// middleware
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(helmet());
app.use(sessionMiddleware);

app.set('trust proxy', 1); 

const db = require("./database/sql");
app.locals.db = db;

// statiske filer (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "public/login.html"));
});

// register-side
app.get("/register", (req, res) => {
  res.sendFile(path.join(__dirname, "public/register.html"));
});

// sider
app.use('/', indexRouter);
app.use('/users', usersRouter);

// API-ruter
app.use('/api', smsRouter);        
app.use('/api/events', eventsRouter); 

// auth-rute
app.use('/authenticator', authRouter);

// chat router
app.use('/chat', chatRouter);

//test router
app.use('/test', testRouter);

// error handler
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
});

module.exports = app;

require('dotenv').config({ path: __dirname + '/.env' });

var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

var port = process.env.PORT || 3000;

// middleware (MÅ komme før routes!)
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// statiske filer
app.use(express.static(path.join(__dirname, 'public')));

// routes
app.use('/', indexRouter);
app.use('/users', usersRouter);

// SMS route (nå fungerer req.body)
var smsRouter = require('./routes/sms');
app.use('/api', smsRouter);

module.exports = app;

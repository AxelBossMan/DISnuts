var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

//middleware
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//SMS route (mount after body-parsers so req.body is populated for webhooks)
var smsRouter = require('./routes/sms');
app.use('/api', smsRouter);

// routes
app.use('/', indexRouter);
app.use('/users', usersRouter);

module.exports = app;

var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

var port = process.env.PORT || 3000;

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// routes
app.use('/', indexRouter);
app.use('/users', usersRouter);

// gjør alt i /public tilgjengelig statisk (HTML, CSS, frontend JS)
app.use(express.static(path.join(__dirname, 'public')));

// start serveren
app.listen(port, () => {
  console.log('Server running on port ' + port);
});

module.exports = app;

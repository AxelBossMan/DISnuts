const session = require('express-session');


const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false, //BYTT TIL TRUE I FINAL VERSION
    maxAge: 1000 * 60 * 60 * 24 // 1 day
  }
});



module.exports = sessionMiddleware;

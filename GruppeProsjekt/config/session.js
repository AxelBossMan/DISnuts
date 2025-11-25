const session = require('express-session');

/**
 * Session middleware - small, ready-to-use configuration.
 * For production you should use a persistent store (Redis, SQL, etc.).
 */
const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET || 'understory123',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    // only secure cookies over HTTPS in production
    secure: true,
    maxAge: 1000 * 60 * 60 // 1 time
  }
});


// Export the middleware function (do NOT call it here) so app can use it as
// `app.use(require('./config/session'))`.
module.exports = sessionMiddleware;

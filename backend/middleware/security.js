const rateLimit = require('express-rate-limit');

// 1. General Global API Rate Limiter
// Protects against automated scrapers, DDoS, and aggressive spamming
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 600, // Max 600 requests per 15 minutes per IP (generous for genuine design browsing)
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again in a few minutes.'
  }
});

// 2. Strict Auth / Login Limiter
// Protects admin & user authentication endpoints against brute-force password guessing
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Max 10 login attempts per 15 mins per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many login attempts from this IP. Please try again after 15 minutes.'
  }
});

// 3. Order Placement Limiter
// Protects order submission against automated spam bots
const orderLimiter = rateLimit({
  windowMs: 30 * 60 * 1000, // 30 minutes
  max: 20, // Max 20 order submissions per 30 minutes per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many order requests submitted. Please try again in 30 minutes or contact us directly on WhatsApp.'
  }
});

// 4. Support Request Limiter
// Protects contact & support forms against spam messaging
const supportLimiter = rateLimit({
  windowMs: 30 * 60 * 1000, // 30 minutes
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many support messages sent. Please contact us directly on WhatsApp.'
  }
});

// 5. NoSQL Injection Sanitizer
// Recursively strips any keys starting with '$' or containing '.' to block MongoDB operator injection
const sanitizeNoSql = (req, res, next) => {
  const sanitize = (obj) => {
    if (obj && typeof obj === 'object') {
      for (const key of Object.keys(obj)) {
        if (key.startsWith('$') || key.includes('.')) {
          delete obj[key];
        } else {
          sanitize(obj[key]);
        }
      }
    }
  };
  if (req.body) sanitize(req.body);
  if (req.query) sanitize(req.query);
  if (req.params) sanitize(req.params);
  next();
};

module.exports = {
  globalLimiter,
  authLimiter,
  orderLimiter,
  supportLimiter,
  sanitizeNoSql
};

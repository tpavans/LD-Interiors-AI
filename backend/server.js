require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { execSync } = require('child_process');
const connectDB = require('./config/db');
const seedAdmins = require('./utils/seedAdmins');
const seedProducts = require('./utils/seedProducts');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const supportRoutes = require('./routes/supportRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const phonepeRoutes = require('./routes/phonepeRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const amazonRoutes = require('./routes/amazonRoutes');

// Global exception and rejection loggers
process.on('uncaughtException', (err) => {
  console.error('FATAL UNCAUGHT EXCEPTION:', err.message);
  console.error(err.stack);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('FATAL UNHANDLED REJECTION at:', promise, 'reason:', reason);
});

// Helper to check and terminate processes occupying the specified port
const freePort = (port) => {
  try {
    const isWindows = process.platform === 'win32';
    if (isWindows) {
      // Find and kill PID on Windows
      const stdout = execSync(`netstat -ano | findstr :${port}`).toString();
      const lines = stdout.split('\n').filter(Boolean);
      for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        const pid = parts[parts.length - 1];
        if (pid && pid !== '0') {
          console.log(`Force killing conflicting process with PID ${pid} occupying port ${port}...`);
          try {
            execSync(`taskkill /F /PID ${pid}`);
            console.log(`Successfully terminated process ${pid}.`);
          } catch (e) {
            console.error(`Failed to terminate process ${pid}:`, e.message);
          }
        }
      }
    } else {
      // Find and kill PID on Unix systems
      const stdout = execSync(`lsof -t -i:${port}`).toString();
      const pids = stdout.split('\n').filter(Boolean);
      for (const pid of pids) {
        console.log(`Force killing conflicting process with PID ${pid} occupying port ${port}...`);
        try {
          execSync(`kill -9 ${pid}`);
          console.log(`Successfully terminated process ${pid}.`);
        } catch (e) {
          console.error(`Failed to terminate process ${pid}:`, e.message);
        }
      }
    }
  } catch (err) {
    // findstr/lsof returns exit code 1 if no process is occupying the port
    console.log(`No active processes occupying port ${port}.`);
  }
};

const PORT = process.env.PORT || 5004;

// Connect to MongoDB database
connectDB()
  .then(async () => {
    // Seed default admin accounts
    await seedAdmins();
    // Seed default furniture showcase items
    await seedProducts();
  })
  .catch((err) => {
    console.error('Database connection failed. Verify your network or MongoDB IP Whitelist settings:', err.message);
  });

const app = express();

// Enable CORS for all frontend origins (Vercel & Custom Domain)
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Security & Anti-Abuse Headers
app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
  next();
});

// Basic health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', version: 'v2026.08.11.amz', message: 'LD Interiors API with Amazon Affiliate engine is running...' });
});

// Mount routing endpoints
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/phonepe', phonepeRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/amazon', amazonRoutes);

// Fallback path for undefined routes
app.use((req, res, next) => {
  res.status(404).json({ message: 'API route not found' });
});

// Global error handler middleware
app.use((err, req, res, next) => {
  console.error('Global Error Handler caught an exception:', err);
  res.status(500).json({
    message: err.message || 'An internal server error occurred',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
});

let eaddrinuseRetries = 0;
const MAX_RETRIES = 3;

// Start the Express server, handling port conflicts reactively with grace retries
const startServer = () => {
  const server = app.listen(PORT, () => {
    console.log(`Express server is running on port ${PORT}`);
    eaddrinuseRetries = 0; // Reset retries on successful bind
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      eaddrinuseRetries++;
      console.warn(`[Port Conflict] Port ${PORT} is occupied. (Retry attempt ${eaddrinuseRetries}/${MAX_RETRIES})`);

      // Try closing the server socket state to release descriptors
      try {
        server.close();
      } catch (closeErr) {
        // Ignore close failures
      }

      // If we exceed MAX_RETRIES, it is an orphaned process (not a recycling nodemon process). Force kill it.
      if (eaddrinuseRetries >= MAX_RETRIES) {
        console.warn(`Port ${PORT} remained occupied after ${MAX_RETRIES} retries. Forcefully terminating occupant...`);
        killPortProcess(PORT);
        eaddrinuseRetries = 0; // Reset retry counter after forced termination
      }

      // Retry starting the server after a short delay
      setTimeout(() => {
        console.log(`Retrying to start Express server on port ${PORT}...`);
        startServer();
      }, 1000);
    } else {
      console.error('Server socket error:', err);
    }
  });
};

startServer();

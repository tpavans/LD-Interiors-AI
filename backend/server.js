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

// Global exception and rejection loggers
process.on('uncaughtException', (err) => {
  console.error('FATAL UNCAUGHT EXCEPTION:', err.message);
  console.error(err.stack);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('FATAL UNHANDLED REJECTION at:', promise, 'reason:', reason);
});

// Helper to check and terminate processes occupying the specified port
const killPortProcess = (port) => {
  try {
    console.log(`Scanning for processes occupying port ${port}...`);
    if (process.platform === 'win32') {
      // Find PID occupying the port on Windows
      const stdout = execSync(`netstat -ano | findstr :${port}`).toString();
      const lines = stdout.split('\n');
      const pids = new Set();
      for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        if (parts.length >= 5) {
          const pid = parts[parts.length - 1];
          if (pid && pid !== '0' && !isNaN(pid)) {
            pids.add(pid);
          }
        }
      }
      for (const pid of pids) {
        console.log(`Force killing conflicting process with PID ${pid} occupying port ${port}...`);
        try {
          execSync(`taskkill /F /PID ${pid}`);
          console.log(`Successfully terminated process ${pid}.`);
        } catch (e) {
          console.error(`Failed to terminate process ${pid}:`, e.message);
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

// Middleware configuration
app.use(cors());
app.use(express.json()); // JSON parsing middleware
app.use(express.urlencoded({ extended: true }));

// Basic health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'LD Interiors API is running...' });
});

// Mount routing endpoints
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/support', supportRoutes);

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

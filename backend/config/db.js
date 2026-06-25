const mongoose = require('mongoose');

// Register connection error listener to prevent unhandled 'error' event crashes
mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection asynchronous error encountered:', err.message);
});

const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('DATABASE ERROR: MONGO_URI environment variable is missing in process.env!');
    throw new Error('MONGO_URI environment variable is missing');
  }

  try {
    console.log('Attempting connection to MongoDB cluster...');
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000, // Fail fast after 5 seconds instead of waiting 30 seconds
    });
    console.log(`MongoDB Connected successfully: ${conn.connection.host}`);
  } catch (error) {
    console.error('DATABASE CONNECTION ERROR details:');
    console.error(error.stack || error);
    throw error;
  }
};

module.exports = connectDB;

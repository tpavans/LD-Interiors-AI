const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const run = async () => {
  console.log('=== MongoDB Atlas Integration Verification ===');
  console.log('Attempting to connect to the Atlas cluster...');

  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000
    });
    console.log('SUCCESS: Connected to MongoDB Atlas!');

    // Test Database Write
    console.log('Creating a temporary integration test user document...');
    const testUser = await User.create({
      name: 'Integration Tester',
      email: `test_integration_${Date.now()}@ldinteriors.com`,
      password: 'TestPasswordSecure123!',
      role: 'admin'
    });
    console.log('SUCCESS: Test user document written to MongoDB. Email:', testUser.email);

    // Test Database Read
    console.log('Querying the written test user document...');
    const foundUser = await User.findById(testUser._id);
    console.log('SUCCESS: Read test user document successfully. Name:', foundUser.name);

    // Clean up test document
    await User.deleteOne({ _id: testUser._id });
    console.log('CLEANUP: Integration test document removed from MongoDB.');

    await mongoose.disconnect();
    console.log('\n=============================================');
    console.log('VERIFICATION PASSED: Database reads and writes function correctly.');
    console.log('=============================================');
  } catch (err) {
    const https = require('https');
    const getPublicIP = () => {
      return new Promise((resolve) => {
        https.get('https://api4.ipify.org', (res) => {
          let data = '';
          res.on('data', (chunk) => data += chunk);
          res.on('end', () => resolve(data.trim()));
        }).on('error', () => resolve('Could not fetch IP'));
      });
    };
    const currentIP = await getPublicIP();

    console.error('\n=============================================');
    console.error('VERIFICATION FAILED: Database connection failed.');
    console.error('Error Details:', err);
    if (err.reason) {
      console.error('Connection Reason Details:', JSON.stringify(err.reason, null, 2));
    }
    console.error('Error Stack:', err.stack);
    console.error('\nPlease ensure that your current public IP address:');
    console.error(`   >>> ${currentIP} <<<`);
    console.error('is whitelisted in your MongoDB Atlas Network Access settings.');
    console.error('Highly recommended: Whitelist "0.0.0.0/0" (Allow Access from Anywhere) so dynamic Jio IPs do not break.');
    console.log('Or check if the database credentials are valid.');
    console.error('=============================================');
    process.exit(1);
  }
};

run();

const mongoose = require('mongoose');
const EmailLog = require('./models/EmailLog');
require('dotenv').config();

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    const logs = await EmailLog.find({}).sort({ createdAt: -1 }).limit(10);
    console.log('Recent 10 Email Dispatch Logs:');
    if (logs.length === 0) {
      console.log('(No email logs found yet)');
    }
    logs.forEach(l => {
      console.log(`- Time: ${l.createdAt}`);
      console.log(`  Order ID: ${l.orderId}`);
      console.log(`  Product: ${l.product}`);
      console.log(`  Recipient: ${l.recipient}`);
      console.log(`  Status: ${l.status}`);
      console.log(`  SMTP User: ${l.smtpUser}`);
      if (l.error) {
        console.log(`  Error: ${l.error}`);
      }
      console.log('-------------------');
    });
    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
};

run();

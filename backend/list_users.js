require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const run = async () => {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected!');

    const users = await User.find({});
    console.log('\n--- ALL USERS IN THE DATABASE ---');
    users.forEach(u => {
      console.log(`ID: ${u._id} | Name: ${u.name} | Phone: ${u.phone || 'N/A'} | Email: ${u.email} | Role: ${u.role}`);
    });
    console.log('---------------------------------\n');

    // Find any users who have a phone number but have role 'admin'
    const unauthorizedAdmins = users.filter(u => u.phone && u.role === 'admin');
    
    if (unauthorizedAdmins.length > 0) {
      console.log(`Found ${unauthorizedAdmins.length} unauthorized admin(s) with phone numbers. Demoting them to 'user'...`);
      for (const u of unauthorizedAdmins) {
        u.role = 'user';
        await u.save();
        console.log(`Demoted: ${u.name} (Phone: ${u.phone}) to role 'user'.`);
      }
      console.log('Demotion complete!');
    } else {
      console.log('No unauthorized admins with phone numbers found.');
    }

    mongoose.connection.close();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

run();

const User = require('../models/User');

const seedAdmins = async () => {
  try {
    const admin1Email = process.env.ADMIN1_EMAIL || 'admin1@ldinteriors.com';
    const admin1Pass = process.env.ADMIN1_PASSWORD || 'Admin1SecurePassword!';
    const admin1Name = 'Admin One';

    const admin2Email = process.env.ADMIN2_EMAIL || 'admin2@ldinteriors.com';
    const admin2Pass = process.env.ADMIN2_PASSWORD || 'Admin2SecurePassword!';
    const admin2Name = 'Admin Two';

    // Verify and seed Admin 1
    const admin1Exists = await User.findOne({ email: admin1Email });
    if (!admin1Exists) {
      await User.create({
        name: admin1Name,
        email: admin1Email,
        password: admin1Pass,
        role: 'admin',
      });
      console.log(`Seeded Admin 1: ${admin1Email}`);
    }

    // Verify and seed Admin 2
    const admin2Exists = await User.findOne({ email: admin2Email });
    if (!admin2Exists) {
      await User.create({
        name: admin2Name,
        email: admin2Email,
        password: admin2Pass,
        role: 'admin',
      });
      console.log(`Seeded Admin 2: ${admin2Email}`);
    }
  } catch (error) {
    console.error('Error seeding admin accounts:', error);
  }
};

module.exports = seedAdmins;

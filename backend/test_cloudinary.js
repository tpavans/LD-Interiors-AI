const cloudinary = require('cloudinary').v2;
require('dotenv').config();
const fs = require('fs');
const path = require('path');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const run = async () => {
  console.log('=== Cloudinary Outbound Diagnostics ===');
  console.log('CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME);
  console.log('CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY);
  console.log('CLOUDINARY_API_SECRET Length:', process.env.CLOUDINARY_API_SECRET ? process.env.CLOUDINARY_API_SECRET.length : 0);

  // Write a dummy local file
  const dummyFilePath = path.join(__dirname, 'cloudinary_test_dummy.txt');
  fs.writeFileSync(dummyFilePath, 'This is a test file for Cloudinary upload validation.');

  try {
    console.log('\nAttempting to upload file to Cloudinary...');
    const result = await cloudinary.uploader.upload(dummyFilePath, {
      resource_type: 'raw',
      folder: 'ld_interiors_validation'
    });
    console.log('\nSUCCESS: File uploaded successfully!');
    console.log('Asset URL:', result.secure_url);
    console.log('Public ID:', result.public_id);
  } catch (error) {
    console.error('\nFAILURE: Cloudinary API rejected the connection or credentials:');
    console.error(error);
  } finally {
    // Cleanup local file
    if (fs.existsSync(dummyFilePath)) {
      fs.unlinkSync(dummyFilePath);
      console.log('\nCLEANUP: Temporary local file deleted.');
    }
  }
};

run();

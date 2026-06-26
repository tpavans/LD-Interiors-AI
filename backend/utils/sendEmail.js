const nodemailer = require('nodemailer');

/**
 * Sends a detailed order notification email to ldinteriors.in@gmail.com.
 * Automatically falls back to Ethereal mock SMTP or console logs in development if credentials are not configured.
 * @param {object} order - The created mongoose order document
 */
const sendOrderEmail = async (order) => {
  let transporter;

  const hasSmtpConfig = process.env.SMTP_USER && process.env.SMTP_PASS;

  if (hasSmtpConfig) {
    const isGmail = process.env.SMTP_USER.endsWith('@gmail.com');
    if (isGmail) {
      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    } else {
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    }
  } else {
    console.log('No SMTP credentials found in .env. Creating Ethereal mock mail account...');
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    } catch (err) {
      console.error('Failed to initialize Ethereal test account:', err.message);
      // Fail-safe backup log
      console.log(`[BACKUP EMAIL LOG - ldinteriors.in@gmail.com]
Subject: New Order: ${order.product}
Customer: ${order.name} (${order.phone})
Notes: ${order.notes || 'None'}
Image URL: ${order.imageUrl || 'None'}
`);
      return;
    }
  }

  const dateStr = order.createdAt ? new Date(order.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

  // Clean and format phone number for dialing
  const rawPhone = order.phone || '';
  const cleanPhone = rawPhone.replace(/\D/g, ''); // keep only digits
  let dialPhone = rawPhone;
  if (cleanPhone.length === 10) {
    dialPhone = `+91${cleanPhone}`;
  } else if (cleanPhone.length === 12 && cleanPhone.startsWith('91')) {
    dialPhone = `+${cleanPhone}`;
  } else if (cleanPhone.length > 0) {
    dialPhone = `+${cleanPhone}`;
  }

  const mailOptions = {
    from: hasSmtpConfig ? `"${order.name} via LD Interiors" <${process.env.SMTP_USER}>` : `"${order.name} via LD Interiors Test" <test@ldinteriors.com>`,
    to: 'ldinteriors.in@gmail.com, ldinteriors@gmail.com',
    subject: `🔔 New Order: ${order.product} from ${order.name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e2d7c5; border-radius: 16px; background-color: #faf8f5; color: #423525;">
        <div style="text-align: center; border-bottom: 2px solid #e2d7c5; padding-bottom: 15px; margin-bottom: 20px;">
          <h2 style="color: #6d553b; margin: 0; font-family: Georgia, serif;">LD Interiors & Furnitures</h2>
          <p style="font-size: 12px; text-transform: uppercase; letter-spacing: 2px; color: #8e7a65; margin: 5px 0 0 0;">New Order Notification</p>
        </div>
        
        <p style="font-size: 14px; line-height: 1.5; color: #5a4b3b;">Namaste Admin! A new customer order has been placed on the website. Here are the details:</p>
        
        <div style="background-color: #ffffff; border: 1px solid #ebdcc5; border-radius: 12px; padding: 20px; margin-top: 15px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #f2e9dc; font-weight: bold; font-size: 13px; color: #8e7a65; width: 35%;">Customer Name</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #f2e9dc; font-size: 14px; font-weight: bold;">${order.name}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #f2e9dc; font-weight: bold; font-size: 13px; color: #8e7a65;">Mobile Number</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #f2e9dc; font-size: 14px;"><a href="tel:${dialPhone}" style="color: #a07d57; text-decoration: none; font-weight: bold; font-size: 15px;">📞 ${order.phone}</a></td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #f2e9dc; font-weight: bold; font-size: 13px; color: #8e7a65;">Selected Design</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #f2e9dc; font-size: 14px; font-weight: bold; color: #6d553b;">${order.product}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #f2e9dc; font-weight: bold; font-size: 13px; color: #8e7a65;">Custom Sizing/Notes</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #f2e9dc; font-size: 13px; font-style: italic; color: #5a4b3b;">${order.notes || 'No custom notes.'}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; font-size: 13px; color: #8e7a65;">Order Timestamp</td>
              <td style="padding: 8px 0; font-size: 13px; color: #5a4b3b;">${dateStr}</td>
            </tr>
          </table>
        </div>

        <div style="margin-top: 20px; text-align: center;">
          <a href="tel:${dialPhone}" style="background-color: #6d553b; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; box-shadow: 0 4px 6px rgba(0,0,0,0.1); font-size: 14px; border: 1px solid #523f2a;">
            📞 Call Customer: ${order.phone}
          </a>
        </div>

        ${order.imageUrl ? `
        <div style="margin-top: 20px; text-align: center; background-color: #ffffff; border: 1px solid #ebdcc5; border-radius: 12px; padding: 15px;">
          <p style="font-size: 13px; font-weight: bold; color: #8e7a65; margin: 0 0 10px 0;">Design Image Preview:</p>
          <img src="${order.imageUrl}" alt="Design Image" style="max-width: 100%; max-height: 200px; border-radius: 8px; border: 1px solid #ebdcc5;" />
          <p style="margin: 8px 0 0 0; font-size: 11px;"><a href="${order.imageUrl}" target="_blank" style="color: #a07d57; text-decoration: none;">Open Full Resolution Image</a></p>
        </div>
        ` : ''}

        <div style="margin-top: 25px; padding: 12px 15px; background-color: #f5eee4; border-left: 4px solid #6d553b; border-radius: 4px; font-size: 12px; line-height: 1.4; color: #5a4b3b;">
          <strong>Admin Status:</strong> Mr. Nagaraju has been redirected to chat on WhatsApp. Please check the backend database and follow up with Mr. Nagaraju for pricing finalization.
        </div>

        <div style="margin-top: 30px; text-align: center; border-top: 1px solid #e2d7c5; padding-top: 15px; font-size: 10px; color: #a59582;">
          This is an automated system notification from the LD Interiors & Furniture web platform.
        </div>
      </div>
    `,
  };

  const info = await transporter.sendMail(mailOptions);
  console.log('Order notification email sent successfully! Message ID:', info.messageId);
  
  if (!hasSmtpConfig) {
    console.log('Ethereal Test Mail Preview URL:', nodemailer.getTestMessageUrl(info));
  }
};

module.exports = sendOrderEmail;

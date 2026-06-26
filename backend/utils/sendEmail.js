const nodemailer = require('nodemailer');

/**
 * Sends a detailed order notification email to pavansaiteki7@gmail.com.
 * Automatically falls back to Ethereal mock SMTP or console logs in development if credentials are not configured.
 * @param {object} order - The created mongoose order document
 */
const sendOrderEmail = async (order) => {
  let transporter;

  const hasSmtpConfig = process.env.SMTP_USER && process.env.SMTP_PASS;

  if (hasSmtpConfig) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
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
      console.log(`[BACKUP EMAIL LOG - pavansaiteki7@gmail.com]
Subject: New Order: ${order.product}
Customer: ${order.name} (${order.phone})
Notes: ${order.notes || 'None'}
Image URL: ${order.imageUrl || 'None'}
`);
      return;
    }
  }

  const dateStr = order.createdAt ? new Date(order.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

  const mailOptions = {
    from: hasSmtpConfig ? `"${process.env.SMTP_FROM_NAME || 'LD Interiors Portal'}" <${process.env.SMTP_USER}>` : '"LD Interiors Portal Test" <test@ldinteriors.com>',
    to: 'pavansaiteki7@gmail.com',
    subject: `🔔 New Customer Order: ${order.product}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e2d7c5; border-radius: 16px; background-color: #faf8f5; color: #423525;">
        <div style="text-align: center; border-bottom: 2px solid #e2d7c5; padding-bottom: 15px; mb-20px;">
          <h2 style="color: #6d553b; margin: 0; font-family: Georgia, serif;">LD Interiors & Furnitures</h2>
          <p style="font-size: 12px; text-transform: uppercase; letter-spacing: 2px; color: #8e7a65; margin: 5px 0 0 0;">New Order Notification</p>
        </div>
        
        <p style="font-size: 14px; line-height: 1.5; color: #5a4b3b;">Namaste Pavan Sai Garu! A new customer order has been placed on the website. Here are the details:</p>
        
        <div style="background-color: #ffffff; border: 1px solid #ebdcc5; border-radius: 12px; padding: 20px; margin-top: 15px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #f2e9dc; font-weight: bold; font-size: 13px; color: #8e7a65; width: 35%;">Customer Name</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #f2e9dc; font-size: 14px; font-weight: bold;">${order.name}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #f2e9dc; font-weight: bold; font-size: 13px; color: #8e7a65;">Mobile Number</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #f2e9dc; font-size: 14px;"><a href="tel:${order.phone}" style="color: #a07d57; text-decoration: none; font-weight: bold;">${order.phone}</a></td>
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

        ${order.imageUrl ? `
        <div style="margin-top: 20px; text-align: center; background-color: #ffffff; border: 1px solid #ebdcc5; border-radius: 12px; padding: 15px;">
          <p style="font-size: 13px; font-weight: bold; color: #8e7a65; margin: 0 0 10px 0;">Design Image Preview:</p>
          <img src="${order.imageUrl}" alt="Design Image" style="max-width: 100%; max-height: 200px; border-radius: 8px; border: 1px solid #ebdcc5;" />
          <p style="margin: 8px 0 0 0; font-size: 11px;"><a href="${order.imageUrl}" target="_blank" style="color: #a07d57; text-decoration: none;">Open Full Resolution Image</a></p>
        </div>
        ` : ''}

        <div style="margin-top: 25px; padding: 12px 15px; bg-color: #f3eae1; background-color: #f5eee4; border-left: 4px solid #6d553b; border-radius: 4px; font-size: 12px; line-height: 1.4; color: #5a4b3b;">
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

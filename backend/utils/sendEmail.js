const nodemailer = require('nodemailer');
const https = require('https');
const EmailLog = require('../models/EmailLog');

/**
 * Sends a detailed order notification email.
 * Automatically switches between Brevo HTTP API (for Render free tier) and Nodemailer SMTP (for local dev).
 * @param {object} order - The created mongoose order document
 */
const sendOrderEmail = async (order) => {
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

  const htmlContent = `
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
            <td style="padding: 8px 0; border-bottom: 1px solid #f2e9dc; font-size: 14px; font-weight: bold; color: #6d553b;">
              ${order.productId ? `<a href="https://ldinteriors.in/products/${order.productId}" target="_blank" style="color: #6d553b; text-decoration: underline; font-weight: bold;">${order.product}</a>` : order.product}
            </td>
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
        <p style="margin: 8px 0 0 0; font-size: 11px;">
          <a href="${order.imageUrl}" target="_blank" style="color: #a07d57; text-decoration: none;">Open Full-Res Image</a>
          ${order.productId ? ` &nbsp;|&nbsp; <a href="https://ldinteriors.in/products/${order.productId}" target="_blank" style="color: #a07d57; text-decoration: none; font-weight: bold;">View Website Product Page</a>` : ''}
        </p>
      </div>
      ` : ''}

      <div style="margin-top: 25px; padding: 12px 15px; background-color: #f5eee4; border-left: 4px solid #6d553b; border-radius: 4px; font-size: 12px; line-height: 1.4; color: #5a4b3b;">
        <strong>Admin Status:</strong> Mr. Nagaraju has been redirected to chat on WhatsApp. Please check the backend database and follow up with Mr. Nagaraju for pricing finalization.
      </div>

      <div style="margin-top: 30px; text-align: center; border-top: 1px solid #e2d7c5; padding-top: 15px; font-size: 10px; color: #a59582;">
        This is an automated system notification from the LD Interiors & Furniture web platform.
      </div>
    </div>
  `;

  const subject = `🔔 New Order: ${order.product} from ${order.name}`;

  // 1. IF BREVO_API_KEY IS AVAILABLE, USE THE BREVO HTTP API (Never blocked by Render free tier)
  if (process.env.BREVO_API_KEY) {
    console.log('BREVO_API_KEY detected. Sending email via Brevo HTTP API...');
    
    return new Promise((resolve, reject) => {
      const data = JSON.stringify({
        sender: { name: `${order.name} via LD Interiors`, email: 'ldinteriors.in@gmail.com' },
        to: [
          { email: 'ldinteriors.in@gmail.com', name: 'LD Interiors Admin' }
        ],
        subject: subject,
        htmlContent: htmlContent
      });

      const options = {
        hostname: 'api.brevo.com',
        port: 443,
        path: '/v3/smtp/email',
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'api-key': process.env.BREVO_API_KEY,
          'content-type': 'application/json',
          'content-length': data.length
        }
      };

      const req = https.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => body += chunk);
        res.on('end', async () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            console.log('Order notification email sent successfully via Brevo! Response:', body);
            // Log success to MongoDB
            await EmailLog.create({
              orderId: order._id,
              product: order.product,
              recipient: 'ldinteriors.in@gmail.com',
              status: 'success',
              smtpUser: 'Brevo API',
            }).catch(err => console.error('Failed to save EmailLog:', err));
            resolve();
          } else {
            const errMessage = `Brevo API returned status ${res.statusCode}: ${body}`;
            console.error(errMessage);
            // Log failure to MongoDB
            await EmailLog.create({
              orderId: order._id,
              product: order.product,
              recipient: 'ldinteriors.in@gmail.com',
              status: 'failed',
              error: errMessage,
              smtpUser: 'Brevo API',
            }).catch(err => console.error('Failed to save EmailLog:', err));
            reject(new Error(errMessage));
          }
        });
      });

      req.on('error', async (err) => {
        console.error('Brevo HTTP request failed:', err.message);
        // Log failure to MongoDB
        await EmailLog.create({
          orderId: order._id,
          product: order.product,
          recipient: 'ldinteriors.in@gmail.com',
          status: 'failed',
          error: err.message,
          smtpUser: 'Brevo API',
        }).catch(logErr => console.error('Failed to save EmailLog:', logErr));
        reject(err);
      });

      req.write(data);
      req.end();
    });
  }

  // 2. FALLBACK TO SMTP (Localhost or other servers where SMTP is unblocked)
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
        secure: process.env.SMTP_SECURE === 'true',
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
      return;
    }
  }

  const mailOptions = {
    from: hasSmtpConfig ? `"${order.name} via LD Interiors" <${process.env.SMTP_USER}>` : `"${order.name} via LD Interiors Test" <test@ldinteriors.com>`,
    to: 'ldinteriors.in@gmail.com',
    subject: subject,
    html: htmlContent,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Order notification email sent successfully via SMTP! Message ID:', info.messageId);
    
    // Log success to MongoDB
    await EmailLog.create({
      orderId: order._id,
      product: order.product,
      recipient: 'ldinteriors.in@gmail.com',
      status: 'success',
      smtpUser: hasSmtpConfig ? process.env.SMTP_USER : 'Ethereal Test Account',
    }).catch(err => console.error('Failed to save EmailLog:', err));

    if (!hasSmtpConfig) {
      console.log('Ethereal Test Mail Preview URL:', nodemailer.getTestMessageUrl(info));
    }
  } catch (error) {
    console.error('Nodemailer SMTP sendMail failed:', error.message);
    
    // Log failure to MongoDB
    await EmailLog.create({
      orderId: order._id,
      product: order.product,
      recipient: 'ldinteriors.in@gmail.com',
      status: 'failed',
      error: error.message,
      smtpUser: hasSmtpConfig ? process.env.SMTP_USER : 'Ethereal Test Account',
    }).catch(err => console.error('Failed to save EmailLog:', err));

    throw error;
  }
};

module.exports = sendOrderEmail;

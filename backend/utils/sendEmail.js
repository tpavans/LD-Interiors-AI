const nodemailer = require('nodemailer');
const https = require('https');
const EmailLog = require('../models/EmailLog');
const Product = require('../models/Product');

/**
 * Sends a detailed order notification email.
 * Automatically switches between Resend, Brevo, and Nodemailer SMTP.
 * @param {object} order - The created mongoose order document
 */
const sendOrderEmail = async (order) => {
  const orderIdStr = order._id ? order._id.toString() : 'test_mock_id';
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

  // Fetch product category and price dynamically from database if possible
  let category = 'Furniture Design';
  let price = 'Contact for pricing';
  let imageUrl = order.imageUrl || '';

  if (order.productId) {
    try {
      const prod = await Product.findById(order.productId);
      if (prod) {
        category = prod.category || category;
        price = prod.price && prod.price > 0 ? `₹${prod.price.toLocaleString('en-IN')}` : 'Contact for pricing';
        if (prod.image) {
          imageUrl = prod.image.startsWith('http') ? prod.image : `https://ldinteriors.in${prod.image.startsWith('/') ? '' : '/'}${prod.image}`;
        }
      }
    } catch (err) {
      console.error('Error fetching product from DB for email:', err.message);
    }
  }

  // Exact text format requested by the user
  const textContent = `Hello Pavan Sai! I would like to place an order/inquiry via LD Interiors & Furnitures:

*Product Details:*
- Name: ${order.product}
- Category: ${category}
- Price: ${price}
${imageUrl ? `- Image URL: ${imageUrl}` : ''}

*Customer Details:*
- Name: ${order.name}
- Phone: ${order.phone}
- Notes/Sizing/Address: ${order.notes || 'No custom notes.'}`;

  // Clean HTML layout wrapping the exact text format + clickable call button
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e2d7c5; border-radius: 16px; background-color: #faf8f5; color: #423525; line-height: 1.6;">
      <div style="text-align: center; border-bottom: 2px solid #e2d7c5; padding-bottom: 15px; margin-bottom: 20px;">
        <h2 style="color: #6d553b; margin: 0; font-family: Georgia, serif;">LD Interiors & Furnitures</h2>
        <p style="font-size: 12px; text-transform: uppercase; letter-spacing: 2px; color: #8e7a65; margin: 5px 0 0 0;">New Order Notification</p>
      </div>

      <p style="font-size: 15px; font-weight: bold; color: #6d553b; margin-bottom: 15px;">Hello Pavan Sai! I would like to place an order/inquiry via LD Interiors & Furnitures:</p>

      <div style="background-color: #ffffff; border: 1px solid #ebdcc5; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
        <h3 style="color: #8e7a65; font-size: 14px; margin-top: 0; border-bottom: 1px solid #f2e9dc; padding-bottom: 5px; text-transform: uppercase; letter-spacing: 1px;">Product Details</h3>
        <ul style="list-style-type: none; padding-left: 0; margin: 0; font-size: 14px;">
          <li style="margin-bottom: 8px;"><strong>• Name:</strong> ${order.productId ? `<a href="https://ldinteriors.in/products/${order.productId}" target="_blank" style="color: #a07d57; text-decoration: none; font-weight: bold;">${order.product}</a>` : order.product}</li>
          <li style="margin-bottom: 8px;"><strong>• Category:</strong> ${category}</li>
          <li style="margin-bottom: 8px;"><strong>• Price:</strong> <span style="color: #6d553b; font-weight: bold;">${price}</span></li>
          ${imageUrl ? `<li style="margin-bottom: 8px; word-break: break-all;"><strong>• Image URL:</strong> <a href="${imageUrl}" target="_blank" style="color: #a07d57; text-decoration: underline;">${imageUrl}</a></li>` : ''}
        </ul>
      </div>

      <div style="background-color: #ffffff; border: 1px solid #ebdcc5; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
        <h3 style="color: #8e7a65; font-size: 14px; margin-top: 0; border-bottom: 1px solid #f2e9dc; padding-bottom: 5px; text-transform: uppercase; letter-spacing: 1px;">Customer Details</h3>
        <ul style="list-style-type: none; padding-left: 0; margin: 0; font-size: 14px;">
          <li style="margin-bottom: 8px;"><strong>• Name:</strong> <strong>${order.name}</strong></li>
          <li style="margin-bottom: 8px;"><strong>• Phone:</strong> <a href="tel:${dialPhone}" style="color: #a07d57; text-decoration: none; font-weight: bold;">📞 ${order.phone}</a></li>
          <li style="margin-bottom: 8px;"><strong>• Notes/Sizing/Address:</strong> <span style="font-style: italic; color: #5a4b3b;">${order.notes || 'No custom notes.'}</span></li>
        </ul>
      </div>

      <div style="margin-top: 20px; text-align: center; margin-bottom: 25px;">
        <a href="tel:${dialPhone}" style="background-color: #6d553b; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; box-shadow: 0 4px 6px rgba(0,0,0,0.1); font-size: 14px; border: 1px solid #523f2a;">
          📞 Call Customer: ${order.phone}
        </a>
      </div>

      ${imageUrl ? `
      <div style="text-align: center; background-color: #ffffff; border: 1px solid #ebdcc5; border-radius: 12px; padding: 15px; margin-bottom: 20px;">
        <p style="font-size: 12px; font-weight: bold; color: #8e7a65; margin: 0 0 10px 0;">Design Image Preview:</p>
        <img src="${imageUrl}" alt="Design Image" style="max-width: 100%; max-height: 250px; border-radius: 8px; border: 1px solid #ebdcc5;" />
        <p style="margin: 8px 0 0 0; font-size: 11px;">
          <a href="${imageUrl}" target="_blank" style="color: #a07d57; text-decoration: none;">Open Full-Res Image</a>
          ${order.productId ? ` &nbsp;|&nbsp; <a href="https://ldinteriors.in/products/${order.productId}" target="_blank" style="color: #a07d57; text-decoration: none; font-weight: bold;">View Website Product Page</a>` : ''}
        </p>
      </div>
      ` : ''}

      <div style="padding: 12px 15px; background-color: #f5eee4; border-left: 4px solid #6d553b; border-radius: 4px; font-size: 12px; line-height: 1.4; color: #5a4b3b;">
        <strong>Admin Status:</strong> Mr. Nagaraju has been redirected to chat on WhatsApp. Please check the backend database and follow up with Mr. Nagaraju for pricing finalization.
      </div>

      <div style="margin-top: 30px; text-align: center; border-top: 1px solid #e2d7c5; padding-top: 15px; font-size: 10px; color: #a59582;">
        This is an automated system notification from the LD Interiors & Furniture web platform. Order Timestamp: ${dateStr}.
      </div>
    </div>
  `;

  const subject = `🔔 New Order: ${order.product} from ${order.name}`;

  // 1. IF RESEND_API_KEY IS AVAILABLE, USE THE RESEND HTTP API (Never blocked by Render free tier, instant activation)
  if (process.env.RESEND_API_KEY) {
    console.log('RESEND_API_KEY detected. Sending email via Resend HTTP API...');
    
    return new Promise((resolve, reject) => {
      const data = JSON.stringify({
        from: `${order.name} via LD Interiors <onboarding@resend.dev>`,
        to: ['ldinteriors.in@gmail.com'],
        subject: subject,
        html: htmlContent,
        text: textContent
      });

      const options = {
        hostname: 'api.resend.com',
        port: 443,
        path: '/emails',
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data)
        }
      };

      const req = https.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => body += chunk);
        res.on('end', async () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            console.log('Order notification email sent successfully via Resend! Response:', body);
            // Log success to MongoDB
            await EmailLog.create({
              orderId: orderIdStr,
              product: order.product,
              recipient: 'ldinteriors.in@gmail.com',
              status: 'success',
              smtpUser: 'Resend API',
            }).catch(err => console.error('Failed to save EmailLog:', err));
            resolve();
          } else {
            const errMessage = `Resend API returned status ${res.statusCode}: ${body}`;
            console.error(errMessage);
            // Log failure to MongoDB
            await EmailLog.create({
              orderId: orderIdStr,
              product: order.product,
              recipient: 'ldinteriors.in@gmail.com',
              status: 'failed',
              error: errMessage,
              smtpUser: 'Resend API',
            }).catch(err => console.error('Failed to save EmailLog:', err));
            reject(new Error(errMessage));
          }
        });
      });

      req.on('error', async (err) => {
        console.error('Resend HTTP request failed:', err.message);
        // Log failure to MongoDB
        await EmailLog.create({
          orderId: orderIdStr,
          product: order.product,
          recipient: 'ldinteriors.in@gmail.com',
          status: 'failed',
          error: err.message,
          smtpUser: 'Resend API',
        }).catch(logErr => console.error('Failed to save EmailLog:', logErr));
        reject(err);
      });

      req.write(data);
      req.end();
    });
  }

  // 2. IF BREVO_API_KEY IS AVAILABLE, USE THE BREVO HTTP API (Never blocked by Render free tier)
  if (process.env.BREVO_API_KEY) {
    console.log('BREVO_API_KEY detected. Sending email via Brevo HTTP API...');
    
    return new Promise((resolve, reject) => {
      const data = JSON.stringify({
        sender: { name: `${order.name} via LD Interiors`, email: 'ldinteriors.in@gmail.com' },
        to: [
          { email: 'ldinteriors.in@gmail.com', name: 'LD Interiors Admin' }
        ],
        subject: subject,
        htmlContent: htmlContent,
        textContent: textContent
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
          'content-length': Buffer.byteLength(data)
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
              orderId: orderIdStr,
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
              orderId: orderIdStr,
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
          orderId: orderIdStr,
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

  // 3. FALLBACK TO SMTP (Localhost or other servers where SMTP is unblocked)
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
    text: textContent,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Order notification email sent successfully via SMTP! Message ID:', info.messageId);
    
    // Log success to MongoDB
    await EmailLog.create({
      orderId: orderIdStr,
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
      orderId: orderIdStr,
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

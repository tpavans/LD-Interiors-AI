const nodemailer = require('nodemailer');
const https = require('https');
const EmailLog = require('../models/EmailLog');
const Product = require('../models/Product');

/**
 * Common helper to dispatch emails using Resend, Brevo, or SMTP.
 */
const sendGenericEmail = async ({ to, subject, html, text, orderId, productName }) => {
  const orderIdStr = orderId ? orderId.toString() : 'test_mock_id';
  const pName = productName || 'Furniture Design';

  // 1. USE RESEND HTTP API IF RESEND_API_KEY IS CONFIGURED
  if (process.env.RESEND_API_KEY) {
    console.log(`Sending email to ${to} via Resend HTTP API...`);
    return new Promise((resolve, reject) => {
      const data = JSON.stringify({
        from: 'LD Interiors <onboarding@resend.dev>',
        to: Array.isArray(to) ? to : [to],
        subject: subject,
        html: html,
        text: text
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
            console.log(`Email successfully sent via Resend to ${to}!`);
            await EmailLog.create({
              orderId: orderIdStr,
              product: pName,
              recipient: Array.isArray(to) ? to.join(', ') : to,
              status: 'success',
              smtpUser: 'Resend API',
            }).catch(err => console.error('Failed to save EmailLog:', err));
            resolve();
          } else {
            const errMessage = `Resend API returned status ${res.statusCode}: ${body}`;
            console.error(errMessage);
            await EmailLog.create({
              orderId: orderIdStr,
              product: pName,
              recipient: Array.isArray(to) ? to.join(', ') : to,
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
        await EmailLog.create({
          orderId: orderIdStr,
          product: pName,
          recipient: Array.isArray(to) ? to.join(', ') : to,
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

  // 2. USE BREVO HTTP API IF BREVO_API_KEY IS CONFIGURED
  if (process.env.BREVO_API_KEY) {
    console.log(`Sending email to ${to} via Brevo HTTP API...`);
    return new Promise((resolve, reject) => {
      const data = JSON.stringify({
        sender: { name: 'LD Interiors & Furnitures', email: 'ldinteriors.in@gmail.com' },
        to: Array.isArray(to) ? to.map(e => ({ email: e })) : [{ email: to }],
        subject: subject,
        htmlContent: html,
        textContent: text
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
            console.log(`Email successfully sent via Brevo to ${to}!`);
            await EmailLog.create({
              orderId: orderIdStr,
              product: pName,
              recipient: Array.isArray(to) ? to.join(', ') : to,
              status: 'success',
              smtpUser: 'Brevo API',
            }).catch(err => console.error('Failed to save EmailLog:', err));
            resolve();
          } else {
            const errMessage = `Brevo API returned status ${res.statusCode}: ${body}`;
            console.error(errMessage);
            await EmailLog.create({
              orderId: orderIdStr,
              product: pName,
              recipient: Array.isArray(to) ? to.join(', ') : to,
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
        await EmailLog.create({
          orderId: orderIdStr,
          product: pName,
          recipient: Array.isArray(to) ? to.join(', ') : to,
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

  // 3. FALLBACK TO SMTP (Localhost or servers where SMTP is unblocked)
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
    from: hasSmtpConfig ? `"LD Interiors" <${process.env.SMTP_USER}>` : '"LD Interiors Test" <test@ldinteriors.com>',
    to: to,
    subject: subject,
    html: html,
    text: text,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email successfully sent via SMTP to ${to}! Message ID:`, info.messageId);
    
    await EmailLog.create({
      orderId: orderIdStr,
      product: pName,
      recipient: Array.isArray(to) ? to.join(', ') : to,
      status: 'success',
      smtpUser: hasSmtpConfig ? process.env.SMTP_USER : 'Ethereal Test Account',
    }).catch(err => console.error('Failed to save EmailLog:', err));

    if (!hasSmtpConfig) {
      console.log('Ethereal Test Mail Preview URL:', nodemailer.getTestMessageUrl(info));
    }
  } catch (error) {
    console.error('Nodemailer SMTP sendMail failed:', error.message);
    await EmailLog.create({
      orderId: orderIdStr,
      product: pName,
      recipient: Array.isArray(to) ? to.join(', ') : to,
      status: 'failed',
      error: error.message,
      smtpUser: hasSmtpConfig ? process.env.SMTP_USER : 'Ethereal Test Account',
    }).catch(err => console.error('Failed to save EmailLog:', err));
    throw error;
  }
};

/**
 * 1. Admin Email Notification (Sent to ldinteriors.in@gmail.com)
 */
const sendOrderEmail = async (order) => {
  const dateStr = order.createdAt 
    ? new Date(order.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) 
    : new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

  const rawPhone = order.phone || '';
  const cleanPhone = rawPhone.replace(/\D/g, '');
  let dialPhone = rawPhone;
  if (cleanPhone.length === 10) {
    dialPhone = `+91${cleanPhone}`;
  } else if (cleanPhone.length === 12 && cleanPhone.startsWith('91')) {
    dialPhone = `+${cleanPhone}`;
  } else if (cleanPhone.length > 0) {
    dialPhone = `+${cleanPhone}`;
  }

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
          imageUrl = prod.image.startsWith('http') ? prod.image : `https://ld-interiors-ai.vercel.app${prod.image.startsWith('/') ? '' : '/'}${prod.image}`;
        }
      }
    } catch (err) {
      console.error('Error fetching product from DB for email:', err.message);
    }
  }

  const textContent = `Hello Pavan Sai! I would like to place an order/inquiry via LD Interiors & Furnitures:

*Product Details:*
- Name: ${order.product}
- Category: ${category}
- Price: ${price}
${imageUrl ? `- Image URL: ${imageUrl}` : ''}

*Customer Details:*
- Name: ${order.name}
- Phone: ${order.phone}
- Gmail: ${order.email}
- Custom Size: ${order.customSize || 'Not specified'}
- Desired Cost: ${order.desiredPrice || 'Not specified'}
- Address: ${order.address}
- Notes/Sizing/Address: ${order.notes || 'No custom notes.'}`;

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
          <li style="margin-bottom: 8px;"><strong>• Name:</strong> ${order.productId ? `<a href="https://ld-interiors-ai.vercel.app/products/${order.productId}" target="_blank" style="color: #a07d57; text-decoration: none; font-weight: bold;">${order.product}</a>` : order.product}</li>
          <li style="margin-bottom: 8px;"><strong>• Category:</strong> ${category}</li>
          <li style="margin-bottom: 8px;"><strong>• Price:</strong> <span style="color: #6d553b; font-weight: bold;">${price}</span></li>
          ${imageUrl ? `<li style="margin-bottom: 8px; word-break: break-all;"><strong>• Image URL:</strong> <a href="${imageUrl}" target="_blank" style="color: #a07d57; text-decoration: underline;">${imageUrl}</a></li>` : ''}
        </ul>
      </div>

      <div style="background-color: #ffffff; border: 1px solid #ebdcc5; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
        <h3 style="color: #8e7a65; font-size: 14px; margin-top: 0; border-bottom: 1px solid #f2e9dc; padding-bottom: 5px; text-transform: uppercase; letter-spacing: 1px;">Customer & Delivery Details</h3>
        <ul style="list-style-type: none; padding-left: 0; margin: 0; font-size: 14px;">
          <li style="margin-bottom: 8px;"><strong>• Name:</strong> <strong>${order.name}</strong></li>
          <li style="margin-bottom: 8px;"><strong>• Phone:</strong> <a href="tel:${dialPhone}" style="color: #a07d57; text-decoration: none; font-weight: bold;">📞 ${order.phone}</a></li>
          <li style="margin-bottom: 8px;"><strong>• Gmail/Email:</strong> <a href="mailto:${order.email}" style="color: #a07d57; text-decoration: none;">${order.email}</a></li>
          <li style="margin-bottom: 8px;"><strong>• Delivery Address:</strong> ${order.address}</li>
          <li style="margin-bottom: 8px;"><strong>• Custom Size (Optional):</strong> ${order.customSize || 'Not specified'}</li>
          <li style="margin-bottom: 8px;"><strong>• Desired Budget/Price (Optional):</strong> ${order.desiredPrice || 'Not specified'}</li>
          <li style="margin-bottom: 8px;"><strong>• Notes/Customization:</strong> <span style="font-style: italic; color: #5a4b3b;">${order.notes || 'No custom notes.'}</span></li>
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
          ${order.productId ? ` &nbsp;|&nbsp; <a href="https://ld-interiors-ai.vercel.app/products/${order.productId}" target="_blank" style="color: #a07d57; text-decoration: none; font-weight: bold;">View Website Product Page</a>` : ''}
        </p>
        ${order.productId ? `
        <div style="margin-top: 10px; padding: 8px; background-color: #fcfbf9; border: 1px dashed #e5d8c3; border-radius: 6px; font-size: 10px; color: #8e7a65; word-break: break-all;">
          <strong>Direct URL (Copy/Paste fallback):</strong> https://ld-interiors-ai.vercel.app/products/${order.productId}
        </div>
        ` : ''}
      </div>
      ` : ''}

      <div style="padding: 12px 15px; background-color: #f5eee4; border-left: 4px solid #6d553b; border-radius: 4px; font-size: 12px; line-height: 1.4; color: #5a4b3b;">
        <strong>Admin Status:</strong> Mr. Nagaraju has been redirected to chat on WhatsApp. Please check the database and coordinate with the customer.
      </div>

      <div style="margin-top: 30px; text-align: center; border-top: 1px solid #e2d7c5; padding-top: 15px; font-size: 10px; color: #a59582;">
        This is an automated system notification from the LD Interiors & Furniture web platform. Order Timestamp: ${dateStr}.
      </div>
    </div>
  `;

  const subject = `🔔 New Order: ${order.product} from ${order.name}`;
  return sendGenericEmail({
    to: 'ldinteriors.in@gmail.com',
    subject,
    html: htmlContent,
    text: textContent,
    orderId: order._id,
    productName: order.product
  });
};

/**
 * 2. Customer Welcome greeting email on successful checkout receipt
 */
const sendCustomerGreetingEmail = async (order) => {
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
          imageUrl = prod.image.startsWith('http') ? prod.image : `https://ld-interiors-ai.vercel.app${prod.image.startsWith('/') ? '' : '/'}${prod.image}`;
        }
      }
    } catch (err) {
      console.error('Error fetching product from DB for customer greeting:', err.message);
    }
  }

  const textContent = `Hi ${order.name},

Your order has been received successfully!

*Order Details:*
- Selected Design: ${order.product}
- Category: ${category}
- Price: ${price}
- Custom Sizing: ${order.customSize || 'Not specified'}
- Desired Price/Budget: ${order.desiredPrice || 'Not specified'}
- Delivery Address: ${order.address}
- Notes/Customization: ${order.notes || 'No custom notes.'}

Our LD Interiors team (Nagaraju) will contact you within 24 hours to discuss specifications, carpentry wood sizing, and final contract parameters.

Thank you for choosing LD Interiors!

Warm regards,
Nagaraju (Owner)
LD Interiors & Furnitures`;

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e2d7c5; border-radius: 16px; background-color: #faf8f5; color: #423525; line-height: 1.6;">
      <div style="text-align: center; border-bottom: 2px solid #e2d7c5; padding-bottom: 15px; margin-bottom: 20px;">
        <h2 style="color: #6d553b; margin: 0; font-family: Georgia, serif;">LD Interiors & Furnitures</h2>
        <p style="font-size: 12px; text-transform: uppercase; letter-spacing: 2px; color: #8e7a65; margin: 5px 0 0 0;">Order Received Successfully</p>
      </div>

      <p style="font-size: 15px; font-weight: bold; color: #6d553b; margin-bottom: 15px;">Hi ${order.name},</p>
      <p style="font-size: 14px; margin-bottom: 15px;">Your order has been received successfully! We are excited to work with you on your custom furniture and interior designs.</p>

      <div style="background-color: #ffffff; border: 1px solid #ebdcc5; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
        <h3 style="color: #8e7a65; font-size: 14px; margin-top: 0; border-bottom: 1px solid #f2e9dc; padding-bottom: 5px; text-transform: uppercase; letter-spacing: 1px;">Order Details</h3>
        <ul style="list-style-type: none; padding-left: 0; margin: 0; font-size: 14px;">
          <li style="margin-bottom: 8px;"><strong>• Selected Design:</strong> ${order.product}</li>
          <li style="margin-bottom: 8px;"><strong>• Category:</strong> ${category}</li>
          <li style="margin-bottom: 8px;"><strong>• Price:</strong> <span style="color: #6d553b; font-weight: bold;">${price}</span></li>
          <li style="margin-bottom: 8px;"><strong>• Delivery Address:</strong> ${order.address}</li>
          <li style="margin-bottom: 8px;"><strong>• Custom Sizing:</strong> ${order.customSize || 'Not specified'}</li>
          <li style="margin-bottom: 8px;"><strong>• Desired Budget:</strong> ${order.desiredPrice || 'Not specified'}</li>
          <li style="margin-bottom: 8px;"><strong>• Custom Notes:</strong> <span style="font-style: italic; color: #5a4b3b;">${order.notes || 'No custom notes.'}</span></li>
        </ul>
      </div>

      <div style="padding: 12px 15px; background-color: #f5eee4; border-left: 4px solid #6d553b; border-radius: 4px; font-size: 13px; line-height: 1.5; color: #5a4b3b; margin-bottom: 20px;">
        <strong>What's Next?</strong><br />
        Our LD Interiors team (<strong>Nagaraju</strong>) will review your design requirements and get in touch with you within <strong>24 hours</strong> on your phone (<strong>${order.phone}</strong>).
      </div>

      <p style="font-size: 14px; margin-bottom: 5px;">Thank you for choosing LD Interiors!</p>
      <p style="font-size: 14px; font-weight: bold; color: #6d553b; margin: 0;">Nagaraju (Owner)</p>
      <p style="font-size: 12px; color: #8e7a65; margin: 0;">LD Interiors & Furnitures</p>

      <div style="margin-top: 30px; text-align: center; border-top: 1px solid #e2d7c5; padding-top: 15px; font-size: 10px; color: #a59582;">
        This is an automated system receipt sent to ${order.email}.
      </div>
    </div>
  `;

  const subject = `🎉 Order Received successfully! - ${order.product}`;
  return sendGenericEmail({
    to: order.email,
    subject,
    html: htmlContent,
    text: textContent,
    orderId: order._id,
    productName: order.product
  });
};

/**
 * 3. Customer order progress/status updates notification email
 */
const sendCustomerStatusUpdateEmail = async (order, status) => {
  const statusNotes = {
    'Pending': 'We have received your order request and are currently conducting initial custom requirement reviews.',
    'Processing': 'Processing (Final size and pricing check chesthunnamu - coordinating raw materials & custom wood selections)',
    'In Progress': 'In Progress (Modern Carpentry wood carvings framing Alamuru workshop lo modhalaindi - your custom structures are being built by our master craftsmen)',
    'Completed': 'Completed & Delivered (Direct home installation setups finished - your order has been successfully set up and completed)',
    'Cancelled': 'Cancelled (Cancel cheyabadindi - this order has been cancelled or modified)',
  };

  const statusNote = statusNotes[status] || 'Your order status has been updated.';

  const textContent = `Hi ${order.name},

Your order status for "${order.product}" has been updated to: ${status}.

*Timeline Note:*
${statusNote}

You can track your live orders timeline, view progress details, or submit reviews at any time:
👉 https://ld-interiors-ai.vercel.app/orders

Thank you for choosing LD Interiors!

Warm regards,
Nagaraju (Owner)
LD Interiors & Furnitures`;

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e2d7c5; border-radius: 16px; background-color: #faf8f5; color: #423525; line-height: 1.6;">
      <div style="text-align: center; border-bottom: 2px solid #e2d7c5; padding-bottom: 15px; margin-bottom: 20px;">
        <h2 style="color: #6d553b; margin: 0; font-family: Georgia, serif;">LD Interiors & Furnitures</h2>
        <p style="font-size: 12px; text-transform: uppercase; letter-spacing: 2px; color: #8e7a65; margin: 5px 0 0 0;">Live Progress Update</p>
      </div>

      <p style="font-size: 15px; font-weight: bold; color: #6d553b; margin-bottom: 15px;">Hi ${order.name},</p>
      <p style="font-size: 14px; margin-bottom: 15px;">We have updated the progress timeline for your order of <strong>${order.product}</strong>:</p>

      <div style="background-color: #ffffff; border: 1px solid #ebdcc5; border-radius: 12px; padding: 20px; margin-bottom: 20px; text-align: center;">
        <span style="font-size: 10px; font-weight: bold; text-transform: uppercase; color: #8e7a65; letter-spacing: 1px;">Current Timeline Status</span>
        <h3 style="font-size: 24px; color: #6d553b; margin: 8px 0; font-family: Georgia, serif;">${status}</h3>
        
        <div style="margin: 15px auto 0 auto; max-width: 420px; padding: 12px 15px; background-color: #faf8f5; border: 1px solid #ebdcc5; border-radius: 8px; font-size: 13px; color: #5a4b3b; line-height: 1.5; font-style: italic;">
          "${statusNote}"
        </div>
      </div>

      <div style="text-align: center; margin: 25px 0;">
        <a href="https://ld-interiors-ai.vercel.app/orders" target="_blank" style="background-color: #6d553b; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; box-shadow: 0 4px 6px rgba(0,0,0,0.1); font-size: 14px; border: 1px solid #523f2a;">
          🔎 Track Live Order Progress
        </a>
        <p style="margin: 8px 0 0 0; font-size: 10px; color: #a59582;">
          Direct tracker: https://ld-interiors-ai.vercel.app/orders
        </p>
      </div>

      <p style="font-size: 14px; margin-bottom: 5px;">Thank you for choosing LD Interiors!</p>
      <p style="font-size: 14px; font-weight: bold; color: #6d553b; margin: 0;">Nagaraju (Owner)</p>
      <p style="font-size: 12px; color: #8e7a65; margin: 0;">LD Interiors & Furnitures</p>

      <div style="margin-top: 30px; text-align: center; border-top: 1px solid #e2d7c5; padding-top: 15px; font-size: 10px; color: #a59582;">
        This progress notification was sent to ${order.email}.
      </div>
    </div>
  `;

  const subject = `🔨 Order Progress: ${order.product} is ${status}`;
  return sendGenericEmail({
    to: order.email,
    subject,
    html: htmlContent,
    text: textContent,
    orderId: order._id,
    productName: order.product
  });
};

module.exports = {
  sendOrderEmail,
  sendCustomerGreetingEmail,
  sendCustomerStatusUpdateEmail,
};

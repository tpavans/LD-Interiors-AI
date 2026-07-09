const nodemailer = require('nodemailer');
const https = require('https');
const EmailLog = require('../models/EmailLog');
const Product = require('../models/Product');

/**
 * Sends an email via the Resend HTTP API.
 */
const sendViaResend = async ({ to, subject, html, text, orderIdStr, pName }) => {
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
          reject(new Error(errMessage));
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.write(data);
    req.end();
  });
};

/**
 * Sends an email via the Brevo HTTP API.
 */
const sendViaBrevo = async ({ to, subject, html, text, orderIdStr, pName }) => {
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
          reject(new Error(errMessage));
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.write(data);
    req.end();
  });
};

/**
 * Sends an email via SMTP.
 */
const sendViaSMTP = async ({ to, subject, html, text, orderIdStr, pName }) => {
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
      throw err;
    }
  }

  const mailOptions = {
    from: hasSmtpConfig ? `"LD Interiors" <${process.env.SMTP_USER}>` : '"LD Interiors Test" <test@ldinteriors.com>',
    to: to,
    subject: subject,
    html: html,
    text: text,
  };

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
};

/**
 * Common self-healing fallback helper that tries Resend, Brevo, and SMTP.
 */
const sendGenericEmail = async ({ to, subject, html, text, orderId, productName }) => {
  const orderIdStr = orderId ? orderId.toString() : 'test_mock_id';
  const pName = productName || 'Furniture Design';
  
  let sent = false;
  let errors = [];

  // 1. Try Resend if configured
  if (process.env.RESEND_API_KEY) {
    try {
      await sendViaResend({ to, subject, html, text, orderIdStr, pName });
      sent = true;
      return;
    } catch (err) {
      console.warn(`Resend API failed for recipient ${to}. Error: ${err.message}. Attempting fallback...`);
      errors.push(`Resend: ${err.message}`);
    }
  }

  // 2. Try Brevo if configured and not sent
  if (!sent && process.env.BREVO_API_KEY) {
    try {
      await sendViaBrevo({ to, subject, html, text, orderIdStr, pName });
      sent = true;
      return;
    } catch (err) {
      console.warn(`Brevo API failed for recipient ${to}. Error: ${err.message}. Attempting fallback...`);
      errors.push(`Brevo: ${err.message}`);
    }
  }

  // 3. Fallback to SMTP if not sent
  if (!sent) {
    try {
      await sendViaSMTP({ to, subject, html, text, orderIdStr, pName });
      sent = true;
      return;
    } catch (err) {
      console.error(`SMTP fallback failed for recipient ${to}. Error: ${err.message}`);
      errors.push(`SMTP: ${err.message}`);
    }
  }

  // If all failed, log and reject
  if (!sent) {
    const combinedError = `All email transports failed for recipient ${to}. Errors: [${errors.join(', ')}]`;
    console.error(combinedError);
    await EmailLog.create({
      orderId: orderIdStr,
      product: pName,
      recipient: Array.isArray(to) ? to.join(', ') : to,
      status: 'failed',
      error: combinedError,
      smtpUser: 'All Transports Failed',
    }).catch(err => console.error('Failed to save EmailLog:', err));
    throw new Error(combinedError);
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

  const welcomeMsgText = `🏠 Welcome to LD Interiors!

Hello Mr./Ms. ${order.name}, 👋

Thank you for choosing LD Interiors. We sincerely appreciate your trust in us.

🎉 Your order has been received successfully!

📦 Order Details
🪑 Product: ${order.product}
📂 Category: ${category}
📅 Order Date: ${dateStr}
💰 Price: ${price}

Our team is currently reviewing your order. One of our interior design experts will contact you within 24 hours to confirm your order, discuss your requirements, and guide you through the next steps.

🌐 Track your order anytime by visiting our website:
https://ld-interiors-ai.vercel.app/

If you have any questions or need assistance, feel free to contact us anytime.

Thank you for choosing LD Interiors. We look forward to transforming your dream space into reality. ❤️

Warm Regards,

🏠 LD Interiors Team
📞 +91 93463 25291

"Designing Beautiful Spaces, Creating Happy Homes." ✨

=========================================

🏠 LD Interiors కి స్వాగతం!

నమస్కారం ${order.name} గారికి, 🙏

LD Interiors ను ఎంపిక చేసుకున్నందుకు హృదయపూర్వక ధన్యవాదాలు.

🎉 మీ ఆర్డర్ విజయవంతంగా మాకు అందింది.

📦 మీ ఆర్డర్ వివరాలు
🪑 ఉత్పత్తి: ${order.product}
📂 విభాగం: ${category}
📅 ఆర్డర్ చేసిన తేదీ: ${dateStr}
💰 ధర: ${price}

మీ ఆర్డర్ను మా నిపుణుల బృందం పరిశీలిస్తోంది.

📞 రాబోయే 24 గంటల్లోపు మా LD Interiors ప్రతినిధి మిమ్మల్ని సంప్రదించి, మీ ఆర్డర్ను నిర్ధారించి తదుపరి ప్రక్రియ గురించి పూర్తి వివరాలు తెలియజేస్తారు.

🌐 మీ ఆర్డర్ పురోగతిని ఎప్పుడైనా మా వెబ్సైట్లో ట్రాక్ చేయవచ్చు:
https://ld-interiors-ai.vercel.app/

🔍 'My Orders' విభాగంలోకి వెళ్లి మీ ఆర్డర్ స్థితిని సులభంగా తెలుసుకోవచ్చు.

✨ మీ కలల ఇంటిని అందంగా, ఆధునికంగా, మీ అభిరుచికి అనుగుణంగా తీర్చిదిద్దడం మా లక్ష్యం.

మాపై మీరు ఉంచిన నమ్మకానికి మరోసారి హృదయపూర్వక ధన్యవాదాలు. మీ ఇంటిని మరింత అందంగా తీర్చిదిద్దే ఈ ప్రయాణంలో మీతో కలిసి ఉండడం మా అదృష్టంగా భావిస్తున్నాము. ❤️

ధన్యవాదాలతో,

🏠 LD Interiors బృందం
📞 +91 93463 25291
🌐 https://ld-interiors-ai.vercel.app/

"మీ కలలకు అందమైన రూపం... మీ ఇంటికి అద్భుతమైన డిజైన్... అదే LD Interiors." ✨`;

  const dashboardLink = `https://ld-interiors-ai.vercel.app/admin?action=send-greeting&orderId=${order._id}`;

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
        <a href="${dashboardLink}" style="background-color: #2e7d32; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; box-shadow: 0 4px 6px rgba(0,0,0,0.1); font-size: 14px; border: 1px solid #1b5e20; margin-right: 8px;">
          ✉️ Send Greeting (1-Click)
        </a>
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

  const orderDate = order.createdAt 
    ? new Date(order.createdAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        timeZone: 'Asia/Kolkata'
      })
    : new Date().toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        timeZone: 'Asia/Kolkata'
      });

  const orderTime = order.createdAt 
    ? new Date(order.createdAt).toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZone: 'Asia/Kolkata'
      })
    : new Date().toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZone: 'Asia/Kolkata'
      });

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

  const resolvedImageUrl = imageUrl || 'https://ld-interiors-ai.vercel.app/products';

  const textContent = `🏠 Welcome to LD Interiors!

Hello Mr./Ms. ${order.name}, 👋

Thank you for choosing LD Interiors. We sincerely appreciate your trust in us.

🎉 Your order has been received successfully!

📦 Order Details
🪑 Name: ${order.product}
📂 Category: ${category}
💰 Price: ${price}
🖼️ Image URL: ${resolvedImageUrl}
📅 Order Date: ${orderDate}
⏰ Order Time: ${orderTime}

Our team is currently reviewing your order. One of our interior design experts will contact you within 24 hours to confirm your order, discuss your requirements, and guide you through the next steps.

🌐 Track your order anytime by visiting our website:
https://ld-interiors-ai.vercel.app/

If you have any questions or need assistance, feel free to contact us anytime.

Thank you for choosing LD Interiors. We look forward to transforming your dream space into reality. ❤️

Warm Regards,

🏠 LD Interiors Team
📞 +91 93463 25291

"Designing Beautiful Spaces, Creating Happy Homes." ✨

---------------------------------------------------------

🏠 LD Interiors కి స్వాగతం!

నమస్కారం ${order.name} గారికి, 🙏

LD Interiors ను ఎంపిక చేసుకున్నందుకు హృదయపూర్వక ధన్యవాదాలు.

🎉 మీ ఆర్డర్ విజయవంతంగా మాకు అందింది.

📦 మీ ఆర్డర్ వివరాలు
🪑 ఉత్పత్తి పేరు: ${order.product}
📂 విభాగం: ${category}
💰 ధర: ${price}
🖼️ చిత్రం లింక్: ${resolvedImageUrl}
📅 తేదీ: ${orderDate}
⏰ సమయం: ${orderTime}

మీ ఆర్డర్ను మా నిపుణుల బృందం పరిశీలిస్తోంది.

📞 రాబోయే 24 గంటల్లోపు మా LD Interiors ప్రతినిధి మిమ్మల్ని సంప్రదించి, మీ ఆర్డర్ను నిర్ధారించి తదుపరి ప్రక్రియ గురించి పూర్తి వివరాలు తెలియజేస్తారు.

🌐 మీ ఆర్డర్ పురోగతిని ఎప్పుడైనా మా వెబ్సైట్లో ట్రాక్ చేయవచ్చు:
https://ld-interiors-ai.vercel.app/

🔍 'My Orders' విభాగంలోకి వెళ్లి మీ ఆర్డర్ స్థితిని సులభంగా తెలుసుకోవచ్చు.

✨ మీ కలల ఇంటిని అందంగా, ఆధునికంగా, మీ అభిరుచికి అనుగుణంగా తీర్చిదిద్దడం మా లక్ష్యం.

మాపై మీరు ఉంచిన నమ్మకానికి మరోసారి హృదయపూర్వక ధన్యవాదాలు. మీ ఇంటిని మరింత అందంగా తీర్చిదిద్దే ఈ ప్రయాణంలో మీతో కలిసి ఉండడం మా అదృష్టంగా భావిస్తున్నాము. ❤️

ధన్యవాదాలతో,

🏠 LD Interiors బృందం
📞 +91 93463 25291
🌐 https://ld-interiors-ai.vercel.app/

"మీ కలలకు అందమైన రూపం... మీ ఇంటికి అద్భుతమైన డిజైన్... అదే LD Interiors." ✨`;

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e2d7c5; border-radius: 16px; background-color: #faf8f5; color: #423525; line-height: 1.6;">
      <div style="text-align: center; border-bottom: 2px solid #e2d7c5; padding-bottom: 15px; margin-bottom: 20px;">
        <h2 style="color: #6d553b; margin: 0; font-family: Georgia, serif;">LD Interiors & Furnitures</h2>
        <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #8e7a65; margin: 5px 0 0 0;">Order Received / ఆర్డర్ అందింది</p>
      </div>

      <!-- English Version -->
      <div style="margin-bottom: 30px;">
        <h3 style="color: #6d553b; font-family: Georgia, serif; font-size: 16px; margin-top: 0; border-left: 4px solid #a07d57; padding-left: 10px;">🏠 Welcome to LD Interiors!</h3>
        <p style="font-size: 14px;">Hello Mr./Ms. <strong>${order.name}</strong>, 👋</p>
        <p style="font-size: 14px;">Thank you for choosing LD Interiors. We sincerely appreciate your trust in us.</p>
        <p style="font-size: 14px; font-weight: bold; color: #3d8b40;">🎉 Your order has been received successfully!</p>

        <div style="background-color: #ffffff; border: 1px solid #ebdcc5; border-radius: 12px; padding: 18px; margin: 15px 0;">
          <h4 style="color: #8e7a65; font-size: 12px; margin-top: 0; margin-bottom: 10px; border-bottom: 1px solid #f2e9dc; padding-bottom: 5px; text-transform: uppercase; letter-spacing: 1px;">📦 Order Details</h4>
          <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
            <tr><td style="padding: 4px 0; color: #8e7a65; width: 30%;">🪑 Name:</td><td style="padding: 4px 0; font-weight: bold;">${order.product}</td></tr>
            <tr><td style="padding: 4px 0; color: #8e7a65;">📂 Category:</td><td style="padding: 4px 0;">${category}</td></tr>
            <tr><td style="padding: 4px 0; color: #8e7a65;">💰 Price:</td><td style="padding: 4px 0; font-weight: bold; color: #6d553b;">${price}</td></tr>
            <tr><td style="padding: 4px 0; color: #8e7a65;">🖼️ Image URL:</td><td style="padding: 4px 0; word-break: break-all;"><a href="${resolvedImageUrl}" target="_blank" style="color: #a07d57; text-decoration: underline;">${resolvedImageUrl}</a></td></tr>
            <tr><td style="padding: 4px 0; color: #8e7a65;">📅 Order Date:</td><td style="padding: 4px 0;">${orderDate}</td></tr>
            <tr><td style="padding: 4px 0; color: #8e7a65;">⏰ Order Time:</td><td style="padding: 4px 0;">${orderTime}</td></tr>
          </table>
        </div>

        <p style="font-size: 14px;">Our team is currently reviewing your order. One of our interior design experts will contact you within 24 hours to confirm your order, discuss your requirements, and guide you through the next steps.</p>
        
        <div style="text-align: center; margin: 20px 0;">
          <a href="https://ld-interiors-ai.vercel.app/orders" target="_blank" style="background-color: #6d553b; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 13px; border: 1px solid #523f2a;">
            🌐 Track Your Order
          </a>
        </div>

        <p style="font-size: 13px; color: #8e7a65; font-style: italic; text-align: center; margin-top: 15px;">"Designing Beautiful Spaces, Creating Happy Homes." ✨</p>
      </div>

      ${imageUrl ? `
      <div style="text-align: center; background-color: #ffffff; border: 1px solid #ebdcc5; border-radius: 12px; padding: 15px; margin: 20px 0;">
        <p style="font-size: 11px; font-weight: bold; color: #8e7a65; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 1.5px;">🖼️ Ordered Design Preview / ఎంపిక చేసిన డిజైన్:</p>
        <img src="${imageUrl}" alt="Design Image" style="max-width: 100%; max-height: 250px; border-radius: 8px; border: 1px solid #ebdcc5; display: inline-block;" />
      </div>
      ` : ''}

      <hr style="border: 0; border-top: 1px dashed #ebdcc5; margin: 25px 0;" />

      <!-- Telugu Version -->
      <div>
        <h3 style="color: #6d553b; font-family: Georgia, serif; font-size: 16px; margin-top: 0; border-left: 4px solid #a07d57; padding-left: 10px;">🏠 LD Interiors కి స్వాగతం!</h3>
        <p style="font-size: 14px;">నమస్కారం <strong>${order.name}</strong> గారికి, 🙏</p>
        <p style="font-size: 14px;">LD Interiors ను ఎంపిక చేసుకున్నందుకు హృదయపూర్వక ధన్యవాదాలు.</p>
        <p style="font-size: 14px; font-weight: bold; color: #3d8b40;">🎉 మీ ఆర్డర్ విజయవంతంగా మాకు అందింది.</p>

        <div style="background-color: #ffffff; border: 1px solid #ebdcc5; border-radius: 12px; padding: 18px; margin: 15px 0;">
          <h4 style="color: #8e7a65; font-size: 12px; margin-top: 0; margin-bottom: 10px; border-bottom: 1px solid #f2e9dc; padding-bottom: 5px; text-transform: uppercase; letter-spacing: 1px;">📦 మీ ఆర్డర్ వివరాలు</h4>
          <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
            <tr><td style="padding: 4px 0; color: #8e7a65; width: 30%;">🪑 ఉత్పత్తి పేరు:</td><td style="padding: 4px 0; font-weight: bold;">${order.product}</td></tr>
            <tr><td style="padding: 4px 0; color: #8e7a65;">📂 విభాగం:</td><td style="padding: 4px 0;">${category}</td></tr>
            <tr><td style="padding: 4px 0; color: #8e7a65;">💰 ధర:</td><td style="padding: 4px 0; font-weight: bold; color: #6d553b;">${price}</td></tr>
            <tr><td style="padding: 4px 0; color: #8e7a65;">🖼️ చిత్రం లింక్:</td><td style="padding: 4px 0; word-break: break-all;"><a href="${resolvedImageUrl}" target="_blank" style="color: #a07d57; text-decoration: underline;">${resolvedImageUrl}</a></td></tr>
            <tr><td style="padding: 4px 0; color: #8e7a65;">📅 తేదీ:</td><td style="padding: 4px 0;">${orderDate}</td></tr>
            <tr><td style="padding: 4px 0; color: #8e7a65;">⏰ సమయం:</td><td style="padding: 4px 0;">${orderTime}</td></tr>
          </table>
        </div>

        <p style="font-size: 14px;">మీ ఆర్డర్ను మా నిపుణుల బృందం పరిశీలిస్తోంది. రాబోయే 24 గంటల్లోపు మా LD Interiors ప్రతినిధి మిమ్మల్ని సంప్రదించి, మీ ఆర్డర్ను నిర్ధారించి తదుపరి ప్రక్రియ గురించి పూర్తి వివరాలు తెలియజేస్తారు.</p>
        
        <p style="font-size: 14px;">మీ ఆర్డర్ పురోగతిని ఎప్పుడైనా మా వెబ్సైట్లో ట్రాక్ చేయవచ్చు. <strong>'My Orders'</strong> విభాగంలోకి వెళ్లి మీ ఆర్డర్ స్థితిని సులభంగా తెలుసుకోవచ్చు.</p>

        <p style="font-size: 14px; font-style: italic; font-weight: bold; color: #6d553b; margin-top: 15px;">✨ మీ కలల ఇంటిని అందంగా, ఆధునికంగా, మీ అభిరుచికి అనుగుణంగా తీర్చిదిద్దడం మా లక్ష్యం.</p>

        <p style="font-size: 13px; color: #8e7a65; font-style: italic; text-align: center; margin-top: 15px;">"మీ కలలకు అందమైన రూపం... మీ ఇంటికి అద్భుతమైన డిజైన్... అదే LD Interiors." ✨</p>
      </div>

      <!-- Footer Contact -->
      <div style="margin-top: 30px; padding-top: 15px; border-top: 2px solid #e2d7c5; font-size: 12px; color: #6d553b;">
        <p style="margin: 5px 0;"><strong>🏠 LD Interiors బృందం / LD Interiors Team</strong></p>
        <p style="margin: 5px 0;">📞 Call/WhatsApp: +91 93463 25291</p>
        <p style="margin: 5px 0;">🌐 Website: <a href="https://ld-interiors-ai.vercel.app/" target="_blank" style="color: #a07d57; text-decoration: none;">https://ld-interiors-ai.vercel.app/</a></p>
      </div>
    </div>
  `;

  const subject = `🎉 Order Received successfully! - ${order.product} | ఆర్డర్ విజయవంతంగా అందింది!`;
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

/**
 * 4. Admin Support Ticket Notification Email (Sent to ldinteriors.in@gmail.com)
 */
const sendCustomerSupportEmail = async (support) => {
  const dateStr = support.createdAt 
    ? new Date(support.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) 
    : new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

  const rawPhone = support.phone || '';
  const cleanPhone = rawPhone.replace(/\D/g, '');
  let dialPhone = rawPhone;
  if (cleanPhone.length === 10) {
    dialPhone = `+91${cleanPhone}`;
  } else if (cleanPhone.length === 12 && cleanPhone.startsWith('91')) {
    dialPhone = `+${cleanPhone}`;
  } else if (cleanPhone.length > 0) {
    dialPhone = `+${cleanPhone}`;
  }

  const textContent = `Hello Pavan Sai! A customer has submitted a support ticket on LD Interiors & Furnitures:

Customer Details:
- Name: ${support.name}
- Phone: ${support.phone}
- Email: ${support.email}

Problem Description/Issue:
"${support.issue}"

Please contact the customer to resolve the issue as soon as possible.`;

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #ebdcc5; border-radius: 16px; background-color: #faf8f5; color: #423525; line-height: 1.6;">
      <div style="text-align: center; border-bottom: 2px solid #e2d7c5; padding-bottom: 15px; margin-bottom: 20px;">
        <h2 style="color: #6d553b; margin: 0; font-family: Georgia, serif;">LD Interiors & Furnitures</h2>
        <p style="font-size: 12px; text-transform: uppercase; letter-spacing: 2px; color: #d9534f; margin: 5px 0 0 0; font-weight: bold;">⚠️ New Support Ticket Received</p>
      </div>

      <p style="font-size: 15px; font-weight: bold; color: #6d553b; margin-bottom: 15px;">Hello Pavan Sai!</p>
      <p style="font-size: 14px; margin-bottom: 15px;">A customer has submitted a support request on the LD Interiors website. Here are the ticket details:</p>

      <div style="background-color: #ffffff; border: 1px solid #ebdcc5; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
        <h3 style="color: #8e7a65; font-size: 14px; margin-top: 0; border-bottom: 1px solid #f2e9dc; padding-bottom: 5px; text-transform: uppercase; letter-spacing: 1px;">Customer Details</h3>
        <ul style="list-style-type: none; padding-left: 0; margin: 0; font-size: 14px;">
          <li style="margin-bottom: 8px;"><strong>• Customer Name:</strong> ${support.name}</li>
          <li style="margin-bottom: 8px;"><strong>• Phone Number:</strong> <a href="tel:${dialPhone}" style="color: #a07d57; text-decoration: none; font-weight: bold;">📞 ${support.phone}</a></li>
          <li style="margin-bottom: 8px;"><strong>• Email Address:</strong> <a href="mailto:${support.email}" style="color: #a07d57; text-decoration: none;">${support.email}</a></li>
        </ul>
      </div>

      <div style="background-color: #ffffff; border: 1px solid #ebdcc5; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
        <h3 style="color: #c9302c; font-size: 14px; margin-top: 0; border-bottom: 1px solid #f2e9dc; padding-bottom: 5px; text-transform: uppercase; letter-spacing: 1px;">Problem Description</h3>
        <div style="font-size: 13px; color: #423525; padding: 12px; background-color: #fcfbf9; border-left: 4px solid #d9534f; border-radius: 4px; line-height: 1.5; font-style: italic;">
          "${support.issue}"
        </div>
      </div>

      <div style="margin-top: 20px; text-align: center; margin-bottom: 25px;">
        <a href="tel:${dialPhone}" style="background-color: #d9534f; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; box-shadow: 0 4px 6px rgba(0,0,0,0.1); font-size: 14px; border: 1px solid #d43f3a;">
          📞 Call Customer to Resolve
        </a>
      </div>

      <div style="margin-top: 30px; text-align: center; border-top: 1px solid #e2d7c5; padding-top: 15px; font-size: 10px; color: #a59582;">
        This is an automated system notification from the LD Interiors & Furniture web platform. Support Ticket Timestamp: ${dateStr}.
      </div>
    </div>
  `;

  const subject = `⚠️ Support Ticket: New request from ${support.name}`;
  return sendGenericEmail({
    to: 'ldinteriors.in@gmail.com',
    subject,
    html: htmlContent,
    text: textContent,
    orderId: support._id,
    productName: 'Support Request'
  });
};

const sendAdminPaymentAlertEmail = async (order, amount, utrNumber) => {
  const textContent = `Hello Pavan Sai! A customer has submitted a payment for order verification:
  
Customer Details:
- Name: ${order.name}
- Phone: ${order.phone}
- Order Product: ${order.product}
- Submitted Amount: ₹${amount.toLocaleString('en-IN')}
- UPI ID / UTR Number: ${utrNumber}

Please check your GooglePay/PhonePe account and verify the transaction.`;

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #ebdcc5; border-radius: 16px; background-color: #faf8f5; color: #423525; line-height: 1.6;">
      <div style="text-align: center; border-bottom: 2px solid #e2d7c5; padding-bottom: 15px; margin-bottom: 20px;">
        <h2 style="color: #6d553b; margin: 0; font-family: Georgia, serif;">LD Interiors & Furnitures</h2>
        <p style="font-size: 12px; text-transform: uppercase; letter-spacing: 2px; color: #f0ad4e; margin: 5px 0 0 0; font-weight: bold;">💰 New Payment Verification Request</p>
      </div>

      <p style="font-size: 15px; font-weight: bold; color: #6d553b; margin-bottom: 15px;">Hello Pavan Sai!</p>
      <p style="font-size: 14px; margin-bottom: 15px;">A payment verification submission has been received for order <strong>${order.product}</strong>:</p>

      <div style="background-color: #ffffff; border: 1px solid #ebdcc5; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
        <h3 style="color: #8e7a65; font-size: 14px; margin-top: 0; border-bottom: 1px solid #f2e9dc; padding-bottom: 5px; text-transform: uppercase; letter-spacing: 1px;">Payment & UTR Details</h3>
        <ul style="list-style-type: none; padding-left: 0; margin: 0; font-size: 14px;">
          <li style="margin-bottom: 8px;"><strong>• Customer Name:</strong> ${order.name}</li>
          <li style="margin-bottom: 8px;"><strong>• Phone Number:</strong> ${order.phone}</li>
          <li style="margin-bottom: 8px;"><strong>• Submitted Amount:</strong> <span style="font-size: 16px; font-weight: bold; color: #2e7d32;">₹${amount.toLocaleString('en-IN')}</span></li>
          <li style="margin-bottom: 8px;"><strong>• UTR / Transaction ID:</strong> <span style="font-family: monospace; font-weight: bold; color: #c9302c;">${utrNumber}</span></li>
        </ul>
      </div>

      <div style="margin-top: 20px; text-align: center; margin-bottom: 25px;">
        <a href="https://ld-interiors-ai.vercel.app/admin" style="background-color: #2e7d32; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; box-shadow: 0 4px 6px rgba(0,0,0,0.1); font-size: 14px; border: 1px solid #1b5e20;">
          🔑 Open Admin Dashboard to Verify
        </a>
      </div>

      <div style="margin-top: 30px; text-align: center; border-top: 1px solid #e2d7c5; padding-top: 15px; font-size: 10px; color: #a59582;">
        This notification was sent automatically to verify order payment.
      </div>
    </div>
  `;

  const subject = `💰 Verify Payment: ₹${amount.toLocaleString('en-IN')} from ${order.name}`;
  return sendGenericEmail({
    to: 'ldinteriors.in@gmail.com',
    subject,
    html: htmlContent,
    text: textContent,
    orderId: order._id,
    productName: 'Payment Alert'
  });
};

const sendCustomerPaymentReceiptEmail = async (order, amountPaid) => {
  const balanceStr = order.remainingBalance > 0 ? `₹${order.remainingBalance.toLocaleString('en-IN')}` : 'Nil (Paid in Full)';
  const dateStr = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  const textContent = `🏠 Payment Receipt - LD Interiors & Furnitures

Dear ${order.name},

Thank you for your payment! We have successfully verified your transaction.

Payment Details:
- Order Reference: ${order.product}
- Amount Paid: ₹${amountPaid.toLocaleString('en-IN')}
- Total Paid to Date: ₹${order.paidAmount.toLocaleString('en-IN')}
- Remaining Balance (Due on Delivery): ${balanceStr}
- Receipt Date: ${dateStr}

We have updated your project timeline. You can view your project status on the orders tracker at:
https://ld-interiors-ai.vercel.app/orders

Warm regards,
Nagaraju (Owner)
LD Interiors & Furnitures`;

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #ebdcc5; border-radius: 16px; background-color: #faf8f5; color: #423525; line-height: 1.6;">
      <div style="text-align: center; border-bottom: 2px solid #e2d7c5; padding-bottom: 15px; margin-bottom: 20px;">
        <h2 style="color: #6d553b; margin: 0; font-family: Georgia, serif;">LD Interiors & Furnitures</h2>
        <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #2e7d32; margin: 5px 0 0 0; font-weight: bold;">📄 Official Payment Receipt / రసీదు</p>
      </div>

      <p style="font-size: 14px;">Dear <strong>${order.name}</strong> గారికి, 🙏</p>
      <p style="font-size: 14px;">We are pleased to inform you that your payment has been successfully verified and credited to your order statement.</p>

      <div style="background-color: #ffffff; border: 1px solid #ebdcc5; border-radius: 12px; padding: 20px; margin: 20px 0; box-shadow: 0 2px 4px rgba(44, 26, 15, 0.02);">
        <h3 style="color: #8e7a65; font-size: 12px; margin-top: 0; border-bottom: 1px solid #f2e9dc; padding-bottom: 8px; text-transform: uppercase; letter-spacing: 1px; font-weight: bold;">🧾 Payment Summary / ఇన్వాయిస్ వివరాలు</h3>
        <table style="width: 100%; font-size: 13px; border-collapse: collapse; margin-top: 10px;">
          <tr style="border-bottom: 1px solid #f9f6f0;"><td style="padding: 8px 0; color: #8e7a65;">🪑 Product:</td><td style="padding: 8px 0; font-weight: bold; text-align: right;">${order.product}</td></tr>
          <tr style="border-bottom: 1px solid #f9f6f0;"><td style="padding: 8px 0; color: #8e7a65;">💵 Total Agreed Cost:</td><td style="padding: 8px 0; font-weight: bold; text-align: right;">₹${order.totalPrice.toLocaleString('en-IN')}</td></tr>
          <tr style="border-bottom: 1px solid #f9f6f0;"><td style="padding: 8px 0; color: #2e7d32; font-weight: bold;">💰 Amount Verified (Installment):</td><td style="padding: 8px 0; font-weight: bold; color: #2e7d32; text-align: right;">₹${amountPaid.toLocaleString('en-IN')}</td></tr>
          <tr style="border-bottom: 1px solid #f9f6f0;"><td style="padding: 8px 0; color: #8e7a65;">📊 Total Paid to Date:</td><td style="padding: 8px 0; font-weight: bold; text-align: right;">₹${order.paidAmount.toLocaleString('en-IN')}</td></tr>
          <tr style="background-color: #fdfaf5;"><td style="padding: 10px 8px; color: #c9302c; font-weight: bold;">⚖️ Remaining Balance (Due on Delivery):</td><td style="padding: 10px 8px; font-weight: bold; color: #c9302c; text-align: right; font-size: 14px;">₹${order.remainingBalance.toLocaleString('en-IN')}</td></tr>
        </table>
      </div>

      <div style="background-color: #e8f5e9; border-left: 4px solid #2e7d32; border-radius: 4px; padding: 12px; font-size: 13px; color: #1b5e20; line-height: 1.5; margin-bottom: 20px;">
        <strong>Telugu / తెలుగు:</strong> మీ ఆర్దర్ (ఉత్పత్తి: ${order.product}) కి పంపిన బుకింగ్ అడ్వాన్స్ <strong>₹${amountPaid.toLocaleString('en-IN')}</strong> విజయవంతంగా జమ చేయబడింది. డెలివరీ సమయంలో చెల్లించాల్సిన మిగిలిన బ్యాలెన్స్ మొత్తం <strong>₹${order.remainingBalance.toLocaleString('en-IN')}</strong>.
      </div>

      <div style="text-align: center; margin: 25px 0;">
        <a href="https://ld-interiors-ai.vercel.app/orders" target="_blank" style="background-color: #6d553b; color: #ffffff; padding: 11px 22px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 13px; border: 1px solid #523f2a; box-shadow: 0 4px 6px rgba(0,0,0,0.08);">
          🔎 Track Project Progress
        </a>
      </div>

      <p style="font-size: 13px; margin-bottom: 5px;">Thank you for your business! We look forward to delivering your design.</p>
      <p style="font-size: 13px; font-weight: bold; color: #6d553b; margin: 0;">Nagaraju (Owner)</p>
      <p style="font-size: 11px; color: #8e7a65; margin: 0;">LD Interiors & Furnitures</p>

      <div style="margin-top: 30px; text-align: center; border-top: 1px solid #e2d7c5; padding-top: 15px; font-size: 10px; color: #a59582;">
        This receipt statement was sent automatically to ${order.email} on ${dateStr}.
      </div>
    </div>
  `;

  const subject = `📄 Receipt Statement: verified payment of ₹${amountPaid.toLocaleString('en-IN')} | LD Interiors`;
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
  sendCustomerSupportEmail,
  sendAdminPaymentAlertEmail,
  sendCustomerPaymentReceiptEmail,
};

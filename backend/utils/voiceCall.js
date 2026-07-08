const twilio = require('twilio');
const https = require('https');

/**
 * Escapes characters that are reserved in XML/TwiML
 * @param {string} unsafe - The raw unsafe string
 * @returns {string} The XML-safe string
 */
const escapeXml = (unsafe) => {
  if (!unsafe) return '';
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
};

/**
 * Triggers a conversational AI voice call using Vapi.ai
 * @param {Object} order - The order document
 * @param {string} cleanPhone - Customer phone number
 * @param {string} firstName - Customer first name
 * @param {string} shortProduct - Simplified product name
 * @returns {Promise<Object>}
 */
const triggerVapiConversationalCall = (order, cleanPhone, firstName, shortProduct) => {
  return new Promise((resolve, reject) => {
    const vapiApiKey = process.env.VAPI_API_KEY;
    const vapiPhoneNumberId = process.env.VAPI_PHONE_NUMBER_ID;

    console.log(`[Vapi AI Voice Agent] Placing conversational call to: ${cleanPhone}`);

    const postData = JSON.stringify({
      phoneNumberId: vapiPhoneNumberId,
      customer: {
        number: cleanPhone,
        name: firstName
      },
      assistant: {
        firstMessage: `నమస్కారం ${firstName} గారు! ఎల్ డి ఇంటీరియర్స్ కి స్వాగతం. ${shortProduct} కోసం మీ ఆర్డర్ వివరాలు మాకు విజయవంతంగా నమోదయ్యాయి. నేను మీకు ఎలా సహాయపడగలను?`,
        model: {
          provider: 'openai',
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `You are a friendly, professional customer service AI assistant for LD Interiors & Furnitures. 
              The customer's name is ${firstName}. They just ordered: ${shortProduct}.
              Your goal:
              1. Speak in clear, polite, natural Telugu. 
              2. Confirm their order details and ask if they have any custom sizing, raw wood preferences (like premium teak wood), or design questions.
              3. Keep your answers brief, warm, and helpful.
              4. Tell them that the LD Interiors team will contact them within 24 hours to confirm pricing and details.
              5. Keep your responses short (under 2 sentences) to maintain a natural phone flow.`
            }
          ]
        },
        voice: {
          provider: 'azure',
          voiceId: 'te-IN-ShrutiNeural'
        }
      }
    });

    const options = {
      hostname: 'api.vapi.ai',
      port: 443,
      path: '/call',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${vapiApiKey}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          const responseData = JSON.parse(body);
          console.log(`[Vapi AI Voice Agent] Call initiated successfully! Call ID: ${responseData.id}`);
          resolve({ success: true, callId: responseData.id });
        } else {
          reject(new Error(`Vapi API responded with status ${res.statusCode}: ${body}`));
        }
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    req.write(postData);
    req.end();
  });
};

/**
 * Triggers an outbound confirmation voice call to the customer (either Vapi AI or standard Twilio TTS)
 * @param {Object} order - The created order document containing name, phone, product, etc.
 */
const triggerCustomerVoiceCall = async (order) => {
  // 1. Wait for 5 seconds before placing the call
  // This gives the customer time to click "Send" on WhatsApp and put their phone down
  console.log('[Voice Call Agent] Delaying call for 5 seconds to let user complete WhatsApp action...');
  await new Promise(resolve => setTimeout(resolve, 5000));

  // 2. Clean and format the customer's phone number to E.164 format (+91...)
  let cleanPhone = order.phone.replace(/\D/g, '');
  if (cleanPhone.length === 10) {
    cleanPhone = `+91${cleanPhone}`;
  } else if (cleanPhone.length === 12 && cleanPhone.startsWith('91')) {
    cleanPhone = `+${cleanPhone}`;
  } else if (!cleanPhone.startsWith('+')) {
    cleanPhone = `+${cleanPhone}`;
  }

  // 3. Simplify customer name (extract first name or first word)
  const rawName = (order.name || 'Customer').trim();
  const isEnglishName = /^[a-zA-Z\s]+$/.test(rawName);
  let firstName = isEnglishName ? rawName.split(/\s+/)[0] : 'Customer';
  firstName = firstName.replace(/[^a-zA-Z\s]/g, '').trim() || 'Customer';

  // 4. Simplify product name (first 3 words max to prevent long robotic readouts)
  const rawProduct = (order.product || 'Furniture').trim();
  const isEnglishProduct = /^[a-zA-Z\s0-9]+$/.test(rawProduct);
  let shortProduct = isEnglishProduct ? rawProduct.split(/\s+/).slice(0, 3).join(' ') : 'your custom design';
  shortProduct = shortProduct.replace(/[^a-zA-Z0-9\s]/g, '').trim() || 'your custom design';

  // 5. If Vapi credentials are set, trigger a fully interactive Conversational AI call
  const vapiApiKey = process.env.VAPI_API_KEY;
  const vapiPhoneNumberId = process.env.VAPI_PHONE_NUMBER_ID;

  if (vapiApiKey && vapiPhoneNumberId) {
    try {
      const result = await triggerVapiConversationalCall(order, cleanPhone, firstName, shortProduct);
      return result;
    } catch (vapiError) {
      console.error('[Vapi AI Voice Agent Error] Failed, falling back to Twilio TTS:', vapiError.message);
    }
  }

  // 6. Otherwise, fall back to standard Twilio TTS (100% free with their Twilio trial credentials)
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_FROM_NUMBER;

  if (!accountSid || !authToken || !fromNumber) {
    console.warn('\n[Twilio Voice Call Alert] Credentials not set. Voice call skipped.\n');
    return { success: false, reason: 'Credentials not configured' };
  }

  try {
    console.log(`[Twilio Voice Call] Placing outbound call to: ${cleanPhone} for order: ${order.product}`);
    const client = twilio(accountSid, authToken);

    const safeName = escapeXml(firstName);
    const safeProduct = escapeXml(shortProduct);

    const twiml = `
      <Response>
        <Pause length="2"/>
        <Say voice="Polly.Aditi" language="en-IN">
          Namaste ${safeName} garu! 
          L D Interiors ni en-chukun-nanduku dhanyavaadalu. 
          ${safeProduct} kosam mee order successfully register ayyindi. 
          Maa L D Interiors team mimmalni twaralone sampradistharu. 
          Dhanyavaadalu!
        </Say>
        <Pause length="1"/>
      </Response>
    `.trim();

    const call = await client.calls.create({
      to: cleanPhone,
      from: fromNumber,
      twiml: twiml
    });

    console.log(`[Twilio Voice Call] Call triggered successfully! SID: ${call.sid}`);
    return { success: true, callSid: call.sid };
  } catch (error) {
    console.error('[Twilio Voice Call Error] Failed to place outbound call:', error.message);
    return { success: false, error: error.message };
  }
};

module.exports = { triggerCustomerVoiceCall };

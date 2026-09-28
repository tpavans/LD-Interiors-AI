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
  console.log('[Voice Call Agent] Automatic Twilio voice calls are disabled.');
  return { success: false, reason: 'Automatic Twilio voice calls disabled' };
};

module.exports = { triggerCustomerVoiceCall };

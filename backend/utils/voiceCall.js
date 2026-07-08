const twilio = require('twilio');

/**
 * Triggers an outbound confirmation voice call to the customer using Twilio Text-To-Speech (TwiML)
 * @param {Object} order - The created order document containing name, phone, product, etc.
 */
const triggerCustomerVoiceCall = async (order) => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_FROM_NUMBER;

  // Gracefully skip call if credentials are not configured
  if (!accountSid || !authToken || !fromNumber) {
    console.warn('\n[Twilio Voice Call Alert]');
    console.warn('TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, or TWILIO_FROM_NUMBER are not set in .env.');
    console.warn('Voice call notification to the customer has been skipped.\n');
    return { success: false, reason: 'Credentials not configured' };
  }

  try {
    // 1. Clean and format the customer's phone number to E.164 format (+91...)
    let cleanPhone = order.phone.replace(/\D/g, '');
    
    // Default to +91 country code for India if not specified
    if (cleanPhone.length === 10) {
      cleanPhone = `+91${cleanPhone}`;
    } else if (cleanPhone.length === 12 && cleanPhone.startsWith('91')) {
      cleanPhone = `+${cleanPhone}`;
    } else if (!cleanPhone.startsWith('+')) {
      cleanPhone = `+${cleanPhone}`;
    }

    console.log(`[Twilio Voice Call] Preparing outbound call to: ${cleanPhone} for order: ${order.product}`);

    const client = twilio(accountSid, authToken);

    // 2. Simplify customer name (extract first name or first word)
    const rawName = (order.name || 'Customer').trim();
    const nameParts = rawName.split(/\s+/);
    const firstName = nameParts[0];

    // 3. Simplify product name (first 3 words max to prevent long robotic readouts)
    const rawProduct = (order.product || 'Furniture').trim();
    const productParts = rawProduct.split(/\s+/);
    const shortProduct = productParts.slice(0, 3).join(' ');

    // 4. Detect if customer details contain Telugu script
    const hasTeluguScript = /[\u0c00-\u0c7f]/.test(rawName) || /[\u0c00-\u0c7f]/.test(rawProduct);

    let twiml = '';
    if (hasTeluguScript) {
      // Pure Telugu text read by Google Telugu voice
      twiml = `
        <Response>
          <Pause length="2"/>
          <Say voice="Google.te-IN-Standard-A" language="te-IN">
            నమస్కారం ${firstName} గారు! 
            ఎల్ డి ఇంటీరియర్స్ ని ఎంచుకున్నందుకు ధన్యవాదాలు. 
            మీరు ఆర్డర్ చేసిన ${shortProduct} వివరాలు విజయవంతంగా నమోదయ్యాయి. 
            మా ఎల్ డి ఇంటీరియర్స్ బృందం త్వరలోనే మిమ్మల్ని సంప్రదిస్తారు. 
            ధన్యవాదాలు!
          </Say>
          <Pause length="1"/>
        </Response>
      `.trim();
      console.log('[Twilio Voice Call] Outputting TwiML in native Telugu script (Google.te-IN-Standard-A)');
    } else {
      // Phonetic Telugu read by Polly Aditi voice
      twiml = `
        <Response>
          <Pause length="2"/>
          <Say voice="Polly.Aditi" language="en-IN">
            Namaste ${firstName} garu! 
            L D Interiors ni en-chukun-nanduku dhanyavaadalu. 
            ${shortProduct} kosam mee order successfully register ayyindi. 
            Maa L D Interiors team mimmalni twaralone sampradistharu. 
            Dhanyavaadalu!
          </Say>
          <Pause length="1"/>
        </Response>
      `.trim();
      console.log('[Twilio Voice Call] Outputting TwiML in phonetic Telugu script (Polly.Aditi)');
    }

    // 5. Initiate the Twilio call
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

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
      // If it has country code but no +, add it
      cleanPhone = `+${cleanPhone}`;
    }

    console.log(`[Twilio Voice Call] Preparing outbound call to: ${cleanPhone} for order: ${order.product}`);

    const client = twilio(accountSid, authToken);

    // 2. Generate customized bilingual TwiML (Telugu followed by English)
    const phoneticName = order.name.trim();
    const productName = order.product.trim();
    
    const twiml = `
      <Response>
        <Pause length="1"/>
        <!-- Telugu Section -->
        <Say voice="Google.te-IN-Standard-A" language="te-IN">
          నమస్కారం ${phoneticName} గారు! 
          ఎల్ డి ఇంటీరియర్స్ ని ఎంచుకున్నందుకు ధన్యవాదాలు. 
          ${productName} కోసం మీ ఆర్డర్ విజయవంతంగా నమోదైంది. 
          మా ఎల్ డి ఇంటీరియర్స్ బృందం త్వరలోనే మిమ్మల్ని సంప్రదిస్తారు. 
          ధన్యవాదాలు!
        </Say>
        <Pause length="1"/>
        <!-- English Section -->
        <Say voice="Google.en-IN-Standard-A" language="en-IN">
          Hello ${phoneticName} garu! 
          Thank you for choosing L D Interiors. 
          Your order for ${productName} has been received successfully. 
          Our L D Interiors team will contact you shortly. 
          Thank you!
        </Say>
        <Pause length="1"/>
      </Response>
    `.trim();

    // 3. Initiate the Twilio call
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

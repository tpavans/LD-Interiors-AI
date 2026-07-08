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
    // 1. Wait for 5 seconds before placing the call
    // This gives the customer time to click "Send" on WhatsApp and put their phone down
    console.log('[Twilio Voice Call] Delaying call for 5 seconds to let user complete WhatsApp action...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    // 2. Clean and format the customer's phone number to E.164 format (+91...)
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

    // 3. Simplify customer name (extract first name or first word)
    const rawName = (order.name || 'Customer').trim();
    // Verify if name is English to prevent speech synthesis error on Telugu Unicode characters
    const isEnglishName = /^[a-zA-Z\s]+$/.test(rawName);
    const firstName = isEnglishName ? rawName.split(/\s+/)[0] : 'Customer';

    // 4. Simplify product name (first 3 words max to prevent long robotic readouts)
    const rawProduct = (order.product || 'Furniture').trim();
    const isEnglishProduct = /^[a-zA-Z\s0-9]+$/.test(rawProduct);
    const shortProduct = isEnglishProduct ? rawProduct.split(/\s+/).slice(0, 3).join(' ') : 'your custom design';

    // 5. Generate customized TwiML using Polly.Aditi (natively supported on all Twilio accounts without setup)
    const twiml = `
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

    console.log(`[Twilio Voice Call] Outputting TwiML for Polly.Aditi. Name: ${firstName}, Product: ${shortProduct}`);

    // 6. Initiate the Twilio call
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

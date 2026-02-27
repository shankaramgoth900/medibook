// Netlify Functions for backend operations

// Create Payment Intent (Stripe)
export async function createPaymentIntent(event) {
  const { amount, appointmentId } = JSON.parse(event.body);
  
  try {
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: 'inr',
      metadata: { appointmentId }
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ clientSecret: paymentIntent.client_secret })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
}

// Send Email
export async function sendEmail(event) {
  const { to, type, data } = JSON.parse(event.body);
  
  try {
    const nodemailer = require('nodemailer');
    
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject: data.subject,
      html: data.message
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
}

// Send SMS
export async function sendSms(event) {
  const { phoneNumber, message } = JSON.parse(event.body);
  
  try {
    const twilio = require('twilio');
    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
}

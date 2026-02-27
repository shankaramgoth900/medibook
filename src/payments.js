import { loadStripe } from '@stripe/stripe-js';
import { httpsCallable } from 'firebase/functions';

let stripePromise;

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);
  }
  return stripePromise;
};

export const createPaymentIntent = async (amount, appointmentId) => {
  try {
    const response = await fetch('/.netlify/functions/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, appointmentId })
    });
    
    const { clientSecret } = await response.json();
    return clientSecret;
  } catch (error) {
    console.error('Payment error:', error);
    throw error;
  }
};

export const processPayment = async (stripe, elements, appointmentId, amount) => {
  try {
    const clientSecret = await createPaymentIntent(amount, appointmentId);
    
    const result = await stripe.confirmPayment({
      elements,
      clientSecret,
      confirmParams: {
        return_url: `${window.location.origin}/payment-success`,
      },
    });

    return result;
  } catch (error) {
    console.error('Payment processing error:', error);
    throw error;
  }
};

// Database schema for payments
export const paymentSchema = {
  id: 'string', // Stripe payment ID
  appointmentId: 'string',
  patientId: 'string',
  doctorId: 'string',
  amount: 'number',
  currency: 'string',
  status: 'string', // pending, completed, failed
  paymentMethod: 'string', // card, wallet
  createdAt: 'timestamp',
  updatedAt: 'timestamp'
};

import { collection, addDoc } from 'firebase/firestore';
import { db } from './firebase';

// Email notification service
export const sendEmailNotification = async (recipientEmail, type, data) => {
  try {
    const response = await fetch('/.netlify/functions/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: recipientEmail,
        type,
        data
      })
    });
    return await response.json();
  } catch (error) {
    console.error('Email error:', error);
    throw error;
  }
};

// SMS notification service
export const sendSmsNotification = async (phoneNumber, message) => {
  try {
    const response = await fetch('/.netlify/functions/send-sms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber, message })
    });
    return await response.json();
  } catch (error) {
    console.error('SMS error:', error);
    throw error;
  }
};

// Push notification service
export const sendPushNotification = async (userId, notification) => {
  try {
    await addDoc(collection(db, 'notifications'), {
      userId,
      ...notification,
      createdAt: new Date(),
      read: false
    });
  } catch (error) {
    console.error('Push notification error:', error);
    throw error;
  }
};

// Notification templates
export const notificationTemplates = {
  appointmentBooked: (doctorName, date, time) => ({
    subject: 'Appointment Booked',
    message: `Your appointment with ${doctorName} is scheduled for ${date} at ${time}`,
    type: 'appointment',
    icon: '📅'
  }),
  
  appointmentReminder: (doctorName, date, time) => ({
    subject: 'Appointment Reminder',
    message: `Reminder: You have an appointment with ${doctorName} tomorrow at ${time}`,
    type: 'reminder',
    icon: '⏰'
  }),
  
  prescriptionReady: (doctorName) => ({
    subject: 'Prescription Available',
    message: `Your prescription from Dr. ${doctorName} is ready to download`,
    type: 'prescription',
    icon: '💊'
  }),
  
  paymentConfirmed: (amount, appointmentId) => ({
    subject: 'Payment Confirmed',
    message: `Payment of ₹${amount} confirmed for appointment ${appointmentId}`,
    type: 'payment',
    icon: '✅'
  })
};

// Email templates
export const emailTemplates = {
  welcomeEmail: (name) => `
    <h1>Welcome to Medibook, ${name}!</h1>
    <p>Your healthcare journey starts here.</p>
    <p>Book appointments, manage prescriptions, and access your medical records all in one place.</p>
  `,
  
  appointmentConfirmation: (doctorName, date, time, hospital) => `
    <h2>Appointment Confirmed</h2>
    <p>Doctor: ${doctorName}</p>
    <p>Date: ${date}</p>
    <p>Time: ${time}</p>
    <p>Location: ${hospital}</p>
  `,
  
  prescriptionNotification: (doctorName, medications) => `
    <h2>Prescription from Dr. ${doctorName}</h2>
    <ul>${medications.map(m => `<li>${m}</li>`).join('')}</ul>
  `
};

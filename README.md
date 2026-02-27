# Medibook - Healthcare Management System

Complete healthcare management platform with appointments, prescriptions, payments, and notifications.

## 🚀 Features

### Core Features
- ✅ Doctor & Patient Management
- ✅ Appointment Scheduling & Tracking
- ✅ Medical Records & Prescriptions
- ✅ Analytics & Reporting
- ✅ Video Consultation Support
- ✅ Doctor Reviews & Ratings

### Phase 1: Deployment ✅
- 🔄 GitHub Actions CI/CD Pipeline
- 🚀 Vercel Auto-Deployment

### Phase 2: Authentication & Backend ✅
- 🔐 Firebase Authentication
- 📱 Email/Password Login & Signup
- 💾 Firestore Database

### Phase 3: Payments & Notifications ✅
- 💳 Stripe Payment Integration
- 📧 Email Notifications
- 📱 SMS Alerts (Twilio)
- 🔔 Push Notifications

## 📋 Quick Start

### Prerequisites
- Node.js 16+
- Firebase Account
- Stripe Account (for payments)
- Twilio Account (for SMS)
- Vercel Account (for deployment)

### Installation

```bash
git clone https://github.com/shankaramgoth900/medibook.git
cd medibook
npm install
cp .env.example .env.local
```

### Run Locally

```bash
npm run dev
npm run build
npm run preview
```

## 🔧 Architecture

- **Frontend:** React 19, Vite, Recharts
- **Backend:** Firebase, Netlify Functions
- **Payments:** Stripe API
- **Notifications:** Twilio API
- **Deployment:** Vercel + GitHub Actions

## 📚 Key Files

- `src/App.jsx` - Main healthcare dashboard
- `src/AuthContext.jsx` - Authentication state
- `src/firebase.js` - Firebase configuration
- `src/database.js` - Firestore operations
- `src/payments.js` - Payment processing
- `src/notifications.js` - Email/SMS/Push
- `.github/workflows/deploy.yml` - CI/CD pipeline

## 🚢 Deployment

1. **Vercel:** Connect your GitHub repo for auto-deployment
2. **Firebase:** Set up Firestore and Authentication
3. **Stripe:** Add payment keys to environment
4. **Twilio:** Configure SMS notifications

## 📄 License

MIT License - See LICENSE file for details

---

**Built with ❤️ for better healthcare**

Last Updated: February 27, 2026

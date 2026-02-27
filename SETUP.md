# Medibook Setup Guide

Complete setup instructions for all three phases of the Medibook healthcare platform.

## Phase 1: Deploy to Vercel + GitHub Actions CI/CD

### Step 1: Connect to Vercel
```bash
# Already prepared with vercel.json
# Just go to https://vercel.com/new and import your GitHub repo
```

### Step 2: Configure GitHub Secrets
1. Go to GitHub repo → Settings → Secrets
2. Add Vercel secrets:
   - `VERCEL_TOKEN` - From Vercel dashboard
   - `VERCEL_ORG_ID` - Your organization ID
   - `VERCEL_PROJECT_ID` - Your project ID

### Step 3: Deploy on Every Push
- GitHub Actions automatically deploys when you push to main
- Monitor at: https://github.com/shankaramgoth900/medibook/actions
- Live app will be at: your-vercel-url.vercel.app

---

## Phase 2: Firebase Authentication & Database

### Step 1: Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Create Project" → Enter "medibook"
3. Enable Google Analytics (optional)
4. Click "Create"

### Step 2: Setup Authentication
1. Left sidebar → Authentication
2. Click "Get Started"
3. Enable "Email/Password"
4. Save

### Step 3: Create Firestore Database
1. Left sidebar → Firestore Database
2. Click "Create Database"
3. Choose "Start in test mode" (or production with custom rules)
4. Choose your region
5. Click "Create"

### Step 4: Get Firebase Config
1. Project Settings (gear icon) → Project Settings
2. Copy your config and add to `.env.local`:

```bash
VITE_FIREBASE_API_KEY=xxxxxxxxxxxxxxx
VITE_FIREBASE_AUTH_DOMAIN=medibook-xxxxx.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=medibook-xxxxx
VITE_FIREBASE_STORAGE_BUCKET=medibook-xxxxx.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=xxxxxxxxxxxxx
VITE_FIREBASE_APP_ID=1:xxxxxxxxxxxxx:web:xxxxxxxxxxxxx
```

### Step 5: Setup Firestore Rules
In Firestore → Rules tab, replace with:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to access their data
    match /appointments/{document=**} {
      allow read, write: if request.auth != null;
    }
    match /prescriptions/{document=**} {
      allow read, write: if request.auth != null;
    }
    match /medicalRecords/{document=**} {
      allow read, write: if request.auth != null;
    }
    match /notifications/{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### Step 6: Test Locally
```bash
npm run dev
# Go to http://localhost:5174
# Click "Sign Up" and create an account
# App uses real Firebase backend now
```

### Step 7: Deploy to Vercel
```bash
# Add Firebase env vars to Vercel dashboard
# Settings → Environment Variables
git push origin main
# Vercel automatically deploys
```

---

## Phase 3: Payments + Notifications

### 3A: Stripe Payment Integration

#### Step 1: Create Stripe Account
1. Go to [Stripe.com](https://stripe.com)
2. Sign up for a test account
3. Go to Developers → API Keys
4. Copy your keys:
   - Publishable Key (pk_test_...)
   - Secret Key (sk_test_...)

#### Step 2: Add Stripe Keys
```bash
# Add to .env.local
VITE_STRIPE_PUBLIC_KEY=pk_test_xxxxxxxx
```

#### Step 3: Setup Netlify Functions Backend

1. Go to [Netlify](https://netlify.com)
2. Import your GitHub repository
3. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Functions directory: `netlify/functions`

4. Add environment variables in Netlify:
   - Settings → Build & Deploy → Environment
```
STRIPE_SECRET_KEY=sk_test_xxxxxxxx
```

#### Step 4: Deploy Functions
```bash
npm install netlify-cli -g
netlify deploy
# Functions automatically deploy to /.netlify/functions/
```

### 3B: Email Notifications (Gmail)

#### Step 1: Setup Gmail
1. Go to [Gmail](https://gmail.com)
2. Enable 2-Factor Authentication
3. Create App Password: https://myaccount.google.com/apppasswords
4. Copy the 16-character password

#### Step 2: Add Email Keys
```bash
# Add to Netlify environment:
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=xxxxxxxx xxxxxxxx
```

### 3C: SMS Notifications (Twilio)

#### Step 1: Create Twilio Account
1. Go to [Twilio.com](https://twilio.com)
2. Sign up for free trial
3. Get Account SID and Auth Token from dashboard
4. Verify your phone number for sending SMS

#### Step 2: Get Twilio Phone Number
1. Console → Phone Numbers → Manage Numbers
2. Buy a new number (US/India/etc)
3. Copy the phone number

#### Step 3: Add Twilio Keys
```bash
# Add to Netlify environment:
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+1234567890
```

#### Step 4: Test SMS
```javascript
import { sendSmsNotification } from './src/notifications';

// Send test SMS
sendSmsNotification('+919876543210', 'Appointment confirmed');
```

### 3D: Push Notifications
Already integrated! Uses Firestore to store notifications.

```javascript
import { sendPushNotification } from './src/notifications';

// Send push notification
await sendPushNotification('user-id', {
  title: 'Appointment Reminder',
  message: 'You have an appointment tomorrow',
  type: 'reminder'
});
```

---

## Testing Payments Locally

### Stripe Test Cards
In test mode, use these card numbers:

| Card | Number | CVC | Date |
|------|--------|-----|------|
| Visa | 4242 4242 4242 4242 | Any | Any future |
| Visa (decline) | 4000 0000 0000 0002 | Any | Any future |

---

## Environment Variables Checklist

### `.env.local` (Frontend)
- [ ] VITE_FIREBASE_API_KEY
- [ ] VITE_FIREBASE_AUTH_DOMAIN
- [ ] VITE_FIREBASE_PROJECT_ID
- [ ] VITE_FIREBASE_STORAGE_BUCKET
- [ ] VITE_FIREBASE_MESSAGING_SENDER_ID
- [ ] VITE_FIREBASE_APP_ID
- [ ] VITE_STRIPE_PUBLIC_KEY (Phase 3)

### Vercel Dashboard (Deployment)
- [ ] All VITE_* variables above

### Netlify Dashboard (Functions)
- [ ] STRIPE_SECRET_KEY
- [ ] EMAIL_USER
- [ ] EMAIL_PASSWORD
- [ ] TWILIO_ACCOUNT_SID
- [ ] TWILIO_AUTH_TOKEN
- [ ] TWILIO_PHONE_NUMBER

---

## Database Schema

### Appointments Collection
```javascript
{
  id: "ap1",
  patientId: "p1",
  doctorId: "d1",
  patientName: "John Doe",
  doctorName: "Dr. Jane Smith",
  specialty: "Cardiology",
  hospital: "City Hospital",
  date: "2026-03-10",
  time: "10:00",
  status: "confirmed", // pending, confirmed, completed, cancelled
  reason: "Check-up",
  type: "In-Person", // In-Person, Video
  fee: 800,
  prescription: null,
  notes: ""
}
```

### Prescriptions Collection
```javascript
{
  id: "rx1",
  appointmentId: "ap1",
  patientId: "p1",
  doctorId: "d1",
  medications: [
    {
      name: "Aspirin",
      dosage: "500mg",
      frequency: "Twice daily",
      duration: "7 days"
    }
  ],
  createdAt: timestamp,
  expiresAt: timestamp
}
```

### Notifications Collection
```javascript
{
  id: "n1",
  userId: "p1",
  type: "reminder", // appointment, payment, prescription
  title: "Appointment Reminder",
  message: "You have an appointment tomorrow",
  createdAt: timestamp,
  read: false
}
```

### Payments Collection
```javascript
{
  id: "str_123456",
  appointmentId: "ap1",
  patientId: "p1",
  doctorId: "d1",
  amount: 800,
  currency: "INR",
  status: "completed", // pending, completed, failed
  paymentMethod: "card",
  createdAt: timestamp
}
```

---

## Troubleshooting

### Firebase Connection Issues
```
Error: "Missing or insufficient permissions"
→ Check Firestore Rules in Firebase Console
→ Make sure you're logged in (useAuth().user is not null)
```

### Stripe Payment Errors
```
Error: "Invalid API key"
→ Verify STRIPE_SECRET_KEY in Netlify dashboard
→ Check payment intent creation in Netlify logs
```

### Email Not Sending
```
Error: "Invalid credentials"
→ Verify EMAIL_USER and EMAIL_PASSWORD in Netlify
→ Check Gmail security settings
→ Use App Password, not regular password
```

### Functions Not Deploying
```
→ Check that .github/workflows/deploy.yml is correct
→ Verify netlify.toml exists
→ Check function logs in Netlify dashboard
```

---

## Next Steps

1. ✅ **Phase 1:** Deploy to Vercel with CI/CD
2. ✅ **Phase 2:** Setup Firebase and test login
3. ✅ **Phase 3:** Add payments, emails, and SMS

### Phase 4 Ideas (Future)
- [ ] Mobile app with React Native
- [ ] Advanced search & filters
- [ ] Add appointment waiting queue
- [ ] Patient-doctor messaging
- [ ] Video call integration (Agora/Twilio)
- [ ] Insurance integration
- [ ] Appointment analytics
- [ ] Doctor availability calendar

---

## Support

- 📧 Email: support@medibook.com
- 🐛 Report bugs: GitHub Issues
- 💬 Discussions: GitHub Discussions
- 📖 Docs: Full docs in README.md

---

**Everything is ready to go!** 🚀

Just follow the steps above and your healthcare platform will be live with full features!

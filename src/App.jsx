import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

// ═══════════════════════════════════════════════════════════════════
// MOCK DATA LAYER (Simulated Backend)
// ═══════════════════════════════════════════════════════════════════

const fakeJWT = {
  sign: (payload) => `eyJ.${btoa(JSON.stringify(payload))}.sig`,
  verify: (token) => { try { return JSON.parse(atob(token.split(".")[1])); } catch { return null; } }
};

const SPECIALTIES = ["Cardiologist","Neurologist","Pediatrician","Orthopedic","Dermatologist","Psychiatrist","Oncologist","Gynecologist","Ophthalmologist","ENT Specialist"];
const HOSPITALS = ["AIIMS Delhi","Apollo Mumbai","Fortis Bangalore","Max Hospital Pune","Manipal Hyderabad","Medanta Gurugram","Ruby Hall Pune","Narayana Kolkata"];
const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const DOCTORS_DB = [
  { id:"d1", role:"doctor", name:"Dr. Priya Sharma", email:"priya@hospital.com", password:"doc123", specialty:"Cardiologist", hospital:"AIIMS Delhi", experience:14, rating:4.9, reviews:312, fee:800, avatar:"PS", qualification:"MBBS, MD (Cardiology), DM", languages:["Hindi","English"], about:"Pioneering cardiologist with expertise in interventional procedures and heart failure management.", availability:["Mon","Tue","Wed","Thu","Fri"], slots:["09:00","09:30","10:00","10:30","11:00","11:30","14:00","14:30","15:00","15:30","16:00"], consultType:["In-Person","Video"] },
  { id:"d2", role:"doctor", name:"Dr. Arjun Mehta", email:"arjun@hospital.com", password:"doc123", specialty:"Neurologist", hospital:"Apollo Mumbai", experience:11, rating:4.8, reviews:245, fee:900, avatar:"AM", qualification:"MBBS, MD, DM (Neurology)", languages:["Hindi","English","Marathi"], about:"Leading neurologist specializing in stroke management, epilepsy, and movement disorders.", availability:["Mon","Wed","Thu","Fri","Sat"], slots:["08:30","09:00","10:00","10:30","13:00","13:30","14:00","16:30","17:00"], consultType:["In-Person","Video","Emergency"] },
  { id:"d3", role:"doctor", name:"Dr. Sunita Rao", email:"sunita@hospital.com", password:"doc123", specialty:"Pediatrician", hospital:"Fortis Bangalore", experience:9, rating:4.9, reviews:410, fee:600, avatar:"SR", qualification:"MBBS, DCH, MD (Pediatrics)", languages:["Hindi","English","Kannada","Tamil"], about:"Child health specialist known for gentle approach and expertise in neonatal care.", availability:["Mon","Tue","Wed","Fri","Sat"], slots:["09:00","09:30","10:30","11:00","11:30","14:00","15:00","15:30","16:30"], consultType:["In-Person","Video"] },
  { id:"d4", role:"doctor", name:"Dr. Vikram Nair", email:"vikram@hospital.com", password:"doc123", specialty:"Orthopedic", hospital:"Max Hospital Pune", experience:16, rating:4.7, reviews:189, fee:1000, avatar:"VN", qualification:"MBBS, MS (Ortho), Fellowship (Joint Replacement)", languages:["Hindi","English","Malayalam"], about:"Joint replacement surgeon with over 3000 successful surgeries and minimal-invasive techniques.", availability:["Tue","Wed","Thu","Fri"], slots:["08:00","09:00","10:00","11:30","13:00","14:00","15:00","16:00"], consultType:["In-Person","Emergency"] },
  { id:"d5", role:"doctor", name:"Dr. Meera Krishnan", email:"meera@hospital.com", password:"doc123", specialty:"Dermatologist", hospital:"Manipal Hyderabad", experience:8, rating:4.8, reviews:356, fee:700, avatar:"MK", qualification:"MBBS, MD (Dermatology)", languages:["Hindi","English","Telugu"], about:"Expert in cosmetic dermatology, skin cancer detection, and advanced laser treatments.", availability:["Mon","Tue","Thu","Fri","Sat"], slots:["10:00","10:30","11:00","14:00","14:30","15:30","16:00","17:00"], consultType:["In-Person","Video"] },
  { id:"d6", role:"doctor", name:"Dr. Rahul Bose", email:"rahul@hospital.com", password:"doc123", specialty:"Psychiatrist", hospital:"Medanta Gurugram", experience:12, rating:4.9, reviews:178, fee:1200, avatar:"RB", qualification:"MBBS, MD (Psychiatry)", languages:["Hindi","English","Bengali"], about:"Compassionate mental health expert specializing in anxiety, depression, and addiction.", availability:["Mon","Wed","Thu","Sat"], slots:["09:00","10:00","11:00","14:00","15:00","16:00","17:00"], consultType:["In-Person","Video"] },
];

const PATIENTS_DB = [
  { id:"p1", role:"patient", name:"Rohan Kapoor", email:"rohan@email.com", password:"pass123", phone:"+91 98765 43210", dob:"1990-05-15", blood:"A+", weight:72, height:175, allergies:["Penicillin"], conditions:["Hypertension"], insurance:"Star Health Gold", avatar:"RK" },
  { id:"p2", role:"patient", name:"Sneha Iyer", email:"sneha@email.com", password:"pass123", phone:"+91 87654 32109", dob:"1995-08-22", blood:"B+", weight:58, height:162, allergies:[], conditions:[], insurance:"HDFC ERGO", avatar:"SI" },
  { id:"p3", role:"patient", name:"Amit Sharma", email:"amit@email.com", password:"pass123", phone:"+91 76543 21098", dob:"1985-03-10", blood:"O+", weight:80, height:178, allergies:["Sulfa drugs"], conditions:["Diabetes Type 2"], insurance:"Max Bupa", avatar:"AS" },
];

const ADMIN_DB = [{ id:"a1", role:"admin", name:"Admin Raj", email:"admin@medibook.com", password:"admin123", avatar:"AR" }];

const ALL_USERS = [...DOCTORS_DB, ...PATIENTS_DB, ...ADMIN_DB];

const INITIAL_APPOINTMENTS = [
  { id:"ap1", patientId:"p1", doctorId:"d1", patientName:"Rohan Kapoor", doctorName:"Dr. Priya Sharma", specialty:"Cardiologist", hospital:"AIIMS Delhi", date:"2026-03-05", time:"10:00", status:"confirmed", reason:"Chest pain and palpitation follow-up", type:"In-Person", fee:800, prescription:null, notes:"" },
  { id:"ap2", patientId:"p1", doctorId:"d3", patientName:"Rohan Kapoor", doctorName:"Dr. Sunita Rao", specialty:"Pediatrician", hospital:"Fortis Bangalore", date:"2026-03-15", time:"14:00", status:"pending", reason:"Child's annual checkup", type:"Video", fee:600, prescription:null, notes:"" },
  { id:"ap3", patientId:"p2", doctorId:"d2", patientName:"Sneha Iyer", doctorName:"Dr. Arjun Mehta", specialty:"Neurologist", hospital:"Apollo Mumbai", date:"2026-03-07", time:"13:00", status:"confirmed", reason:"Recurring migraine consultation", type:"In-Person", fee:900, prescription:null, notes:"" },
  { id:"ap4", patientId:"p1", doctorId:"d5", patientName:"Rohan Kapoor", doctorName:"Dr. Meera Krishnan", specialty:"Dermatologist", hospital:"Manipal Hyderabad", date:"2026-02-20", time:"11:00", status:"completed", reason:"Skin allergy treatment", type:"In-Person", fee:700, prescription:"Tab. Cetirizine 10mg once daily x 7 days. Calamine lotion BD.", notes:"Follow up after 2 weeks if not resolved." },
  { id:"ap5", patientId:"p2", doctorId:"d6", patientName:"Sneha Iyer", doctorName:"Dr. Rahul Bose", specialty:"Psychiatrist", hospital:"Medanta Gurugram", date:"2026-02-15", time:"14:00", status:"completed", reason:"Anxiety management", type:"Video", fee:1200, prescription:"Tab. Escitalopram 10mg OD. Clonazepam 0.5mg SOS.", notes:"CBT sessions recommended." },
  { id:"ap6", patientId:"p3", doctorId:"d1", patientName:"Amit Sharma", doctorName:"Dr. Priya Sharma", specialty:"Cardiologist", hospital:"AIIMS Delhi", date:"2026-03-10", time:"15:30", status:"confirmed", reason:"ECG review and blood pressure management", type:"In-Person", fee:800, prescription:null, notes:"" },
  { id:"ap7", patientId:"p1", doctorId:"d4", patientName:"Rohan Kapoor", doctorName:"Dr. Vikram Nair", specialty:"Orthopedic", hospital:"Max Hospital Pune", date:"2026-02-10", time:"09:00", status:"cancelled", reason:"Knee pain evaluation", type:"In-Person", fee:1000, prescription:null, notes:"" },
];

const INITIAL_NOTIFICATIONS = [
  { id:"n1", userId:"p1", type:"reminder", title:"Appointment Tomorrow", message:"You have an appointment with Dr. Priya Sharma tomorrow at 10:00 AM at AIIMS Delhi.", time:"2026-03-04T09:00:00", read:false, icon:"⏰" },
  { id:"n2", userId:"p1", type:"confirmed", title:"Appointment Confirmed", message:"Dr. Priya Sharma has confirmed your appointment for March 5, 2026.", time:"2026-03-01T14:00:00", read:false, icon:"✅" },
  { id:"n3", userId:"p2", type:"reminder", title:"Video Consultation Reminder", message:"Your video call with Dr. Arjun Mehta is scheduled for March 7 at 1:00 PM.", time:"2026-03-06T09:00:00", read:true, icon:"🎥" },
];

const REVIEWS_DB = [
  { id:"r1", doctorId:"d1", patientName:"Priya M.", rating:5, text:"Exceptional doctor. Explained everything clearly and genuinely cared about my health.", date:"2026-02-01" },
  { id:"r2", doctorId:"d1", patientName:"Suresh K.", rating:5, text:"Life-saving experience. Found a critical issue others missed. Highly recommend!", date:"2026-01-20" },
  { id:"r3", doctorId:"d2", patientName:"Anjali R.", rating:5, text:"Very thorough and patient. Took time to understand my full history.", date:"2026-02-10" },
];

// ═══════════════════════════════════════════════════════════════════
// UTILITIES
// ═══════════════════════════════════════════════════════════════════

const gid = () => Math.random().toString(36).substr(2,9);
const today = () => new Date().toISOString().split("T")[0];
const fmtDate = (d) => new Date(d).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" });
const fmtTime = (t) => { const [h,m]=t.split(":"); const hr=+h; return `${hr>12?hr-12:hr||12}:${m} ${hr>=12?"PM":"AM"}`; };
const isUpcoming = (d) => new Date(d) >= new Date(today());
const daysUntil = (d) => Math.ceil((new Date(d)-new Date(today()))/(1000*60*60*24));
const calcAge = (dob) => Math.floor((new Date()-new Date(dob))/(365.25*24*60*60*1000));
const initials = (name) => name.split(" ").map(n=>n[0]).join("").slice(0,2).toUpperCase();

// Analytics generators
const getWeeklyData = (appts) => {
  const days = [];
  for(let i=6;i>=0;i--) {
    const d = new Date(); d.setDate(d.getDate()-i);
    const ds = d.toISOString().split("T")[0];
    days.push({ day: DAYS[d.getDay()], appointments: appts.filter(a=>a.date===ds).length, revenue: appts.filter(a=>a.date===ds&&a.status==="completed").reduce((s,a)=>s+a.fee,0) });
  }
  return days;
};

const getMonthlyData = (appts) => MONTHS.slice(0,6).map((m,i) => ({ month:m, appointments: Math.floor(Math.random()*40)+10, patients: Math.floor(Math.random()*30)+8 }));

const getSpecialtyData = (appts) => {
  const counts = {};
  appts.forEach(a => { counts[a.specialty] = (counts[a.specialty]||0)+1; });
  return Object.entries(counts).map(([name,value])=>({name,value}));
};

const PIE_COLORS = ["#0f4c75","#1b6ca8","#00b4d8","#48cae4","#90e0ef","#ade8f4","#caf0f8"];
const STATUS_CONFIG = {
  confirmed:  { bg:"#d1fae5", color:"#059669", icon:"✓", label:"Confirmed" },
  pending:    { bg:"#fef3c7", color:"#d97706", icon:"⏳", label:"Pending" },
  cancelled:  { bg:"#fee2e2", color:"#dc2626", icon:"✗", label:"Cancelled" },
  completed:  { bg:"#e0e7ff", color:"#4f46e5", icon:"★", label:"Completed" },
};

// ═══════════════════════════════════════════════════════════════════
// GLOBAL CSS
// ═══════════════════════════════════════════════════════════════════

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Outfit:wght@300;400;500;600;700&display=swap');

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}

:root{
  --navy:#0a2540;
  --navy2:#0f3460;
  --blue:#1a6faf;
  --cyan:#00b4d8;
  --cyan2:#48cae4;
  --teal:#0096c7;
  --bg:#f0f5fa;
  --bg2:#e8f0f8;
  --surface:#ffffff;
  --surface2:#f7fafd;
  --border:#d8e5f0;
  --border2:#c5d8ec;
  --text:#0a1628;
  --text2:#2d4a6e;
  --text3:#5b7a99;
  --text4:#8fa8c2;
  --success:#10b981;
  --warning:#f59e0b;
  --danger:#ef4444;
  --purple:#7c3aed;
  --r:16px;
  --r2:12px;
  --r3:8px;
  --sh:0 2px 16px rgba(10,37,64,0.07);
  --sh2:0 8px 40px rgba(10,37,64,0.13);
  --sh3:0 24px 80px rgba(10,37,64,0.2);
  --sidebar:264px;
}

body{font-family:'Outfit',sans-serif;background:var(--bg);color:var(--text);min-height:100vh;overflow-x:hidden}
::-webkit-scrollbar{width:6px;height:6px}
::-webkit-scrollbar-track{background:var(--bg)}
::-webkit-scrollbar-thumb{background:var(--border2);border-radius:3px}
::-webkit-scrollbar-thumb:hover{background:var(--text4)}

/* ── ANIMATIONS ── */
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes slideUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
@keyframes slideIn{from{opacity:0;transform:translateX(-20px)}to{opacity:1;transform:translateX(0)}}
@keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.05)}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes toastIn{from{opacity:0;transform:translateY(20px) scale(0.95)}to{opacity:1;transform:translateY(0) scale(1)}}
@keyframes toastOut{from{opacity:1;transform:translateY(0)}to{opacity:0;transform:translateY(8px)}}
@keyframes badgePop{0%{transform:scale(0)}60%{transform:scale(1.2)}100%{transform:scale(1)}}
@keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
@keyframes gradientShift{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}

.animate-fadeIn{animation:fadeIn 0.3s ease}
.animate-slideUp{animation:slideUp 0.35s cubic-bezier(0.22,1,0.36,1)}
.animate-slideIn{animation:slideIn 0.3s ease}

/* ── AUTH ── */
.auth-root{min-height:100vh;display:grid;grid-template-columns:1.1fr 0.9fr;background:var(--navy)}
.auth-left{
  background:linear-gradient(135deg,#061c34 0%,#0a2540 30%,#0f3460 65%,#1a5c99 100%);
  background-size:200% 200%;
  animation:gradientShift 8s ease infinite;
  padding:56px;display:flex;flex-direction:column;justify-content:center;
  position:relative;overflow:hidden;
}
.auth-left::before{content:'';position:absolute;top:-100px;right:-100px;width:500px;height:500px;background:radial-gradient(circle,rgba(0,180,216,0.12),transparent 70%);pointer-events:none}
.auth-left::after{content:'';position:absolute;bottom:-80px;left:-80px;width:400px;height:400px;background:radial-gradient(circle,rgba(26,111,175,0.15),transparent 70%);pointer-events:none}
.auth-orb{position:absolute;border-radius:50%;pointer-events:none;animation:float 6s ease-in-out infinite}
.auth-orb1{width:80px;height:80px;background:rgba(0,180,216,0.08);top:15%;right:15%;border:1px solid rgba(0,180,216,0.15);animation-delay:0s}
.auth-orb2{width:50px;height:50px;background:rgba(26,111,175,0.1);top:60%;right:25%;border:1px solid rgba(26,111,175,0.15);animation-delay:2s}
.auth-orb3{width:120px;height:120px;background:rgba(72,202,228,0.05);bottom:20%;right:5%;border:1px solid rgba(72,202,228,0.1);animation-delay:4s}

.auth-brand{display:flex;align-items:center;gap:12px;margin-bottom:56px}
.auth-brand-icon{
  width:48px;height:48px;background:linear-gradient(135deg,var(--cyan),var(--teal));
  border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:22px;
  box-shadow:0 8px 24px rgba(0,180,216,0.35);
}
.auth-brand-name{font-family:'Playfair Display',serif;font-size:26px;color:white;letter-spacing:-0.5px}
.auth-brand-sub{font-size:10px;color:rgba(255,255,255,0.4);letter-spacing:2px;text-transform:uppercase}

.auth-tagline{
  font-size:11px;font-weight:600;letter-spacing:2px;text-transform:uppercase;
  color:var(--cyan2);margin-bottom:20px;display:flex;align-items:center;gap:8px;
}
.auth-tagline::before{content:'';width:24px;height:2px;background:var(--cyan);border-radius:1px}
.auth-headline{font-family:'Playfair Display',serif;font-size:48px;line-height:1.1;color:white;margin-bottom:20px;letter-spacing:-1px}
.auth-headline em{color:var(--cyan2);font-style:italic}
.auth-desc{color:rgba(255,255,255,0.55);font-size:15px;line-height:1.8;max-width:400px;margin-bottom:48px;font-weight:300}
.auth-feature{display:flex;align-items:flex-start;gap:12px;margin-bottom:16px}
.auth-feature-icon{width:32px;height:32px;border-radius:8px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0;margin-top:1px}
.auth-feature-text{font-size:13px;color:rgba(255,255,255,0.65);line-height:1.5}
.auth-feature-text strong{color:rgba(255,255,255,0.9);font-weight:600}

.auth-stats{display:flex;gap:36px;margin-top:40px;padding-top:36px;border-top:1px solid rgba(255,255,255,0.08)}
.auth-stat-num{font-family:'Playfair Display',serif;font-size:30px;color:var(--cyan2)}
.auth-stat-label{font-size:11px;color:rgba(255,255,255,0.4);text-transform:uppercase;letter-spacing:1px;margin-top:2px}

.auth-right{background:white;display:flex;align-items:center;justify-content:center;padding:56px 48px}
.auth-form-wrap{width:100%;max-width:420px}
.auth-form-title{font-family:'Playfair Display',serif;font-size:32px;color:var(--text);margin-bottom:6px}
.auth-form-sub{color:var(--text3);font-size:14px;margin-bottom:32px;font-weight:400}

.role-selector{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:28px}
.role-btn{
  padding:12px 8px;border:2px solid var(--border);border-radius:var(--r2);background:var(--surface2);
  font-family:'Outfit',sans-serif;font-size:12px;font-weight:600;color:var(--text3);cursor:pointer;
  transition:all 0.2s;display:flex;flex-direction:column;align-items:center;gap:6px;
}
.role-btn .role-icon{font-size:20px}
.role-btn:hover{border-color:var(--cyan);color:var(--teal)}
.role-btn.active{border-color:var(--navy2);background:var(--navy2);color:white}

.field{margin-bottom:18px}
.field-label{display:block;font-size:12px;font-weight:700;color:var(--text2);margin-bottom:7px;letter-spacing:0.3px;text-transform:uppercase}
.field-input{
  width:100%;padding:12px 16px;border:2px solid var(--border);border-radius:var(--r2);
  font-family:'Outfit',sans-serif;font-size:14px;color:var(--text);background:var(--surface2);
  transition:all 0.2s;outline:none;
}
.field-input:focus{border-color:var(--cyan);background:white;box-shadow:0 0 0 4px rgba(0,180,216,0.08)}
.field-input::placeholder{color:var(--text4)}
select.field-input{cursor:pointer}
textarea.field-input{resize:vertical;min-height:90px}

.btn{
  display:inline-flex;align-items:center;justify-content:center;gap:8px;
  padding:12px 22px;border-radius:var(--r2);font-family:'Outfit',sans-serif;
  font-size:14px;font-weight:600;cursor:pointer;transition:all 0.2s;border:none;
  white-space:nowrap;position:relative;overflow:hidden;
}
.btn::after{content:'';position:absolute;inset:0;background:rgba(255,255,255,0);transition:background 0.2s}
.btn:hover::after{background:rgba(255,255,255,0.08)}
.btn:active{transform:scale(0.98)}
.btn-primary{background:linear-gradient(135deg,var(--navy2),var(--blue));color:white;width:100%;padding:14px;font-size:15px}
.btn-primary:hover{box-shadow:0 8px 24px rgba(15,52,96,0.35);transform:translateY(-1px)}
.btn-ghost{background:transparent;border:2px solid var(--border);color:var(--text2)}
.btn-ghost:hover{border-color:var(--cyan);color:var(--teal);background:rgba(0,180,216,0.04)}
.btn-danger{background:#fee2e2;color:var(--danger)}
.btn-danger:hover{background:var(--danger);color:white}
.btn-success{background:#d1fae5;color:var(--success)}
.btn-success:hover{background:var(--success);color:white}
.btn-cyan{background:linear-gradient(135deg,var(--cyan),var(--teal));color:white}
.btn-cyan:hover{box-shadow:0 6px 20px rgba(0,180,216,0.4);transform:translateY(-1px)}
.btn-warning{background:#fef3c7;color:var(--warning)}
.btn-warning:hover{background:var(--warning);color:white}
.btn-purple{background:#ede9fe;color:var(--purple)}
.btn-purple:hover{background:var(--purple);color:white}
.btn-sm{padding:7px 14px;font-size:12px;border-radius:var(--r3)}
.btn-xs{padding:5px 10px;font-size:11px;border-radius:6px}
.btn-icon{width:36px;height:36px;padding:0;border-radius:var(--r3)}
.btn-full{width:100%}

.err-alert{background:#fee2e2;color:#b91c1c;padding:11px 15px;border-radius:var(--r3);font-size:13px;margin-bottom:16px;border-left:3px solid var(--danger)}
.demo-box{margin-top:20px;padding:14px;background:var(--bg2);border-radius:var(--r2);border:1px solid var(--border)}
.demo-box-title{font-size:11px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:1px;margin-bottom:8px}
.demo-row{display:flex;justify-content:space-between;align-items:center;padding:5px 0;border-bottom:1px solid var(--border);font-size:12px}
.demo-row:last-child{border-bottom:none}
.demo-badge{font-size:10px;padding:2px 8px;border-radius:100px;font-weight:700;background:var(--navy2);color:white}

/* ── LAYOUT ── */
.app-shell{display:flex;min-height:100vh}

.sidebar{
  width:var(--sidebar);background:linear-gradient(180deg,var(--navy) 0%,var(--navy2) 100%);
  display:flex;flex-direction:column;position:fixed;top:0;left:0;height:100vh;
  z-index:200;box-shadow:4px 0 32px rgba(10,37,64,0.2);
}
.sb-logo{padding:24px 20px 20px;border-bottom:1px solid rgba(255,255,255,0.07);display:flex;align-items:center;gap:12px}
.sb-logo-icon{width:38px;height:38px;background:linear-gradient(135deg,var(--cyan),var(--teal));border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0;box-shadow:0 4px 12px rgba(0,180,216,0.3)}
.sb-logo-name{font-family:'Playfair Display',serif;font-size:20px;color:white}
.sb-logo-tag{font-size:9px;color:rgba(255,255,255,0.35);letter-spacing:2px;text-transform:uppercase}

.sb-nav{flex:1;padding:12px 0;overflow-y:auto}
.sb-section-label{font-size:9px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,0.3);padding:12px 20px 6px;margin-top:4px}
.sb-item{
  display:flex;align-items:center;gap:12px;padding:11px 20px;color:rgba(255,255,255,0.55);
  font-size:13.5px;font-weight:500;cursor:pointer;transition:all 0.18s;
  border-left:3px solid transparent;position:relative;
}
.sb-item:hover{color:rgba(255,255,255,0.9);background:rgba(255,255,255,0.05)}
.sb-item.active{color:white;background:rgba(0,180,216,0.12);border-left-color:var(--cyan)}
.sb-item-icon{width:20px;text-align:center;font-size:15px;flex-shrink:0}
.sb-item-badge{
  margin-left:auto;min-width:18px;height:18px;background:var(--danger);border-radius:9px;
  font-size:10px;font-weight:700;color:white;display:flex;align-items:center;justify-content:center;padding:0 5px;
  animation:badgePop 0.3s cubic-bezier(0.34,1.56,0.64,1);
}

.sb-footer{padding:16px 20px;border-top:1px solid rgba(255,255,255,0.07)}
.sb-user{display:flex;align-items:center;gap:11px;margin-bottom:12px}
.sb-user-ava{
  width:38px;height:38px;border-radius:50%;background:linear-gradient(135deg,var(--cyan),var(--teal));
  display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;color:white;flex-shrink:0;
}
.sb-user-name{font-size:13px;font-weight:600;color:white;line-height:1.2}
.sb-user-role{font-size:11px;color:rgba(255,255,255,0.4)}
.sb-logout{width:100%;display:flex;align-items:center;gap:8px;padding:9px 12px;border-radius:var(--r3);background:rgba(255,255,255,0.06);border:none;color:rgba(255,255,255,0.5);font-family:'Outfit',sans-serif;font-size:12px;font-weight:600;cursor:pointer;transition:all 0.2s}
.sb-logout:hover{background:rgba(239,68,68,0.15);color:#f87171}

/* ── TOP BAR ── */
.topbar{
  position:fixed;top:0;left:var(--sidebar);right:0;height:60px;background:rgba(255,255,255,0.92);
  backdrop-filter:blur(12px);border-bottom:1px solid var(--border);z-index:100;
  display:flex;align-items:center;padding:0 28px;gap:16px;
}
.topbar-search-wrap{flex:1;max-width:400px;position:relative}
.topbar-search{width:100%;padding:9px 14px 9px 38px;border:1.5px solid var(--border);border-radius:var(--r2);font-family:'Outfit',sans-serif;font-size:13px;background:var(--bg);outline:none;transition:all 0.2s;color:var(--text)}
.topbar-search:focus{border-color:var(--cyan);background:white;box-shadow:0 0 0 3px rgba(0,180,216,0.08)}
.topbar-search-icon{position:absolute;left:12px;top:50%;transform:translateY(-50%);color:var(--text4);font-size:14px}
.topbar-right{display:flex;align-items:center;gap:12px;margin-left:auto}
.topbar-notif{position:relative;cursor:pointer}
.topbar-notif-icon{width:38px;height:38px;border-radius:var(--r2);border:1.5px solid var(--border);display:flex;align-items:center;justify-content:center;font-size:16px;transition:all 0.2s;background:var(--surface)}
.topbar-notif-icon:hover{border-color:var(--cyan);background:rgba(0,180,216,0.05)}
.topbar-notif-dot{position:absolute;top:6px;right:6px;width:8px;height:8px;background:var(--danger);border-radius:50%;border:2px solid white}
.topbar-ava{width:38px;height:38px;border-radius:50%;background:linear-gradient(135deg,var(--cyan),var(--teal));display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;color:white;cursor:pointer;box-shadow:0 2px 8px rgba(0,180,216,0.25)}
.topbar-date{font-size:12px;color:var(--text3);font-weight:500}

/* ── MAIN CONTENT ── */
.main{margin-left:var(--sidebar);margin-top:60px;padding:28px;min-height:calc(100vh - 60px);background:var(--bg)}

.page-hd{margin-bottom:28px}
.page-hd-top{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin-bottom:4px}
.page-title{font-family:'Playfair Display',serif;font-size:26px;color:var(--text);letter-spacing:-0.5px}
.page-sub{font-size:13px;color:var(--text3);margin-top:3px;font-weight:400}
.breadcrumb{font-size:11px;color:var(--text4);margin-bottom:6px;display:flex;align-items:center;gap:4px}
.breadcrumb-sep{color:var(--border2)}

/* ── STAT CARDS ── */
.stats-row{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:24px}
.stat-card{
  background:white;border-radius:var(--r);padding:20px;box-shadow:var(--sh);border:1px solid var(--border);
  display:flex;align-items:flex-start;justify-content:space-between;transition:all 0.2s;cursor:default;
  animation:slideUp 0.35s ease both;
}
.stat-card:nth-child(1){animation-delay:0.05s}.stat-card:nth-child(2){animation-delay:0.1s}
.stat-card:nth-child(3){animation-delay:0.15s}.stat-card:nth-child(4){animation-delay:0.2s}
.stat-card:hover{transform:translateY(-3px);box-shadow:var(--sh2)}
.stat-label{font-size:11px;font-weight:700;color:var(--text4);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px}
.stat-value{font-family:'Playfair Display',serif;font-size:34px;color:var(--text);line-height:1}
.stat-trend{display:flex;align-items:center;gap:4px;margin-top:5px;font-size:11px;font-weight:600}
.stat-trend.up{color:var(--success)}.stat-trend.down{color:var(--danger)}.stat-trend.neutral{color:var(--text4)}
.stat-icon{width:48px;height:48px;border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0}

/* ── CARDS ── */
.card{background:white;border-radius:var(--r);box-shadow:var(--sh);border:1px solid var(--border)}
.card-pad{padding:22px}
.card-header{display:flex;align-items:center;justify-content:space-between;padding:18px 22px;border-bottom:1px solid var(--border)}
.card-title{font-family:'Playfair Display',serif;font-size:17px;color:var(--text)}
.card-sub{font-size:12px;color:var(--text3);margin-top:2px}
.card-actions{display:flex;align-items:center;gap:8px}

/* ── APPOINTMENT CARDS ── */
.appt-list{display:grid;gap:12px}
.appt-card{
  background:white;border-radius:var(--r2);padding:18px;box-shadow:var(--sh);border:1px solid var(--border);
  display:flex;align-items:center;gap:16px;transition:all 0.2s;
  animation:slideUp 0.3s ease both;
}
.appt-card:hover{transform:translateY(-2px);box-shadow:var(--sh2);border-color:var(--border2)}
.appt-date-box{
  min-width:58px;height:64px;border-radius:12px;display:flex;flex-direction:column;
  align-items:center;justify-content:center;color:white;flex-shrink:0;
  background:linear-gradient(135deg,var(--navy2),var(--blue));
  box-shadow:0 4px 12px rgba(15,52,96,0.25);
}
.appt-date-day{font-family:'Playfair Display',serif;font-size:26px;line-height:1}
.appt-date-mon{font-size:10px;text-transform:uppercase;letter-spacing:1px;opacity:0.8}
.appt-info{flex:1;min-width:0}
.appt-name{font-weight:700;font-size:15px;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.appt-meta{display:flex;align-items:center;flex-wrap:wrap;gap:10px;margin-top:5px}
.appt-meta-tag{display:flex;align-items:center;gap:4px;font-size:12px;color:var(--text3);font-weight:500}
.appt-right{display:flex;flex-direction:column;align-items:flex-end;gap:8px;flex-shrink:0}
.appt-fee{font-family:'Playfair Display',serif;font-size:16px;color:var(--text);font-weight:600}
.appt-type-badge{font-size:10px;font-weight:700;padding:3px 8px;border-radius:100px;background:rgba(0,150,199,0.1);color:var(--teal);text-transform:uppercase;letter-spacing:0.5px}

/* ── STATUS BADGE ── */
.status-badge{display:inline-flex;align-items:center;gap:5px;padding:4px 10px;border-radius:100px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;white-space:nowrap}

/* ── DOCTOR CARDS ── */
.doc-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:16px}
.doc-card{
  background:white;border-radius:var(--r);border:1px solid var(--border);box-shadow:var(--sh);
  overflow:hidden;transition:all 0.25s;cursor:pointer;
}
.doc-card:hover{transform:translateY(-4px);box-shadow:var(--sh2);border-color:var(--cyan)}
.doc-card-header{padding:20px;background:linear-gradient(135deg,var(--navy2),var(--blue));position:relative;overflow:hidden}
.doc-card-header::before{content:'';position:absolute;top:-30px;right:-30px;width:120px;height:120px;background:rgba(255,255,255,0.05);border-radius:50%;pointer-events:none}
.doc-card-ava{
  width:60px;height:60px;border-radius:50%;background:linear-gradient(135deg,var(--cyan),var(--cyan2));
  display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:700;color:white;
  border:3px solid rgba(255,255,255,0.3);box-shadow:0 4px 16px rgba(0,0,0,0.2);
  margin-bottom:12px;flex-shrink:0;
}
.doc-card-name{font-family:'Playfair Display',serif;font-size:17px;color:white;margin-bottom:4px}
.doc-card-spec{font-size:12px;color:rgba(255,255,255,0.7)}
.doc-rating{display:flex;align-items:center;gap:4px;margin-top:6px}
.doc-rating-num{font-size:13px;font-weight:700;color:white}
.doc-stars{font-size:11px;color:#fcd34d}
.doc-rating-count{font-size:11px;color:rgba(255,255,255,0.5)}
.doc-card-body{padding:16px}
.doc-card-row{display:flex;align-items:center;gap:8px;font-size:12px;color:var(--text3);margin-bottom:8px}
.doc-card-row:last-child{margin-bottom:0}
.doc-chip{display:inline-flex;align-items:center;gap:4px;padding:4px 10px;border-radius:100px;font-size:11px;font-weight:600;background:rgba(0,150,199,0.08);color:var(--teal);margin-right:4px;margin-bottom:4px}
.doc-card-slots{margin-top:12px;padding-top:12px;border-top:1px solid var(--border)}
.slot-grid{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}
.time-slot{
  padding:5px 10px;border:1.5px solid var(--border);border-radius:7px;font-size:11px;font-weight:700;
  color:var(--text3);cursor:pointer;transition:all 0.15s;background:var(--bg);
  white-space:nowrap;
}
.time-slot:hover{border-color:var(--cyan);color:var(--teal);background:rgba(0,180,216,0.05)}
.time-slot.sel{border-color:var(--navy2);background:var(--navy2);color:white}
.time-slot.taken{opacity:0.35;cursor:not-allowed;text-decoration:line-through}

/* ── MODAL ── */
.modal-bg{position:fixed;inset:0;background:rgba(10,37,64,0.5);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;z-index:500;animation:fadeIn 0.2s ease;padding:20px}
.modal{background:white;border-radius:20px;width:100%;max-width:540px;max-height:90vh;overflow-y:auto;box-shadow:var(--sh3);animation:slideUp 0.3s cubic-bezier(0.22,1,0.36,1)}
.modal-lg{max-width:700px}
.modal-hd{padding:24px 28px 0;display:flex;align-items:flex-start;justify-content:space-between}
.modal-title{font-family:'Playfair Display',serif;font-size:22px;color:var(--text)}
.modal-sub{font-size:13px;color:var(--text3);margin-top:3px}
.modal-close{width:32px;height:32px;border-radius:8px;border:1.5px solid var(--border);background:var(--bg);cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:14px;color:var(--text3);transition:all 0.2s;flex-shrink:0}
.modal-close:hover{background:var(--danger);color:white;border-color:var(--danger)}
.modal-body{padding:20px 28px 28px}
.modal-footer{padding:0 28px 24px;display:flex;gap:10px;justify-content:flex-end}
.modal-divider{height:1px;background:var(--border);margin:16px 0}
.modal-info-row{display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--border);font-size:13px}
.modal-info-row:last-child{border-bottom:none}
.modal-info-label{color:var(--text3);font-weight:500}
.modal-info-val{color:var(--text);font-weight:600}

/* ── WIZARD STEPS ── */
.wizard-steps{display:flex;align-items:center;margin-bottom:28px}
.wizard-step{display:flex;align-items:center;gap:8px;flex:1}
.wizard-step-dot{
  width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;
  font-size:12px;font-weight:700;flex-shrink:0;transition:all 0.3s;
}
.wizard-step-dot.done{background:var(--success);color:white}
.wizard-step-dot.active{background:var(--navy2);color:white;box-shadow:0 0 0 4px rgba(15,52,96,0.15)}
.wizard-step-dot.todo{background:var(--bg);color:var(--text4);border:2px solid var(--border)}
.wizard-step-label{font-size:11px;font-weight:600;color:var(--text3);white-space:nowrap}
.wizard-step-label.active{color:var(--navy2)}
.wizard-sep{flex:1;height:2px;background:var(--border);margin:0 8px;border-radius:1px}
.wizard-sep.done{background:var(--success)}

/* ── FILTER BAR ── */
.filter-bar{display:flex;gap:10px;margin-bottom:20px;flex-wrap:wrap;align-items:center}
.filter-input-wrap{position:relative;flex:1;min-width:180px}
.filter-input{width:100%;padding:10px 14px 10px 36px;border:1.5px solid var(--border);border-radius:var(--r2);font-family:'Outfit',sans-serif;font-size:13px;outline:none;background:white;transition:all 0.2s;color:var(--text)}
.filter-input:focus{border-color:var(--cyan);box-shadow:0 0 0 3px rgba(0,180,216,0.08)}
.filter-icon{position:absolute;left:11px;top:50%;transform:translateY(-50%);color:var(--text4);font-size:14px}
.filter-select{padding:10px 14px;border:1.5px solid var(--border);border-radius:var(--r2);font-family:'Outfit',sans-serif;font-size:13px;outline:none;background:white;color:var(--text);cursor:pointer;transition:all 0.2s}
.filter-select:focus{border-color:var(--cyan)}
.filter-tabs{display:flex;background:white;border-radius:var(--r2);border:1.5px solid var(--border);overflow:hidden}
.filter-tab{padding:9px 16px;font-family:'Outfit',sans-serif;font-size:12px;font-weight:600;color:var(--text3);cursor:pointer;transition:all 0.18s;border:none;background:transparent;white-space:nowrap}
.filter-tab:hover{color:var(--text)}
.filter-tab.active{background:var(--navy2);color:white}

/* ── CALENDAR ── */
.cal-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:8px;margin-bottom:20px}
.cal-day{background:white;border-radius:12px;border:1px solid var(--border);overflow:hidden;min-height:90px}
.cal-day-hd{padding:8px;text-align:center;background:linear-gradient(135deg,var(--navy2),var(--blue))}
.cal-day-name{font-size:9px;text-transform:uppercase;letter-spacing:1px;color:rgba(255,255,255,0.65)}
.cal-day-num{font-family:'Playfair Display',serif;font-size:20px;color:white;line-height:1.1}
.cal-day-today{background:linear-gradient(135deg,var(--teal),var(--cyan))}
.cal-slot{padding:4px 6px;border-radius:5px;font-size:10px;font-weight:700;margin:3px;text-align:center}
.cal-slot.free{background:#f0fdf4;color:var(--success)}
.cal-slot.taken{background:#fef3c7;color:var(--warning)}
.cal-slot.blocked{background:#fee2e2;color:var(--danger)}

/* ── CHART CONTAINERS ── */
.chart-wrap{height:220px;margin-top:8px}
.chart-wrap-lg{height:280px;margin-top:8px}

/* ── PROFILE ── */
.profile-header{
  background:linear-gradient(135deg,var(--navy2),var(--blue));border-radius:var(--r);padding:28px;
  display:flex;align-items:center;gap:20px;margin-bottom:20px;position:relative;overflow:hidden;
}
.profile-header::before{content:'';position:absolute;top:-40px;right:-40px;width:200px;height:200px;background:rgba(255,255,255,0.04);border-radius:50%}
.profile-ava{width:80px;height:80px;border-radius:50%;background:linear-gradient(135deg,var(--cyan),var(--cyan2));display:flex;align-items:center;justify-content:center;font-size:26px;font-weight:700;color:white;border:4px solid rgba(255,255,255,0.25);box-shadow:0 8px 24px rgba(0,0,0,0.2);flex-shrink:0}
.profile-name{font-family:'Playfair Display',serif;font-size:24px;color:white;margin-bottom:4px}
.profile-role{font-size:12px;color:rgba(255,255,255,0.6);text-transform:uppercase;letter-spacing:1px;margin-bottom:8px}
.profile-tags{display:flex;flex-wrap:wrap;gap:6px}
.profile-tag{padding:4px 10px;border-radius:100px;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);font-size:11px;color:rgba(255,255,255,0.8);font-weight:600}

/* ── HEALTH CARD ── */
.health-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px}
.health-card{background:white;border-radius:var(--r2);padding:16px;border:1px solid var(--border);box-shadow:var(--sh);text-align:center}
.health-icon{font-size:28px;margin-bottom:8px}
.health-label{font-size:11px;color:var(--text4);text-transform:uppercase;letter-spacing:0.5px;font-weight:600}
.health-value{font-family:'Playfair Display',serif;font-size:22px;color:var(--text);margin-top:2px}
.health-unit{font-size:11px;color:var(--text3)}

/* ── PRESCRIPTION ── */
.rx-card{background:linear-gradient(135deg,#f0f9ff,#e0f2fe);border:2px dashed var(--cyan);border-radius:var(--r);padding:20px;position:relative}
.rx-badge{position:absolute;top:12px;right:12px;background:var(--teal);color:white;font-size:11px;font-weight:700;padding:4px 10px;border-radius:100px}
.rx-header{display:flex;align-items:center;gap:10px;margin-bottom:12px}
.rx-symbol{font-size:28px;color:var(--teal)}
.rx-title{font-family:'Playfair Display',serif;font-size:16px;color:var(--navy2)}
.rx-content{font-size:13px;color:var(--text2);line-height:1.8;white-space:pre-wrap;background:white;border-radius:8px;padding:12px}

/* ── TIMELINE ── */
.timeline{position:relative;padding-left:24px}
.timeline::before{content:'';position:absolute;left:8px;top:0;bottom:0;width:2px;background:var(--border)}
.tl-item{position:relative;margin-bottom:20px;animation:slideIn 0.3s ease both}
.tl-dot{position:absolute;left:-20px;top:6px;width:14px;height:14px;border-radius:50%;border:2px solid white;box-shadow:0 0 0 2px var(--border);background:var(--text4)}
.tl-dot.confirmed{background:var(--success)}.tl-dot.completed{background:var(--purple)}.tl-dot.cancelled{background:var(--danger)}.tl-dot.pending{background:var(--warning)}
.tl-card{background:white;border:1px solid var(--border);border-radius:var(--r2);padding:14px;box-shadow:var(--sh)}
.tl-date{font-size:11px;color:var(--text4);font-weight:600;margin-bottom:6px}
.tl-title{font-weight:700;font-size:14px;color:var(--text)}
.tl-sub{font-size:12px;color:var(--text3);margin-top:3px}

/* ── RATING ── */
.star-display{display:inline-flex;gap:2px}
.star{font-size:14px;transition:transform 0.1s}
.star.filled{color:#fcd34d}.star.empty{color:#e5e7eb}

/* ── NOTIFICATION ── */
.notif-panel{position:absolute;top:calc(100% + 8px);right:0;width:360px;background:white;border-radius:var(--r);border:1px solid var(--border);box-shadow:var(--sh3);z-index:300;animation:slideUp 0.2s ease;overflow:hidden}
.notif-hd{padding:14px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between}
.notif-item{padding:13px 16px;display:flex;gap:12px;border-bottom:1px solid var(--border);transition:background 0.15s;cursor:pointer}
.notif-item:last-child{border-bottom:none}
.notif-item:hover{background:var(--bg)}
.notif-item.unread{background:rgba(0,180,216,0.04)}
.notif-icon{width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0;background:var(--bg)}
.notif-title{font-size:13px;font-weight:700;color:var(--text);margin-bottom:2px}
.notif-msg{font-size:11px;color:var(--text3);line-height:1.4}
.notif-time{font-size:10px;color:var(--text4);margin-top:3px}
.notif-unread-dot{width:7px;height:7px;border-radius:50%;background:var(--cyan);flex-shrink:0;margin-top:5px}

/* ── TOAST ── */
.toast{
  position:fixed;bottom:24px;right:24px;background:var(--navy);color:white;
  padding:13px 18px;border-radius:var(--r2);font-size:13px;font-weight:500;
  box-shadow:var(--sh3);z-index:1000;display:flex;align-items:center;gap:10px;max-width:380px;
  animation:toastIn 0.3s cubic-bezier(0.22,1,0.36,1);
}
.toast-success{background:var(--success)}.toast-danger{background:var(--danger)}.toast-warning{background:var(--warning)}

/* ── TABLE ── */
.table-wrap{border-radius:var(--r);overflow:hidden;border:1px solid var(--border);box-shadow:var(--sh)}
.tbl{width:100%;border-collapse:collapse}
.tbl th{background:var(--bg);padding:11px 16px;text-align:left;font-size:11px;font-weight:700;color:var(--text4);text-transform:uppercase;letter-spacing:0.5px;border-bottom:1px solid var(--border)}
.tbl td{padding:13px 16px;font-size:13px;color:var(--text);border-bottom:1px solid var(--border);background:white;transition:background 0.15s}
.tbl tr:last-child td{border-bottom:none}
.tbl tr:hover td{background:var(--surface2)}
.tbl-name{font-weight:700;display:flex;align-items:center;gap:10px}
.tbl-ava{width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,var(--cyan),var(--teal));display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:white;flex-shrink:0}

/* ── GRID LAYOUTS ── */
.grid-2{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.grid-3{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
.grid-60-40{display:grid;grid-template-columns:1.5fr 1fr;gap:16px}
.grid-40-60{display:grid;grid-template-columns:1fr 1.5fr;gap:16px}

/* ── MISC ── */
.section-title{font-family:'Playfair Display',serif;font-size:18px;color:var(--text);margin-bottom:14px;display:flex;align-items:center;justify-content:space-between}
.section-title-actions{display:flex;align-items:center;gap:8px}
.empty{text-align:center;padding:48px 20px;color:var(--text3)}
.empty-icon{font-size:42px;margin-bottom:10px}
.empty-title{font-family:'Playfair Display',serif;font-size:18px;color:var(--text2);margin-bottom:5px}
.empty-sub{font-size:13px}
.divider{height:1px;background:var(--border);margin:16px 0}
.text-muted{color:var(--text3)}
.text-sm{font-size:12px}
.text-xs{font-size:11px}
.fw-700{font-weight:700}
.gap-8{gap:8px}
.flex{display:flex}.items-center{align-items:center}.justify-between{justify-content:space-between}
.flex-wrap{flex-wrap:wrap}
.mb-8{margin-bottom:8px}.mb-12{margin-bottom:12px}.mb-16{margin-bottom:16px}.mb-20{margin-bottom:20px}.mb-24{margin-bottom:24px}
.mt-8{margin-top:8px}.mt-12{margin-top:12px}.mt-16{margin-top:16px}
.p-16{padding:16px}
.pill{display:inline-flex;padding:3px 10px;border-radius:100px;font-size:11px;font-weight:700}
.pill-navy{background:rgba(15,52,96,0.1);color:var(--navy2)}
.pill-cyan{background:rgba(0,180,216,0.1);color:var(--teal)}
.pill-green{background:#d1fae5;color:var(--success)}
.pill-red{background:#fee2e2;color:var(--danger)}
.pill-yellow{background:#fef3c7;color:var(--warning)}
.pill-purple{background:#ede9fe;color:var(--purple)}
.quick-action-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:24px}
.quick-action{background:white;border:1px solid var(--border);border-radius:var(--r2);padding:16px;text-align:center;cursor:pointer;transition:all 0.2s;box-shadow:var(--sh)}
.quick-action:hover{transform:translateY(-2px);box-shadow:var(--sh2);border-color:var(--cyan)}
.quick-action-icon{font-size:24px;margin-bottom:8px}
.quick-action-label{font-size:12px;font-weight:600;color:var(--text2)}
.banner{border-radius:var(--r);padding:22px 24px;position:relative;overflow:hidden;margin-bottom:20px}
.banner-navy{background:linear-gradient(135deg,var(--navy2),var(--blue))}
.banner-teal{background:linear-gradient(135deg,var(--teal),var(--cyan))}
.banner-success{background:linear-gradient(135deg,#059669,#10b981)}
.banner::before{content:'';position:absolute;top:-30px;right:-30px;width:160px;height:160px;background:rgba(255,255,255,0.06);border-radius:50%}
.avatar-row{display:flex}
.avatar-row .tbl-ava{margin-left:-8px;border:2px solid white}
.avatar-row .tbl-ava:first-child{margin-left:0}
.progress-bar{height:6px;border-radius:3px;background:var(--border);overflow:hidden;margin-top:6px}
.progress-fill{height:100%;border-radius:3px;transition:width 0.6s ease;background:linear-gradient(90deg,var(--navy2),var(--cyan))}
.info-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.info-item{background:var(--surface2);border-radius:var(--r2);padding:12px;border:1px solid var(--border)}
.info-item-label{font-size:10px;font-weight:700;color:var(--text4);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px}
.info-item-val{font-size:14px;font-weight:600;color:var(--text)}
.tag-list{display:flex;flex-wrap:wrap;gap:6px}
.tag{display:inline-flex;padding:4px 10px;border-radius:100px;font-size:11px;font-weight:600;background:var(--bg);color:var(--text2);border:1px solid var(--border)}
.tag-red{background:#fee2e2;color:var(--danger);border-color:#fca5a5}
.tag-yellow{background:#fef3c7;color:var(--warning);border-color:#fcd34d}
@media(max-width:1100px){.stats-row{grid-template-columns:repeat(2,1fr)}.health-grid{grid-template-columns:repeat(2,1fr)}.quick-action-grid{grid-template-columns:repeat(2,1fr)}}
@media(max-width:768px){.sidebar{transform:translateX(-100%)}.main{margin-left:0}.topbar{left:0}.grid-2,.grid-3,.grid-60-40,.grid-40-60{grid-template-columns:1fr}.doc-grid{grid-template-columns:1fr}}
`;

// ═══════════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════════

export default function App() {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState(INITIAL_APPOINTMENTS);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [reviews] = useState(REVIEWS_DB);
  const [page, setPage] = useState("dashboard");
  const [toast, setToast] = useState(null);
  const [notifOpen, setNotifOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState("");
  const [darkMode] = useState(false);

  const showToast = useCallback((msg, type="success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const login = (email, password, role) => {
    const u = ALL_USERS.find(x => x.email === email && x.password === password && x.role === role);
    if (!u) return false;
    setToken(fakeJWT.sign({ id: u.id, role: u.role, name: u.name }));
    setUser(u);
    setPage("dashboard");
    return true;
  };

  const logout = () => { setToken(null); setUser(null); setPage("dashboard"); };

  const bookAppointment = (appt) => {
    const newAppt = { ...appt, id: `ap${gid()}`, status: "pending", prescription: null, notes: "" };
    setAppointments(p => [...p, newAppt]);
    const notif = { id: `n${gid()}`, userId: appt.patientId, type: "booked", title: "Appointment Requested", message: `Your appointment with ${appt.doctorName} on ${fmtDate(appt.date)} at ${fmtTime(appt.time)} has been submitted.`, time: new Date().toISOString(), read: false, icon: "📅" };
    setNotifications(p => [notif, ...p]);
    showToast("✅ Appointment booked! Awaiting confirmation.", "success");
  };

  const updateAppointment = (id, changes) => {
    setAppointments(p => p.map(a => a.id === id ? { ...a, ...changes } : a));
    if (changes.status === "confirmed") showToast("✅ Appointment confirmed!", "success");
    else if (changes.status === "cancelled") showToast("❌ Appointment cancelled.", "danger");
    else if (changes.status === "completed") showToast("⭐ Marked as completed!", "success");
    else if (changes.prescription) showToast("💊 Prescription saved!", "success");
  };

  const markNotifRead = (id) => setNotifications(p => p.map(n => n.id === id ? { ...n, read: true } : n));
  const markAllRead = () => setNotifications(p => p.map(n => ({ ...n, read: true })));

  const unreadCount = notifications.filter(n => n.userId === user?.id && !n.read).length;
  const userNotifs = notifications.filter(n => n.userId === user?.id);

  if (!token) return (
    <>
      <style>{CSS}</style>
      <AuthPage onLogin={login} />
    </>
  );

  const navItems = {
    patient: [
      { id: "dashboard", icon: "⊞", label: "Dashboard" },
      { id: "book", icon: "＋", label: "Book Appointment" },
      { id: "appointments", icon: "📋", label: "My Appointments" },
      { id: "history", icon: "📊", label: "Medical History" },
      { id: "profile", icon: "👤", label: "My Profile" },
    ],
    doctor: [
      { id: "dashboard", icon: "⊞", label: "Dashboard" },
      { id: "schedule", icon: "🗓", label: "Schedule" },
      { id: "patients", icon: "👥", label: "Patients" },
      { id: "analytics", icon: "📈", label: "Analytics" },
      { id: "profile", icon: "👤", label: "My Profile" },
    ],
    admin: [
      { id: "dashboard", icon: "⊞", label: "Overview" },
      { id: "doctors", icon: "🩺", label: "Doctors" },
      { id: "patients", icon: "👥", label: "Patients" },
      { id: "analytics", icon: "📈", label: "Analytics" },
    ],
  };

  const currentNav = navItems[user.role] || navItems.patient;

  return (
    <>
      <style>{CSS}</style>
      <div className="app-shell">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="sb-logo">
            <div className="sb-logo-icon">🩺</div>
            <div>
              <div className="sb-logo-name">MediBook</div>
              <div className="sb-logo-tag">Smart Healthcare</div>
            </div>
          </div>
          <nav className="sb-nav">
            <div className="sb-section-label">Main Menu</div>
            {currentNav.map(item => (
              <div key={item.id} className={`sb-item ${page === item.id ? "active" : ""}`} onClick={() => setPage(item.id)}>
                <span className="sb-item-icon">{item.icon}</span>
                {item.label}
                {item.id === "appointments" && unreadCount > 0 && (
                  <span className="sb-item-badge">{unreadCount}</span>
                )}
              </div>
            ))}
          </nav>
          <div className="sb-footer">
            <div className="sb-user">
              <div className="sb-user-ava">{initials(user.name)}</div>
              <div>
                <div className="sb-user-name">{user.name.split(" ").slice(0,2).join(" ")}</div>
                <div className="sb-user-role">{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</div>
              </div>
            </div>
            <button className="sb-logout" onClick={logout}>⎋ &nbsp;Sign Out</button>
          </div>
        </aside>

        {/* Top Bar */}
        <div className="topbar">
          <div className="topbar-search-wrap">
            <span className="topbar-search-icon">🔍</span>
            <input className="topbar-search" placeholder="Search doctors, appointments, patients..." value={globalSearch} onChange={e => setGlobalSearch(e.target.value)} />
          </div>
          <div className="topbar-right">
            <div className="topbar-date">📅 {new Date().toLocaleDateString("en-IN",{weekday:"short",day:"numeric",month:"short",year:"numeric"})}</div>
            <div className="topbar-notif" style={{position:"relative"}}>
              <div className="topbar-notif-icon" onClick={() => setNotifOpen(o => !o)}>🔔</div>
              {unreadCount > 0 && <div className="topbar-notif-dot" />}
              {notifOpen && (
                <NotifPanel notifs={userNotifs} onRead={markNotifRead} onReadAll={markAllRead} onClose={() => setNotifOpen(false)} />
              )}
            </div>
            <div className="topbar-ava">{initials(user.name)}</div>
          </div>
        </div>

        {/* Main */}
        <main className="main" onClick={() => setNotifOpen(false)}>
          {/* PATIENT PAGES */}
          {user.role === "patient" && page === "dashboard" && <PatientDashboard user={user} appointments={appointments} setPage={setPage} />}
          {user.role === "patient" && page === "book" && <BookPage user={user} appointments={appointments} onBook={bookAppointment} reviews={reviews} showToast={showToast} />}
          {user.role === "patient" && page === "appointments" && <PatientAppointments user={user} appointments={appointments} onUpdate={updateAppointment} />}
          {user.role === "patient" && page === "history" && <MedicalHistory user={user} appointments={appointments} />}
          {user.role === "patient" && page === "profile" && <PatientProfile user={user} appointments={appointments} />}

          {/* DOCTOR PAGES */}
          {user.role === "doctor" && page === "dashboard" && <DoctorDashboard user={user} appointments={appointments} onUpdate={updateAppointment} setPage={setPage} />}
          {user.role === "doctor" && page === "schedule" && <DoctorSchedule user={user} appointments={appointments} onUpdate={updateAppointment} />}
          {user.role === "doctor" && page === "patients" && <DoctorPatients user={user} appointments={appointments} onUpdate={updateAppointment} />}
          {user.role === "doctor" && page === "analytics" && <DoctorAnalytics user={user} appointments={appointments} />}
          {user.role === "doctor" && page === "profile" && <DoctorProfile user={user} appointments={appointments} />}

          {/* ADMIN PAGES */}
          {user.role === "admin" && page === "dashboard" && <AdminDashboard appointments={appointments} />}
          {user.role === "admin" && page === "doctors" && <AdminDoctors />}
          {user.role === "admin" && page === "patients" && <AdminPatients appointments={appointments} />}
          {user.role === "admin" && page === "analytics" && <AdminAnalytics appointments={appointments} />}
        </main>
      </div>

      {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════
// AUTH
// ═══════════════════════════════════════════════════════════════════

function AuthPage({ onLogin }) {
  const [role, setRole] = useState("patient");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); setErr(""); setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    if (!onLogin(email, pw, role)) setErr("Invalid credentials. Please check your email and password.");
    setLoading(false);
  };

  const demos = [
    { role:"patient", email:"rohan@email.com", pw:"pass123", label:"Patient" },
    { role:"doctor", email:"priya@hospital.com", pw:"doc123", label:"Doctor" },
    { role:"admin", email:"admin@medibook.com", pw:"admin123", label:"Admin" },
  ];

  return (
    <div className="auth-root">
      <div className="auth-left">
        <div className="auth-orb auth-orb1" />
        <div className="auth-orb auth-orb2" />
        <div className="auth-orb auth-orb3" />
        <div className="auth-brand">
          <div className="auth-brand-icon">🩺</div>
          <div>
            <div className="auth-brand-name">MediBook</div>
            <div className="auth-brand-sub">Smart Healthcare System</div>
          </div>
        </div>
        <div className="auth-tagline">Healthcare Reimagined</div>
        <h1 className="auth-headline">India's Smartest<br/><em>Healthcare</em><br/>Platform</h1>
        <p className="auth-desc">No more waiting in queues. Book appointments instantly, get AI-powered reminders, and connect with India's top doctors from the comfort of your home.</p>
        <div>
          {[["🏥","Multi-Hospital Network","Access 500+ doctors across 50+ top hospitals in India"],["⚡","Instant Slot Booking","Real-time availability with zero double-booking guaranteed"],["🔔","Smart Reminders","Automated reminders via SMS, email & in-app notifications"],["🎥","Video Consultations","Consult from home with secure HD video calls"]].map(([icon,title,desc]) => (
            <div key={title} className="auth-feature">
              <div className="auth-feature-icon">{icon}</div>
              <div className="auth-feature-text"><strong>{title}</strong> — {desc}</div>
            </div>
          ))}
        </div>
        <div className="auth-stats">
          {[["500+","Doctors"],["50K+","Patients"],["12","Cities"],["99%","Uptime"]].map(([n,l]) => (
            <div key={l}><div className="auth-stat-num">{n}</div><div className="auth-stat-label">{l}</div></div>
          ))}
        </div>
      </div>
      <div className="auth-right">
        <div className="auth-form-wrap animate-fadeIn">
          <h2 className="auth-form-title">Welcome back</h2>
          <p className="auth-form-sub">Sign in to access your healthcare dashboard</p>
          <div className="role-selector">
            {[["patient","👤","Patient"],["doctor","🩺","Doctor"],["admin","⚙️","Admin"]].map(([r,icon,lbl]) => (
              <button key={r} className={`role-btn ${role===r?"active":""}`} onClick={() => setRole(r)}>
                <span className="role-icon">{icon}</span>{lbl}
              </button>
            ))}
          </div>
          {err && <div className="err-alert">⚠️ {err}</div>}
          <form onSubmit={handleSubmit}>
            <div className="field">
              <label className="field-label">Email Address</label>
              <input className="field-input" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="field">
              <label className="field-label">Password</label>
              <input className="field-input" type="password" placeholder="••••••••" value={pw} onChange={e => setPw(e.target.value)} required />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Signing in..." : `Sign in as ${role.charAt(0).toUpperCase()+role.slice(1)} →`}
            </button>
          </form>
          <div className="demo-box">
            <div className="demo-box-title">🔑 Quick Demo Accounts</div>
            {demos.map(d => (
              <div key={d.role} className="demo-row">
                <span><span className="demo-badge">{d.label}</span> &nbsp; {d.email}</span>
                <button className="btn btn-ghost btn-xs" onClick={() => { setRole(d.role); setEmail(d.email); setPw(d.pw); }}>Fill</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// NOTIFICATION PANEL
// ═══════════════════════════════════════════════════════════════════

function NotifPanel({ notifs, onRead, onReadAll, onClose }) {
  return (
    <div className="notif-panel" onClick={e => e.stopPropagation()}>
      <div className="notif-hd">
        <div style={{fontWeight:700,fontSize:14}}>Notifications <span className="pill pill-cyan" style={{marginLeft:6}}>{notifs.filter(n=>!n.read).length} new</span></div>
        <button className="btn btn-ghost btn-xs" onClick={onReadAll}>Mark all read</button>
      </div>
      {notifs.length === 0
        ? <div className="empty" style={{padding:24}}><div className="empty-icon">🔔</div><div style={{fontSize:13,color:"var(--text3)"}}>No notifications</div></div>
        : notifs.slice(0,8).map(n => (
          <div key={n.id} className={`notif-item ${!n.read?"unread":""}`} onClick={() => onRead(n.id)}>
            <div className="notif-icon">{n.icon}</div>
            <div style={{flex:1,minWidth:0}}>
              <div className="notif-title">{n.title}</div>
              <div className="notif-msg">{n.message}</div>
              <div className="notif-time">{fmtDate(n.time.split("T")[0])}</div>
            </div>
            {!n.read && <div className="notif-unread-dot" />}
          </div>
        ))
      }
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// PATIENT DASHBOARD
// ═══════════════════════════════════════════════════════════════════

function PatientDashboard({ user, appointments, setPage }) {
  const myAppts = appointments.filter(a => a.patientId === user.id);
  const upcoming = myAppts.filter(a => isUpcoming(a.date) && a.status !== "cancelled");
  const completed = myAppts.filter(a => a.status === "completed");
  const confirmed = myAppts.filter(a => a.status === "confirmed");
  const next = upcoming.sort((a,b) => new Date(a.date)-new Date(b.date))[0];
  const weeklyData = getWeeklyData(myAppts);

  return (
    <div className="animate-slideUp">
      <div className="page-hd">
        <div className="breadcrumb"><span>Home</span><span className="breadcrumb-sep">›</span><span>Dashboard</span></div>
        <div className="page-hd-top">
          <div>
            <div className="page-title">Good {new Date().getHours()<12?"Morning":new Date().getHours()<17?"Afternoon":"Evening"}, {user.name.split(" ")[0]} 👋</div>
            <div className="page-sub">Here's your health overview — {fmtDate(today())}</div>
          </div>
          <button className="btn btn-cyan" onClick={() => setPage("book")}>＋ Book Appointment</button>
        </div>
      </div>

      <div className="stats-row">
        <StatCard icon="📅" bg="#dbeafe" label="Total Appointments" value={myAppts.length} trend={`${upcoming.length} upcoming`} trendType="neutral" />
        <StatCard icon="✅" bg="#d1fae5" label="Confirmed" value={confirmed.length} trend="Active" trendType="up" />
        <StatCard icon="⭐" bg="#ede9fe" label="Completed" value={completed.length} trend="Visited" trendType="up" />
        <StatCard icon="🏥" bg="#fef3c7" label="Doctors Seen" value={new Set(myAppts.map(a=>a.doctorId)).size} trend="Unique doctors" trendType="neutral" />
      </div>

      {user.dob && (
        <div className="health-grid mb-20">
          <HealthCard icon="🩸" label="Blood Group" value={user.blood} unit="" />
          <HealthCard icon="⚖️" label="Weight" value={user.weight} unit="kg" />
          <HealthCard icon="📏" label="Height" value={user.height} unit="cm" />
          <HealthCard icon="🎂" label="Age" value={calcAge(user.dob)} unit="years" />
        </div>
      )}

      {next && (
        <div className="banner banner-navy mb-20">
          <div className="flex items-center justify-between" style={{position:"relative",zIndex:1}}>
            <div>
              <div style={{fontSize:11,color:"rgba(255,255,255,0.5)",textTransform:"uppercase",letterSpacing:2,marginBottom:8}}>Next Appointment</div>
              <div style={{fontFamily:"Playfair Display,serif",fontSize:22,color:"white",marginBottom:6}}>{next.doctorName}</div>
              <div style={{display:"flex",gap:16,flexWrap:"wrap"}}>
                {[["📅",fmtDate(next.date)],["🕐",fmtTime(next.time)],["🏥",next.hospital],["💊",next.specialty]].map(([icon,val]) => (
                  <span key={val} style={{fontSize:13,color:"rgba(255,255,255,0.7)",display:"flex",alignItems:"center",gap:4}}>{icon} {val}</span>
                ))}
              </div>
            </div>
            <div style={{textAlign:"right"}}>
              <StatusBadge status={next.status} />
              <div style={{fontSize:12,color:"rgba(255,255,255,0.5)",marginTop:8}}>
                {daysUntil(next.date)===0?"Today!":`in ${daysUntil(next.date)} day${daysUntil(next.date)!==1?"s":""}`}
              </div>
              <div style={{fontSize:11,color:"rgba(255,255,255,0.4)",marginTop:4}}>🔔 Reminder set</div>
            </div>
          </div>
        </div>
      )}

      <div className="quick-action-grid">
        {[["📅","Book Appointment","book"],["📋","View All Appointments","appointments"],["📊","Medical History","history"],["👤","My Profile","profile"]].map(([icon,label,pg]) => (
          <div key={pg} className="quick-action" onClick={() => setPage(pg)}>
            <div className="quick-action-icon">{icon}</div>
            <div className="quick-action-label">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid-60-40">
        <div>
          <div className="section-title">Recent Appointments
            <div className="section-title-actions"><button className="btn btn-ghost btn-sm" onClick={()=>setPage("appointments")}>View All →</button></div>
          </div>
          <div className="appt-list">
            {myAppts.length===0
              ? <Empty icon="📭" title="No appointments yet" sub="Book your first appointment!" />
              : myAppts.slice(0,4).map((a,i) => <ApptCard key={a.id} appt={a} view="patient" delay={i*0.05} />)
            }
          </div>
        </div>
        <div>
          <div className="section-title">Weekly Activity</div>
          <div className="card card-pad">
            <div className="chart-wrap">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData} barSize={20}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="day" tick={{fontSize:11,fill:"#8fa8c2"}} axisLine={false} tickLine={false} />
                  <YAxis tick={{fontSize:11,fill:"#8fa8c2"}} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={{borderRadius:8,border:"1px solid #d8e5f0",fontSize:12}} />
                  <Bar dataKey="appointments" fill="#0f3460" radius={[4,4,0,0]} name="Appointments" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {user.conditions?.length > 0 && (
            <>
              <div className="section-title mt-16">Medical Conditions</div>
              <div className="card card-pad">
                <div className="tag-list">
                  {user.conditions.map(c => <span key={c} className="tag tag-yellow">{c}</span>)}
                </div>
                {user.allergies?.length > 0 && (
                  <>
                    <div className="divider" />
                    <div style={{fontSize:12,fontWeight:700,color:"var(--text4)",textTransform:"uppercase",letterSpacing:0.5,marginBottom:8}}>Allergies</div>
                    <div className="tag-list">
                      {user.allergies.map(a => <span key={a} className="tag tag-red">⚠️ {a}</span>)}
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// BOOK APPOINTMENT (Multi-step Wizard)
// ═══════════════════════════════════════════════════════════════════

function BookPage({ user, appointments, onBook, reviews, showToast }) {
  const [step, setStep] = useState(1);
  const [search, setSearch] = useState("");
  const [specialty, setSpecialty] = useState("All");
  const [sortBy, setSortBy] = useState("rating");
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [selectedDate, setSelectedDate] = useState(today());
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedType, setSelectedType] = useState("In-Person");
  const [reason, setReason] = useState("");
  const [reasonDetail, setReasonDetail] = useState("");
  const [modal, setModal] = useState(false);

  const bookedMap = useMemo(() => {
    const m = {};
    appointments.filter(a => a.status !== "cancelled").forEach(a => {
      const key = `${a.doctorId}_${a.date}`;
      if (!m[key]) m[key] = [];
      m[key].push(a.time);
    });
    return m;
  }, [appointments]);

  const filtered = useMemo(() => {
    let docs = DOCTORS_DB.filter(d =>
      (specialty === "All" || d.specialty === specialty) &&
      (d.name.toLowerCase().includes(search.toLowerCase()) ||
       d.specialty.toLowerCase().includes(search.toLowerCase()) ||
       d.hospital.toLowerCase().includes(search.toLowerCase()))
    );
    if (sortBy === "rating") docs.sort((a,b) => b.rating - a.rating);
    else if (sortBy === "fee") docs.sort((a,b) => a.fee - b.fee);
    else if (sortBy === "experience") docs.sort((a,b) => b.experience - a.experience);
    return docs;
  }, [search, specialty, sortBy]);

  const confirmBook = () => {
    if (!reason.trim()) { showToast("⚠️ Please add a reason for your visit.", "warning"); return; }
    onBook({
      patientId: user.id, patientName: user.name,
      doctorId: selectedDoc.id, doctorName: selectedDoc.name,
      specialty: selectedDoc.specialty, hospital: selectedDoc.hospital,
      date: selectedDate, time: selectedSlot, type: selectedType, fee: selectedDoc.fee,
      reason: `${reason}${reasonDetail ? ": "+reasonDetail : ""}`,
    });
    setModal(false); setStep(1); setSelectedDoc(null); setSelectedSlot(null); setReason(""); setReasonDetail("");
  };

  const docReviews = selectedDoc ? reviews.filter(r => r.doctorId === selectedDoc.id) : [];

  return (
    <div className="animate-slideUp">
      <div className="page-hd">
        <div className="breadcrumb"><span>Dashboard</span><span className="breadcrumb-sep">›</span><span>Book Appointment</span></div>
        <div className="page-title">Book an Appointment</div>
        <div className="page-sub">Search, compare, and book the best doctors near you</div>
      </div>

      <div className="filter-bar">
        <div className="filter-input-wrap">
          <span className="filter-icon">🔍</span>
          <input className="filter-input" placeholder="Search by name, specialty, hospital..." value={search} onChange={e=>setSearch(e.target.value)} />
        </div>
        <select className="filter-select" value={specialty} onChange={e=>setSpecialty(e.target.value)}>
          <option>All</option>
          {SPECIALTIES.map(s=><option key={s}>{s}</option>)}
        </select>
        <select className="filter-select" value={sortBy} onChange={e=>setSortBy(e.target.value)}>
          <option value="rating">Sort: Highest Rated</option>
          <option value="fee">Sort: Lowest Fee</option>
          <option value="experience">Sort: Most Experienced</option>
        </select>
        <div style={{fontSize:12,color:"var(--text3)",whiteSpace:"nowrap"}}>{filtered.length} doctor{filtered.length!==1?"s":""} found</div>
      </div>

      <div className="doc-grid">
        {filtered.map(doc => {
          const booked = bookedMap[`${doc.id}_${selectedDate}`] || [];
          return (
            <div key={doc.id} className="doc-card">
              <div className="doc-card-header">
                <div className="flex items-center gap-8 mb-12" style={{gap:12}}>
                  <div className="doc-card-ava">{doc.avatar}</div>
                  <div style={{flex:1}}>
                    <div className="doc-card-name">{doc.name}</div>
                    <div className="doc-card-spec">{doc.specialty}</div>
                    <div className="doc-rating">
                      <span className="doc-rating-num">{doc.rating}</span>
                      <StarDisplay rating={doc.rating} />
                      <span className="doc-rating-count">({doc.reviews})</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="doc-card-body">
                <div className="doc-card-row">🏥 {doc.hospital}</div>
                <div className="doc-card-row">🎓 {doc.qualification}</div>
                <div className="doc-card-row">⏱️ {doc.experience} years experience</div>
                <div className="flex items-center justify-between mb-8 mt-8">
                  <div style={{fontSize:13,color:"var(--text2)"}}>
                    {doc.consultType.map(t => <span key={t} className="doc-chip">{t==="Video"?"🎥":"🏥"} {t}</span>)}
                  </div>
                  <div style={{fontFamily:"Playfair Display,serif",fontSize:18,color:"var(--navy2)",fontWeight:700}}>₹{doc.fee}</div>
                </div>
                <div className="doc-card-slots">
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <span className="text-xs text-muted fw-700" style={{textTransform:"uppercase",letterSpacing:0.5}}>Pick Date & Slot</span>
                    <input type="date" style={{fontSize:11,padding:"4px 8px",border:"1px solid var(--border)",borderRadius:6,fontFamily:"Outfit,sans-serif",outline:"none",color:"var(--text)"}} value={selectedDate} min={today()} onChange={e=>setSelectedDate(e.target.value)} />
                  </div>
                  <div className="slot-grid mt-8">
                    {doc.slots.map(slot => {
                      const taken = booked.includes(slot);
                      const sel = selectedDoc?.id===doc.id && selectedSlot===slot;
                      return (
                        <div key={slot} className={`time-slot ${sel?"sel":""} ${taken?"taken":""}`}
                          onClick={() => { if(!taken){ setSelectedDoc(doc); setSelectedSlot(slot); setModal(true); } }}>
                          {fmtTime(slot)}
                        </div>
                      );
                    })}
                  </div>
                </div>
                {reviews.filter(r=>r.doctorId===doc.id).length>0 && (
                  <div style={{marginTop:12,paddingTop:12,borderTop:"1px solid var(--border)"}}>
                    {reviews.filter(r=>r.doctorId===doc.id).slice(0,1).map(r=>(
                      <div key={r.id} style={{background:"var(--surface2)",borderRadius:8,padding:10}}>
                        <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                          <span style={{fontSize:12,fontWeight:700,color:"var(--text2)"}}>{r.patientName}</span>
                          <StarDisplay rating={r.rating} size={10} />
                        </div>
                        <div style={{fontSize:11,color:"var(--text3)",lineHeight:1.5}}>&ldquo;{r.text.slice(0,80)}...&rdquo;</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {modal && selectedDoc && (
        <div className="modal-bg">
          <div className="modal">
            <div className="modal-hd">
              <div>
                <div className="modal-title">Confirm Appointment</div>
                <div className="modal-sub">Review details before booking</div>
              </div>
              <button className="modal-close" onClick={()=>setModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{background:"linear-gradient(135deg,var(--navy2),var(--blue))",borderRadius:12,padding:16,marginBottom:20,display:"flex",alignItems:"center",gap:14}}>
                <div className="doc-card-ava" style={{width:52,height:52,fontSize:16}}>{selectedDoc.avatar}</div>
                <div>
                  <div style={{fontFamily:"Playfair Display,serif",fontSize:17,color:"white"}}>{selectedDoc.name}</div>
                  <div style={{fontSize:12,color:"rgba(255,255,255,0.7)"}}>{selectedDoc.specialty} · {selectedDoc.hospital}</div>
                  <div style={{fontSize:12,color:"rgba(255,255,255,0.6)",marginTop:6}}>📅 {fmtDate(selectedDate)} &nbsp;·&nbsp; 🕐 {fmtTime(selectedSlot)}</div>
                </div>
              </div>

              <div className="field">
                <label className="field-label">Consultation Type</label>
                <div style={{display:"flex",gap:8}}>
                  {selectedDoc.consultType.map(t => (
                    <button key={t} className={`btn btn-sm ${selectedType===t?"btn-cyan":"btn-ghost"}`} style={{flex:1}} onClick={()=>setSelectedType(t)}>
                      {t==="Video"?"🎥":"🏥"} {t}
                    </button>
                  ))}
                </div>
              </div>
              <div className="field">
                <label className="field-label">Primary Reason</label>
                <select className="field-input" value={reason} onChange={e=>setReason(e.target.value)}>
                  <option value="">Select reason</option>
                  {["General Checkup","Follow-up Visit","New Symptoms","Test Results Review","Prescription Renewal","Second Opinion","Emergency"].map(r=><option key={r}>{r}</option>)}
                </select>
              </div>
              <div className="field">
                <label className="field-label">Additional Details <span style={{color:"var(--text4)",fontWeight:400,fontSize:10,textTransform:"none"}}>(optional)</span></label>
                <textarea className="field-input" rows={3} placeholder="Describe your symptoms in detail..." value={reasonDetail} onChange={e=>setReasonDetail(e.target.value)} />
              </div>

              <div className="modal-info-row">
                <span className="modal-info-label">Consultation Fee</span>
                <span className="modal-info-val" style={{fontFamily:"Playfair Display,serif",fontSize:18,color:"var(--navy2)"}}>₹{selectedDoc.fee}</span>
              </div>
              <div className="modal-info-row">
                <span className="modal-info-label">Insurance</span>
                <span className="modal-info-val">{user.insurance || "Not linked"}</span>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={()=>setModal(false)}>Cancel</button>
              <button className="btn btn-cyan" onClick={confirmBook}>Confirm Booking →</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// PATIENT APPOINTMENTS
// ═══════════════════════════════════════════════════════════════════

function PatientAppointments({ user, appointments, onUpdate }) {
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState(null);
  const myAppts = appointments.filter(a => a.patientId === user.id);
  const filters = [["all","All"],["upcoming","Upcoming"],["confirmed","Confirmed"],["pending","Pending"],["completed","Completed"],["cancelled","Cancelled"]];

  const filtered = useMemo(() => {
    let list = myAppts;
    if (filter === "upcoming") list = list.filter(a => isUpcoming(a.date) && a.status !== "cancelled");
    else if (filter !== "all") list = list.filter(a => a.status === filter);
    return list.sort((a,b) => new Date(b.date)-new Date(a.date));
  }, [myAppts, filter]);

  return (
    <div className="animate-slideUp">
      <div className="page-hd">
        <div className="page-title">My Appointments</div>
        <div className="page-sub">View and manage all your appointments</div>
      </div>

      <div className="filter-bar">
        <div className="filter-tabs">
          {filters.map(([f,l]) => (
            <button key={f} className={`filter-tab ${filter===f?"active":""}`} onClick={()=>setFilter(f)}>
              {l} {f!=="all"&&<span style={{marginLeft:4,opacity:0.7}}>({f==="upcoming"?myAppts.filter(a=>isUpcoming(a.date)&&a.status!=="cancelled").length:myAppts.filter(a=>a.status===f).length})</span>}
            </button>
          ))}
        </div>
      </div>

      <div className="grid-60-40" style={{alignItems:"start"}}>
        <div className="appt-list">
          {filtered.length===0
            ? <Empty icon="📭" title="No appointments" sub="No appointments match this filter." />
            : filtered.map((a,i) => (
              <ApptCard key={a.id} appt={a} view="patient" delay={i*0.04} onClick={()=>setSelected(a)}
                actions={
                  a.status==="pending"
                    ? <button className="btn btn-danger btn-sm" onClick={e=>{e.stopPropagation();onUpdate(a.id,{status:"cancelled"})}}>Cancel</button>
                    : null
                }
              />
            ))
          }
        </div>
        <div>
          {selected ? (
            <ApptDetail appt={selected} onClose={()=>setSelected(null)} view="patient" />
          ) : (
            <div className="card card-pad" style={{textAlign:"center",padding:40}}>
              <div style={{fontSize:40,marginBottom:12}}>📋</div>
              <div style={{fontFamily:"Playfair Display,serif",fontSize:16,color:"var(--text2)",marginBottom:6}}>Appointment Details</div>
              <div style={{fontSize:13,color:"var(--text3)"}}>Click on any appointment to view details, prescription, and notes.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// MEDICAL HISTORY
// ═══════════════════════════════════════════════════════════════════

function MedicalHistory({ user, appointments }) {
  const myAppts = appointments.filter(a => a.patientId === user.id).sort((a,b)=>new Date(b.date)-new Date(a.date));
  const completed = myAppts.filter(a=>a.status==="completed");
  const specData = getSpecialtyData(myAppts);

  return (
    <div className="animate-slideUp">
      <div className="page-hd">
        <div className="page-title">Medical History</div>
        <div className="page-sub">Your complete health journey and records</div>
      </div>

      {user.dob && (
        <div className="card card-pad mb-20">
          <div className="section-title">Health Profile</div>
          <div className="info-grid">
            {[["🩸","Blood Group",user.blood],["⚖️","Weight",`${user.weight} kg`],["📏","Height",`${user.height} cm`],["🎂","Age",`${calcAge(user.dob)} years`],["💊","Insurance",user.insurance||"Not linked"],["📞","Phone",user.phone]].map(([icon,label,val])=>(
              <div key={label} className="info-item">
                <div className="info-item-label">{icon} {label}</div>
                <div className="info-item-val">{val}</div>
              </div>
            ))}
          </div>
          {(user.conditions?.length>0||user.allergies?.length>0) && (
            <>
              <div className="divider" />
              <div className="grid-2">
                {user.conditions?.length>0 && <div>
                  <div className="text-xs text-muted fw-700 mb-8" style={{textTransform:"uppercase",letterSpacing:0.5}}>Conditions</div>
                  <div className="tag-list">{user.conditions.map(c=><span key={c} className="tag tag-yellow">{c}</span>)}</div>
                </div>}
                {user.allergies?.length>0 && <div>
                  <div className="text-xs text-muted fw-700 mb-8" style={{textTransform:"uppercase",letterSpacing:0.5}}>Allergies</div>
                  <div className="tag-list">{user.allergies.map(a=><span key={a} className="tag tag-red">⚠️ {a}</span>)}</div>
                </div>}
              </div>
            </>
          )}
        </div>
      )}

      <div className="grid-60-40">
        <div>
          <div className="section-title">Visit Timeline</div>
          <div className="timeline">
            {myAppts.length===0
              ? <Empty icon="📊" title="No history yet" sub="Your medical visits will appear here." />
              : myAppts.map((a,i) => (
                <div key={a.id} className="tl-item" style={{animationDelay:`${i*0.05}s`}}>
                  <div className={`tl-dot ${a.status}`} />
                  <div className="tl-card">
                    <div className="tl-date">{fmtDate(a.date)} · {fmtTime(a.time)}</div>
                    <div className="tl-title">{a.doctorName}</div>
                    <div className="tl-sub">{a.specialty} · {a.hospital}</div>
                    <div style={{marginTop:8,display:"flex",gap:8,flexWrap:"wrap"}}>
                      <StatusBadge status={a.status} />
                      {a.type && <span className="pill pill-cyan text-xs">{a.type==="Video"?"🎥":"🏥"} {a.type}</span>}
                    </div>
                    {a.prescription && (
                      <div style={{marginTop:10,padding:10,background:"#f0fdf4",borderRadius:8,fontSize:12,color:"var(--success)",borderLeft:"3px solid var(--success)"}}>
                        💊 Prescription available
                      </div>
                    )}
                    {a.notes && <div style={{marginTop:6,fontSize:12,color:"var(--text3)",fontStyle:"italic"}}>📝 {a.notes}</div>}
                  </div>
                </div>
              ))
            }
          </div>
        </div>
        <div>
          <div className="section-title">Visit by Specialty</div>
          {specData.length>0 ? (
            <div className="card card-pad">
              <div style={{height:200}}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={specData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                      {specData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i%PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{borderRadius:8,border:"1px solid var(--border)",fontSize:12}} />
                    <Legend wrapperStyle={{fontSize:11}} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : <Empty icon="📈" title="No data yet" sub="Visit stats will appear here." />}

          {completed.length>0 && (
            <>
              <div className="section-title mt-16">Prescriptions</div>
              {completed.filter(a=>a.prescription).map(a=>(
                <div key={a.id} className="rx-card mb-12">
                  <span className="rx-badge">Rx</span>
                  <div className="rx-header">
                    <div className="rx-symbol">℞</div>
                    <div>
                      <div className="rx-title">{a.doctorName}</div>
                      <div style={{fontSize:11,color:"var(--text3)"}}>{fmtDate(a.date)}</div>
                    </div>
                  </div>
                  <div className="rx-content">{a.prescription}</div>
                  {a.notes&&<div style={{marginTop:8,fontSize:12,color:"var(--text3)"}}>📝 {a.notes}</div>}
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// PATIENT PROFILE
// ═══════════════════════════════════════════════════════════════════

function PatientProfile({ user, appointments }) {
  const myAppts = appointments.filter(a => a.patientId === user.id);
  const [editing, setEditing] = useState(false);

  return (
    <div className="animate-slideUp">
      <div className="page-hd">
        <div className="page-title">My Profile</div>
        <div className="page-sub">Manage your personal and medical information</div>
      </div>
      <div className="profile-header mb-20">
        <div className="profile-ava">{initials(user.name)}</div>
        <div style={{flex:1}}>
          <div className="profile-name">{user.name}</div>
          <div className="profile-role">Patient · ID: {user.id.toUpperCase()}</div>
          <div className="profile-tags">
            {user.blood&&<span className="profile-tag">🩸 {user.blood}</span>}
            {user.insurance&&<span className="profile-tag">🛡️ {user.insurance}</span>}
            {user.dob&&<span className="profile-tag">🎂 {calcAge(user.dob)} yrs</span>}
            <span className="profile-tag">📅 {myAppts.length} Appointments</span>
          </div>
        </div>
        <button className="btn btn-ghost btn-sm" style={{color:"white",borderColor:"rgba(255,255,255,0.3)"}} onClick={()=>setEditing(!editing)}>{editing?"💾 Save":"✏️ Edit"}</button>
      </div>

      <div className="grid-2">
        <div className="card card-pad">
          <div className="section-title">Personal Information</div>
          <div className="info-grid">
            {[["📧","Email",user.email],["📞","Phone",user.phone],["🎂","Date of Birth",fmtDate(user.dob)||"—"],["🩸","Blood Group",user.blood||"—"],["⚖️","Weight",user.weight?`${user.weight} kg`:"—"],["📏","Height",user.height?`${user.height} cm`:"—"]].map(([icon,label,val])=>(
              <div key={label} className="info-item">
                <div className="info-item-label">{icon} {label}</div>
                <div className="info-item-val">{val}</div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="card card-pad mb-16">
            <div className="section-title">Medical Info</div>
            {user.conditions?.length>0&&<><div className="text-xs text-muted fw-700 mb-8" style={{textTransform:"uppercase",letterSpacing:0.5}}>Conditions</div><div className="tag-list mb-12">{user.conditions.map(c=><span key={c} className="tag tag-yellow">{c}</span>)}</div></>}
            {user.allergies?.length>0&&<><div className="text-xs text-muted fw-700 mb-8" style={{textTransform:"uppercase",letterSpacing:0.5}}>Allergies</div><div className="tag-list">{user.allergies.map(a=><span key={a} className="tag tag-red">⚠️ {a}</span>)}</div></>}
            {(!user.conditions?.length&&!user.allergies?.length)&&<div className="text-muted text-sm">No medical conditions or allergies recorded.</div>}
          </div>
          <div className="card card-pad">
            <div className="section-title">Insurance</div>
            {user.insurance
              ? <div style={{background:"linear-gradient(135deg,var(--teal),var(--cyan))",borderRadius:12,padding:16,color:"white"}}>
                  <div style={{fontSize:11,opacity:0.7,marginBottom:4}}>ACTIVE POLICY</div>
                  <div style={{fontFamily:"Playfair Display,serif",fontSize:18}}>{user.insurance}</div>
                  <div style={{fontSize:11,opacity:0.6,marginTop:8}}>✅ Verified · Active</div>
                </div>
              : <div className="text-muted text-sm">No insurance linked.</div>
            }
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// DOCTOR DASHBOARD
// ═══════════════════════════════════════════════════════════════════

function DoctorDashboard({ user, appointments, onUpdate, setPage }) {
  const myAppts = appointments.filter(a => a.doctorId === user.id);
  const todayAppts = myAppts.filter(a => a.date === today());
  const pending = myAppts.filter(a => a.status === "pending");
  const confirmed = myAppts.filter(a => a.status === "confirmed");
  const totalRevenue = myAppts.filter(a=>a.status==="completed").reduce((s,a)=>s+a.fee,0);
  const weeklyData = getWeeklyData(myAppts);
  const [prescModal, setPrescModal] = useState(null);
  const [prescText, setPrescText] = useState("");
  const [notesText, setNotesText] = useState("");

  const handleComplete = (appt) => {
    setPrescModal(appt); setPrescText(""); setNotesText("");
  };

  const savePrescription = () => {
    onUpdate(prescModal.id, { status:"completed", prescription: prescText||null, notes: notesText });
    setPrescModal(null);
  };

  return (
    <div className="animate-slideUp">
      <div className="page-hd">
        <div className="page-hd-top">
          <div>
            <div className="page-title">Doctor Dashboard 🩺</div>
            <div className="page-sub">Welcome back, {user.name}! Here's your practice overview.</div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={()=>setPage("schedule")}>View Schedule →</button>
        </div>
      </div>

      <div className="stats-row">
        <StatCard icon="👥" bg="#dbeafe" label="Total Patients" value={new Set(myAppts.map(a=>a.patientId)).size} trend="Unique patients" trendType="neutral" />
        <StatCard icon="📅" bg="#fef3c7" label="Today" value={todayAppts.length} trend={`${todayAppts.filter(a=>a.status==="confirmed").length} confirmed`} trendType="up" />
        <StatCard icon="⏳" bg="#fee2e2" label="Pending" value={pending.length} trend="Need review" trendType="down" />
        <StatCard icon="💰" bg="#d1fae5" label="Revenue" value={`₹${(totalRevenue/1000).toFixed(1)}k`} trend="From completed" trendType="up" />
      </div>

      {/* Next appointment banner */}
      {(() => {
        const next = todayAppts.filter(a=>a.status==="confirmed").sort((a,b)=>a.time.localeCompare(b.time))[0];
        return next ? (
          <div className="banner banner-teal mb-20">
            <div className="flex items-center justify-between" style={{position:"relative",zIndex:1}}>
              <div>
                <div style={{fontSize:11,color:"rgba(255,255,255,0.7)",textTransform:"uppercase",letterSpacing:2,marginBottom:8}}>Next Patient Today</div>
                <div style={{fontFamily:"Playfair Display,serif",fontSize:22,color:"white",marginBottom:4}}>{next.patientName}</div>
                <div style={{fontSize:13,color:"rgba(255,255,255,0.8)"}}>{next.type==="Video"?"🎥 Video Call":"🏥 In-Person"} · {fmtTime(next.time)} · {next.reason}</div>
              </div>
              <div style={{display:"flex",gap:8}}>
                {next.type==="Video"&&<button className="btn btn-sm" style={{background:"rgba(255,255,255,0.2)",color:"white",border:"1px solid rgba(255,255,255,0.3)"}}>🎥 Join Call</button>}
                <button className="btn btn-sm" style={{background:"rgba(255,255,255,0.2)",color:"white",border:"1px solid rgba(255,255,255,0.3)"}} onClick={()=>handleComplete(next)}>✓ Complete</button>
              </div>
            </div>
          </div>
        ) : null;
      })()}

      <div className="grid-2 mb-20">
        {/* Pending approvals */}
        <div>
          <div className="section-title">Pending Approvals <span style={{fontSize:12,fontWeight:400,color:"var(--text3)"}}>{pending.length} requests</span></div>
          <div className="appt-list">
            {pending.length===0
              ? <Empty icon="🎉" title="All clear!" sub="No pending approvals." />
              : pending.slice(0,4).map((a,i)=>(
                <div key={a.id} className="appt-card" style={{animationDelay:`${i*0.05}s`}}>
                  <div className="appt-date-box">
                    <div className="appt-date-day">{new Date(a.date).getDate()}</div>
                    <div className="appt-date-mon">{MONTHS[new Date(a.date).getMonth()]}</div>
                  </div>
                  <div className="appt-info">
                    <div className="appt-name">{a.patientName}</div>
                    <div className="appt-meta">
                      <span className="appt-meta-tag">🕐 {fmtTime(a.time)}</span>
                      <span className="appt-meta-tag">{a.type==="Video"?"🎥":"🏥"} {a.type}</span>
                    </div>
                    <div style={{fontSize:12,color:"var(--text3)",marginTop:4,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{a.reason}</div>
                  </div>
                  <div className="flex" style={{gap:6,flexShrink:0,flexDirection:"column",alignItems:"flex-end"}}>
                    <button className="btn btn-success btn-sm" onClick={()=>onUpdate(a.id,{status:"confirmed"})}>✓ Confirm</button>
                    <button className="btn btn-danger btn-sm" onClick={()=>onUpdate(a.id,{status:"cancelled"})}>✗ Cancel</button>
                  </div>
                </div>
              ))
            }
          </div>
        </div>

        {/* Today's Queue */}
        <div>
          <div className="section-title">Today's Queue <span style={{fontSize:12,fontWeight:400,color:"var(--text3)"}}>{todayAppts.length} appointments</span></div>
          <div className="appt-list">
            {todayAppts.length===0
              ? <Empty icon="😌" title="Free today!" sub="No appointments scheduled." />
              : todayAppts.sort((a,b)=>a.time.localeCompare(b.time)).map((a,i)=>(
                <div key={a.id} className="appt-card" style={{animationDelay:`${i*0.05}s`}}>
                  <div style={{width:8,height:8,borderRadius:"50%",background:STATUS_CONFIG[a.status]?.color||"var(--text4)",flexShrink:0,marginTop:4}} />
                  <div className="appt-info">
                    <div className="appt-name">{a.patientName}</div>
                    <div className="appt-meta">
                      <span className="appt-meta-tag">🕐 {fmtTime(a.time)}</span>
                      <span className="appt-meta-tag">{a.type==="Video"?"🎥":"🏥"} {a.type}</span>
                    </div>
                  </div>
                  <div className="flex" style={{gap:6,alignItems:"center"}}>
                    <StatusBadge status={a.status} />
                    {a.status==="confirmed"&&<button className="btn btn-purple btn-sm" onClick={()=>handleComplete(a)}>Complete</button>}
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="card">
        <div className="card-header">
          <div><div className="card-title">Weekly Revenue & Appointments</div><div className="card-sub">Last 7 days performance</div></div>
        </div>
        <div className="card-pad">
          <div className="chart-wrap-lg">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyData} margin={{top:10,right:10,left:0,bottom:0}}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0f3460" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#0f3460" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="appt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00b4d8" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#00b4d8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="day" tick={{fontSize:11,fill:"#8fa8c2"}} axisLine={false} tickLine={false} />
                <YAxis yAxisId="left" tick={{fontSize:11,fill:"#8fa8c2"}} axisLine={false} tickLine={false} />
                <YAxis yAxisId="right" orientation="right" tick={{fontSize:11,fill:"#8fa8c2"}} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{borderRadius:8,border:"1px solid var(--border)",fontSize:12}} />
                <Legend wrapperStyle={{fontSize:11}} />
                <Area yAxisId="left" type="monotone" dataKey="revenue" stroke="#0f3460" fill="url(#rev)" strokeWidth={2} name="Revenue (₹)" />
                <Area yAxisId="right" type="monotone" dataKey="appointments" stroke="#00b4d8" fill="url(#appt)" strokeWidth={2} name="Appointments" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Prescription Modal */}
      {prescModal && (
        <div className="modal-bg">
          <div className="modal">
            <div className="modal-hd">
              <div><div className="modal-title">Complete Appointment</div><div className="modal-sub">{prescModal.patientName} · {fmtDate(prescModal.date)}</div></div>
              <button className="modal-close" onClick={()=>setPrescModal(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="field">
                <label className="field-label">Prescription <span style={{color:"var(--text4)",fontWeight:400,fontSize:10,textTransform:"none"}}>(optional)</span></label>
                <textarea className="field-input" rows={5} placeholder="e.g. Tab. Amoxicillin 500mg TDS x 5 days&#10;Tab. Paracetamol 500mg SOS&#10;Syp. Benadryl 10ml BD" value={prescText} onChange={e=>setPrescText(e.target.value)} style={{fontFamily:"monospace"}} />
              </div>
              <div className="field">
                <label className="field-label">Doctor's Notes</label>
                <textarea className="field-input" rows={3} placeholder="Follow-up instructions, advice, next visit..." value={notesText} onChange={e=>setNotesText(e.target.value)} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={()=>setPrescModal(null)}>Cancel</button>
              <button className="btn btn-success" onClick={savePrescription}>✓ Mark Complete & Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// DOCTOR SCHEDULE
// ═══════════════════════════════════════════════════════════════════

function DoctorSchedule({ user, appointments, onUpdate }) {
  const myAppts = appointments.filter(a => a.doctorId === user.id && a.status !== "cancelled");
  const doctor = DOCTORS_DB.find(d => d.id === user.id);
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [prescText, setPrescText] = useState("");
  const [notesText, setNotesText] = useState("");

  const weekDays = useMemo(() => {
    return Array.from({length:7},(_,i)=>{ const d=new Date(); d.setDate(d.getDate()+i); return d.toISOString().split("T")[0]; });
  },[]);

  const bookedMap = useMemo(() => {
    const m = {};
    myAppts.forEach(a => { if(!m[a.date]) m[a.date]={}; m[a.date][a.time]=a; });
    return m;
  },[myAppts]);

  const upcoming = myAppts.filter(a=>isUpcoming(a.date)).sort((a,b)=>new Date(a.date)-new Date(b.date));

  return (
    <div className="animate-slideUp">
      <div className="page-hd">
        <div className="page-title">My Schedule 🗓️</div>
        <div className="page-sub">7-day appointment calendar and upcoming sessions</div>
      </div>

      <div className="card mb-20">
        <div className="card-header">
          <div><div className="card-title">Weekly Calendar</div><div className="card-sub">Green = Available · Yellow = Booked</div></div>
        </div>
        <div className="card-pad">
          <div className="cal-grid">
            {weekDays.map((day, i) => {
              const dayBooked = bookedMap[day] || {};
              const isToday = day === today();
              return (
                <div key={day} className="cal-day">
                  <div className={`cal-day-hd ${isToday?"cal-day-today":""}`}>
                    <div className="cal-day-name">{DAYS[new Date(day).getDay()]}</div>
                    <div className="cal-day-num">{new Date(day).getDate()}</div>
                  </div>
                  <div style={{padding:6}}>
                    {(doctor?.slots||[]).map(slot => {
                      const appt = dayBooked[slot];
                      return (
                        <div key={slot}
                          className={`cal-slot ${appt?"taken":"free"}`}
                          style={{cursor:appt?"pointer":"default"}}
                          onClick={()=>appt&&setSelectedAppt(appt)}
                          title={appt?`${appt.patientName} - ${appt.reason}`:"Available"}>
                          {slot}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="section-title">Upcoming Appointments <span style={{fontSize:12,fontWeight:400,color:"var(--text3)"}}>{upcoming.length} total</span></div>
      <div className="table-wrap">
        <table className="tbl">
          <thead><tr><th>Patient</th><th>Date & Time</th><th>Type</th><th>Reason</th><th>Fee</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {upcoming.length===0
              ? <tr><td colSpan={7} style={{textAlign:"center",padding:32,color:"var(--text4)"}}>No upcoming appointments</td></tr>
              : upcoming.map(a=>(
                <tr key={a.id}>
                  <td><div className="tbl-name"><div className="tbl-ava">{initials(a.patientName)}</div>{a.patientName}</div></td>
                  <td>{fmtDate(a.date)}<br/><span style={{fontSize:11,color:"var(--text3)"}}>{fmtTime(a.time)}</span></td>
                  <td><span className={`pill ${a.type==="Video"?"pill-cyan":"pill-navy"}`}>{a.type==="Video"?"🎥":"🏥"} {a.type}</span></td>
                  <td style={{maxWidth:160,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{a.reason}</td>
                  <td style={{fontFamily:"Playfair Display,serif",fontWeight:700}}>₹{a.fee}</td>
                  <td><StatusBadge status={a.status} /></td>
                  <td>
                    <div style={{display:"flex",gap:6}}>
                      {a.status==="pending"&&<><button className="btn btn-success btn-xs" onClick={()=>onUpdate(a.id,{status:"confirmed"})}>✓</button><button className="btn btn-danger btn-xs" onClick={()=>onUpdate(a.id,{status:"cancelled"})}>✗</button></>}
                      {a.status==="confirmed"&&<button className="btn btn-purple btn-xs" onClick={()=>{setSelectedAppt(a);setPrescText("");setNotesText("")}}>Complete</button>}
                    </div>
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>

      {selectedAppt && (
        <div className="modal-bg">
          <div className="modal">
            <div className="modal-hd">
              <div><div className="modal-title">{selectedAppt.status==="confirmed"?"Complete Appointment":"Appointment Details"}</div><div className="modal-sub">{selectedAppt.patientName}</div></div>
              <button className="modal-close" onClick={()=>setSelectedAppt(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="modal-info-row"><span className="modal-info-label">Date & Time</span><span className="modal-info-val">{fmtDate(selectedAppt.date)} at {fmtTime(selectedAppt.time)}</span></div>
              <div className="modal-info-row"><span className="modal-info-label">Type</span><span className="modal-info-val">{selectedAppt.type}</span></div>
              <div className="modal-info-row"><span className="modal-info-label">Reason</span><span className="modal-info-val">{selectedAppt.reason}</span></div>
              <div className="modal-info-row"><span className="modal-info-label">Status</span><span className="modal-info-val"><StatusBadge status={selectedAppt.status}/></span></div>
              {selectedAppt.status==="confirmed"&&<>
                <div className="divider"/>
                <div className="field"><label className="field-label">Prescription</label><textarea className="field-input" rows={4} placeholder="Medications, dosage..." value={prescText} onChange={e=>setPrescText(e.target.value)} style={{fontFamily:"monospace"}}/></div>
                <div className="field"><label className="field-label">Notes</label><textarea className="field-input" rows={2} placeholder="Follow-up instructions..." value={notesText} onChange={e=>setNotesText(e.target.value)}/></div>
              </>}
              {selectedAppt.status==="completed"&&selectedAppt.prescription&&<><div className="divider"/><div className="rx-card"><span className="rx-badge">Rx</span><div className="rx-header"><div className="rx-symbol">℞</div><div><div className="rx-title">Prescription</div></div></div><div className="rx-content">{selectedAppt.prescription}</div></div></>}
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={()=>setSelectedAppt(null)}>Close</button>
              {selectedAppt.status==="confirmed"&&<button className="btn btn-success" onClick={()=>{onUpdate(selectedAppt.id,{status:"completed",prescription:prescText||null,notes:notesText});setSelectedAppt(null);}}>✓ Complete</button>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// DOCTOR PATIENTS
// ═══════════════════════════════════════════════════════════════════

function DoctorPatients({ user, appointments, onUpdate }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState(null);
  const myAppts = appointments.filter(a => a.doctorId === user.id);

  const filtered = useMemo(() => {
    let list = myAppts;
    if (filter !== "all") list = list.filter(a => a.status === filter);
    if (search) list = list.filter(a => a.patientName.toLowerCase().includes(search.toLowerCase()) || a.reason.toLowerCase().includes(search.toLowerCase()));
    return list.sort((a,b) => new Date(b.date)-new Date(a.date));
  },[myAppts,filter,search]);

  return (
    <div className="animate-slideUp">
      <div className="page-hd">
        <div className="page-title">All Patients 👥</div>
        <div className="page-sub">Review and manage all patient appointments</div>
      </div>
      <div className="filter-bar">
        <div className="filter-input-wrap">
          <span className="filter-icon">🔍</span>
          <input className="filter-input" placeholder="Search patients, reasons..." value={search} onChange={e=>setSearch(e.target.value)} />
        </div>
        <div className="filter-tabs">
          {[["all","All"],["pending","Pending"],["confirmed","Confirmed"],["completed","Completed"],["cancelled","Cancelled"]].map(([f,l])=>(
            <button key={f} className={`filter-tab ${filter===f?"active":""}`} onClick={()=>setFilter(f)}>{l}</button>
          ))}
        </div>
      </div>
      <div className="grid-60-40" style={{alignItems:"start"}}>
        <div className="appt-list">
          {filtered.length===0
            ? <Empty icon="👥" title="No patients found" sub="Try a different filter." />
            : filtered.map((a,i)=>(
              <div key={a.id} className="appt-card" style={{animationDelay:`${i*0.04}s`,cursor:"pointer"}} onClick={()=>setSelected(a)}>
                <div className="appt-date-box">
                  <div className="appt-date-day">{new Date(a.date).getDate()}</div>
                  <div className="appt-date-mon">{MONTHS[new Date(a.date).getMonth()]}</div>
                </div>
                <div className="appt-info">
                  <div className="appt-name">{a.patientName}</div>
                  <div className="appt-meta">
                    <span className="appt-meta-tag">🕐 {fmtTime(a.time)}</span>
                    <span className="appt-meta-tag">{a.type==="Video"?"🎥":"🏥"} {a.type}</span>
                    <span className="appt-meta-tag">💰 ₹{a.fee}</span>
                  </div>
                  <div style={{fontSize:12,color:"var(--text3)",marginTop:3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{a.reason}</div>
                </div>
                <div className="flex" style={{gap:6,flexDirection:"column",alignItems:"flex-end"}}>
                  <StatusBadge status={a.status} />
                  {a.status==="pending"&&<div className="flex" style={{gap:4}}>
                    <button className="btn btn-success btn-xs" onClick={e=>{e.stopPropagation();onUpdate(a.id,{status:"confirmed"})}}>✓</button>
                    <button className="btn btn-danger btn-xs" onClick={e=>{e.stopPropagation();onUpdate(a.id,{status:"cancelled"})}}>✗</button>
                  </div>}
                </div>
              </div>
            ))
          }
        </div>
        <div>
          {selected
            ? <ApptDetail appt={selected} onClose={()=>setSelected(null)} view="doctor" onUpdate={onUpdate} />
            : <div className="card card-pad" style={{textAlign:"center",padding:40}}><div style={{fontSize:40,marginBottom:12}}>👥</div><div style={{fontFamily:"Playfair Display,serif",fontSize:16,color:"var(--text2)",marginBottom:6}}>Patient Details</div><div style={{fontSize:13,color:"var(--text3)"}}>Click on a patient to view their appointment details.</div></div>
          }
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// DOCTOR ANALYTICS
// ═══════════════════════════════════════════════════════════════════

function DoctorAnalytics({ user, appointments }) {
  const myAppts = appointments.filter(a => a.doctorId === user.id);
  const monthlyData = getMonthlyData(myAppts);
  const specData = getSpecialtyData(myAppts);
  const typeData = [{ name:"In-Person", value: myAppts.filter(a=>a.type==="In-Person").length },{ name:"Video", value: myAppts.filter(a=>a.type==="Video").length }];
  const statusData = ["confirmed","pending","completed","cancelled"].map(s=>({ name:s.charAt(0).toUpperCase()+s.slice(1), value:myAppts.filter(a=>a.status===s).length })).filter(d=>d.value>0);
  const totalRevenue = myAppts.filter(a=>a.status==="completed").reduce((s,a)=>s+a.fee,0);
  const avgFee = myAppts.length ? Math.round(myAppts.reduce((s,a)=>s+a.fee,0)/myAppts.length) : 0;

  return (
    <div className="animate-slideUp">
      <div className="page-hd">
        <div className="page-title">Analytics 📈</div>
        <div className="page-sub">Detailed performance metrics for your practice</div>
      </div>

      <div className="stats-row">
        <StatCard icon="📅" bg="#dbeafe" label="Total Appointments" value={myAppts.length} trend="All time" trendType="neutral" />
        <StatCard icon="✅" bg="#d1fae5" label="Completion Rate" value={`${myAppts.length?Math.round(myAppts.filter(a=>a.status==="completed").length/myAppts.length*100):0}%`} trend="Completed" trendType="up" />
        <StatCard icon="💰" bg="#fef3c7" label="Total Revenue" value={`₹${(totalRevenue/1000).toFixed(1)}k`} trend="Completed visits" trendType="up" />
        <StatCard icon="💊" bg="#ede9fe" label="Avg. Fee" value={`₹${avgFee}`} trend="Per consultation" trendType="neutral" />
      </div>

      <div className="grid-2 mb-20">
        <div className="card">
          <div className="card-header"><div className="card-title">Monthly Trends</div></div>
          <div className="card-pad">
            <div className="chart-wrap-lg">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="month" tick={{fontSize:11,fill:"#8fa8c2"}} axisLine={false} tickLine={false} />
                  <YAxis tick={{fontSize:11,fill:"#8fa8c2"}} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{borderRadius:8,border:"1px solid var(--border)",fontSize:12}} />
                  <Legend wrapperStyle={{fontSize:11}} />
                  <Line type="monotone" dataKey="appointments" stroke="#0f3460" strokeWidth={2.5} dot={{r:4,fill:"#0f3460"}} name="Appointments" />
                  <Line type="monotone" dataKey="patients" stroke="#00b4d8" strokeWidth={2.5} dot={{r:4,fill:"#00b4d8"}} name="New Patients" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-header"><div className="card-title">Appointment Status</div></div>
          <div className="card-pad">
            <div style={{height:200}}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" outerRadius={80} paddingAngle={4} dataKey="value" label={({name,percent})=>`${name} ${(percent*100).toFixed(0)}%`} labelLine={false} fontSize={10}>
                    {statusData.map((e,i)=><Cell key={i} fill={Object.values(STATUS_CONFIG).map(c=>c.color)[i%4]} />)}
                  </Pie>
                  <Tooltip contentStyle={{borderRadius:8,border:"1px solid var(--border)",fontSize:12}} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header"><div className="card-title">Consultation Types</div></div>
          <div className="card-pad">
            {typeData.map((t,i)=>(
              <div key={t.name} className="mb-16">
                <div className="flex justify-between mb-8"><span style={{fontSize:13,fontWeight:600}}>{t.name==="Video"?"🎥":"🏥"} {t.name}</span><span style={{fontSize:13,color:"var(--text3)"}}>{t.value} ({myAppts.length?Math.round(t.value/myAppts.length*100):0}%)</span></div>
                <div className="progress-bar"><div className="progress-fill" style={{width:`${myAppts.length?t.value/myAppts.length*100:0}%`,background:i===0?"var(--navy2)":"var(--cyan)"}}/></div>
              </div>
            ))}
            <div className="divider"/>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:13}}>
              <span style={{color:"var(--text3)"}}>Rating</span>
              <div style={{display:"flex",alignItems:"center",gap:6}}>
                <StarDisplay rating={DOCTORS_DB.find(d=>d.id===user.id)?.rating||5} />
                <span style={{fontWeight:700}}>{DOCTORS_DB.find(d=>d.id===user.id)?.rating}</span>
                <span style={{color:"var(--text4)"}}>({DOCTORS_DB.find(d=>d.id===user.id)?.reviews} reviews)</span>
              </div>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-header"><div className="card-title">Revenue Breakdown</div></div>
          <div className="card-pad">
            {["confirmed","completed","pending","cancelled"].map(s=>{
              const rev = myAppts.filter(a=>a.status===s).reduce((sum,a)=>sum+a.fee,0);
              const count = myAppts.filter(a=>a.status===s).length;
              const cfg = STATUS_CONFIG[s];
              return (
                <div key={s} className="modal-info-row">
                  <span className="modal-info-label"><StatusBadge status={s}/></span>
                  <span className="modal-info-val">{count} appts · <span style={{color:cfg.color}}>₹{rev.toLocaleString()}</span></span>
                </div>
              );
            })}
            <div className="divider"/>
            <div className="modal-info-row" style={{fontWeight:700}}>
              <span style={{fontSize:13}}>Total Revenue</span>
              <span style={{fontFamily:"Playfair Display,serif",fontSize:18,color:"var(--navy2)"}}>₹{totalRevenue.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// DOCTOR PROFILE
// ═══════════════════════════════════════════════════════════════════

function DoctorProfile({ user, appointments }) {
  const doc = DOCTORS_DB.find(d => d.id === user.id);
  const myAppts = appointments.filter(a => a.doctorId === user.id);
  if (!doc) return null;

  return (
    <div className="animate-slideUp">
      <div className="page-hd"><div className="page-title">My Profile</div><div className="page-sub">Manage your professional information</div></div>
      <div className="profile-header mb-20">
        <div className="profile-ava">{doc.avatar}</div>
        <div style={{flex:1}}>
          <div className="profile-name">{doc.name}</div>
          <div className="profile-role">{doc.specialty} · {doc.hospital}</div>
          <div className="profile-tags">
            <span className="profile-tag">⭐ {doc.rating} ({doc.reviews} reviews)</span>
            <span className="profile-tag">🎓 {doc.experience} yrs exp</span>
            <span className="profile-tag">💰 ₹{doc.fee}/visit</span>
            <span className="profile-tag">👥 {new Set(myAppts.map(a=>a.patientId)).size} patients</span>
          </div>
        </div>
      </div>
      <div className="grid-2">
        <div>
          <div className="card card-pad mb-16">
            <div className="section-title">Professional Info</div>
            <div className="info-grid">
              {[["🎓","Qualification",doc.qualification],["🏥","Hospital",doc.hospital],["🩺","Specialty",doc.specialty],["⏱️","Experience",`${doc.experience} years`]].map(([icon,label,val])=>(
                <div key={label} className="info-item"><div className="info-item-label">{icon} {label}</div><div className="info-item-val">{val}</div></div>
              ))}
            </div>
          </div>
          <div className="card card-pad">
            <div className="section-title">About</div>
            <p style={{fontSize:13,color:"var(--text2)",lineHeight:1.7}}>{doc.about}</p>
            <div className="divider"/>
            <div style={{fontSize:12,fontWeight:700,color:"var(--text4)",textTransform:"uppercase",letterSpacing:0.5,marginBottom:8}}>Languages</div>
            <div className="tag-list">{doc.languages.map(l=><span key={l} className="tag">{l}</span>)}</div>
            <div className="divider"/>
            <div style={{fontSize:12,fontWeight:700,color:"var(--text4)",textTransform:"uppercase",letterSpacing:0.5,marginBottom:8}}>Available Days</div>
            <div className="tag-list">{doc.availability.map(d=><span key={d} className="tag pill-cyan">{d}</span>)}</div>
            <div className="divider"/>
            <div style={{fontSize:12,fontWeight:700,color:"var(--text4)",textTransform:"uppercase",letterSpacing:0.5,marginBottom:8}}>Consultation Types</div>
            <div className="tag-list">{doc.consultType.map(t=><span key={t} className="tag pill-navy">{t==="Video"?"🎥":"🏥"} {t}</span>)}</div>
          </div>
        </div>
        <div>
          <div className="card card-pad mb-16">
            <div className="section-title">Performance</div>
            <div style={{textAlign:"center",padding:"16px 0"}}>
              <div style={{fontFamily:"Playfair Display,serif",fontSize:52,color:"var(--navy2)"}}>{doc.rating}</div>
              <StarDisplay rating={doc.rating} size={20} />
              <div style={{fontSize:13,color:"var(--text3)",marginTop:6}}>{doc.reviews} patient reviews</div>
            </div>
            <div className="divider"/>
            {[5,4,3,2,1].map(star=>(
              <div key={star} className="flex items-center gap-8 mb-8" style={{gap:8}}>
                <span style={{fontSize:11,color:"var(--text3)",width:20}}>{star}★</span>
                <div className="progress-bar" style={{flex:1}}><div className="progress-fill" style={{width:`${star===5?70:star===4?20:star===3?7:3}%`}}/></div>
                <span style={{fontSize:11,color:"var(--text3)",width:30}}>{star===5?70:star===4?20:star===3?7:3}%</span>
              </div>
            ))}
          </div>
          <div className="card card-pad">
            <div className="section-title">Time Slots</div>
            <div className="slot-grid">{doc.slots.map(s=><div key={s} className="time-slot" style={{cursor:"default"}}>{fmtTime(s)}</div>)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// ADMIN PAGES
// ═══════════════════════════════════════════════════════════════════

function AdminDashboard({ appointments }) {
  const totalRevenue = appointments.filter(a=>a.status==="completed").reduce((s,a)=>s+a.fee,0);
  const weeklyData = getWeeklyData(appointments);

  return (
    <div className="animate-slideUp">
      <div className="page-hd"><div className="page-title">System Overview ⚙️</div><div className="page-sub">Platform-wide analytics and management</div></div>
      <div className="stats-row">
        <StatCard icon="🩺" bg="#dbeafe" label="Total Doctors" value={DOCTORS_DB.length} trend="Active" trendType="up" />
        <StatCard icon="👥" bg="#d1fae5" label="Total Patients" value={PATIENTS_DB.length} trend="Registered" trendType="up" />
        <StatCard icon="📅" bg="#fef3c7" label="Total Appointments" value={appointments.length} trend="All time" trendType="neutral" />
        <StatCard icon="💰" bg="#ede9fe" label="Platform Revenue" value={`₹${(totalRevenue/1000).toFixed(1)}k`} trend="Completed" trendType="up" />
      </div>
      <div className="grid-2 mb-20">
        <div className="card">
          <div className="card-header"><div className="card-title">Weekly Appointments</div></div>
          <div className="card-pad">
            <div className="chart-wrap-lg">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData} barSize={24}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="day" tick={{fontSize:11,fill:"#8fa8c2"}} axisLine={false} tickLine={false} />
                  <YAxis tick={{fontSize:11,fill:"#8fa8c2"}} axisLine={false} tickLine={false} allowDecimals={false}/>
                  <Tooltip contentStyle={{borderRadius:8,border:"1px solid var(--border)",fontSize:12}} />
                  <Bar dataKey="appointments" fill="#0f3460" radius={[4,4,0,0]} name="Appointments" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-header"><div className="card-title">Status Distribution</div></div>
          <div className="card-pad">
            <div style={{height:220}}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={getSpecialtyData(appointments)} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                    {getSpecialtyData(appointments).map((_,i)=><Cell key={i} fill={PIE_COLORS[i%PIE_COLORS.length]}/>)}
                  </Pie>
                  <Tooltip contentStyle={{borderRadius:8,border:"1px solid var(--border)",fontSize:12}}/>
                  <Legend wrapperStyle={{fontSize:10}}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
      <div className="section-title">Recent Appointments</div>
      <div className="table-wrap">
        <table className="tbl">
          <thead><tr><th>Patient</th><th>Doctor</th><th>Specialty</th><th>Date</th><th>Type</th><th>Fee</th><th>Status</th></tr></thead>
          <tbody>
            {appointments.slice(0,10).map(a=>(
              <tr key={a.id}>
                <td><div className="tbl-name"><div className="tbl-ava">{initials(a.patientName)}</div>{a.patientName}</div></td>
                <td>{a.doctorName}</td>
                <td><span className="pill pill-navy">{a.specialty}</span></td>
                <td>{fmtDate(a.date)}<br/><span style={{fontSize:11,color:"var(--text3)"}}>{fmtTime(a.time)}</span></td>
                <td><span className={`pill ${a.type==="Video"?"pill-cyan":"pill-navy"}`}>{a.type}</span></td>
                <td style={{fontWeight:700}}>₹{a.fee}</td>
                <td><StatusBadge status={a.status}/></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AdminDoctors() {
  return (
    <div className="animate-slideUp">
      <div className="page-hd"><div className="page-title">Manage Doctors 🩺</div></div>
      <div className="table-wrap">
        <table className="tbl">
          <thead><tr><th>Doctor</th><th>Specialty</th><th>Hospital</th><th>Experience</th><th>Rating</th><th>Fee</th><th>Status</th></tr></thead>
          <tbody>
            {DOCTORS_DB.map(d=>(
              <tr key={d.id}>
                <td><div className="tbl-name"><div className="tbl-ava">{d.avatar}</div><div><div>{d.name}</div><div style={{fontSize:11,color:"var(--text3)"}}>{d.email}</div></div></div></td>
                <td><span className="pill pill-cyan">{d.specialty}</span></td>
                <td>{d.hospital}</td>
                <td>{d.experience} yrs</td>
                <td><StarDisplay rating={d.rating} size={12}/> <span style={{fontSize:12,fontWeight:700}}>{d.rating}</span></td>
                <td style={{fontWeight:700}}>₹{d.fee}</td>
                <td><span className="pill pill-green">Active</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AdminPatients({ appointments }) {
  return (
    <div className="animate-slideUp">
      <div className="page-hd"><div className="page-title">Manage Patients 👥</div></div>
      <div className="table-wrap">
        <table className="tbl">
          <thead><tr><th>Patient</th><th>Blood</th><th>Insurance</th><th>Conditions</th><th>Total Visits</th><th>Last Visit</th></tr></thead>
          <tbody>
            {PATIENTS_DB.map(p=>{
              const pAppts=appointments.filter(a=>a.patientId===p.id);
              const last=pAppts.sort((a,b)=>new Date(b.date)-new Date(a.date))[0];
              return (
                <tr key={p.id}>
                  <td><div className="tbl-name"><div className="tbl-ava">{p.avatar}</div><div><div>{p.name}</div><div style={{fontSize:11,color:"var(--text3)"}}>{p.email}</div></div></div></td>
                  <td><span className="pill pill-red">{p.blood||"—"}</span></td>
                  <td>{p.insurance||"—"}</td>
                  <td>{p.conditions?.length>0?p.conditions.map(c=><span key={c} className="pill pill-yellow" style={{marginRight:4}}>{c}</span>):"None"}</td>
                  <td style={{textAlign:"center",fontWeight:700}}>{pAppts.length}</td>
                  <td>{last?fmtDate(last.date):"—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AdminAnalytics({ appointments }) {
  const monthly = getMonthlyData(appointments);
  const specData = getSpecialtyData(appointments);
  const totalRevenue = appointments.filter(a=>a.status==="completed").reduce((s,a)=>s+a.fee,0);

  return (
    <div className="animate-slideUp">
      <div className="page-hd"><div className="page-title">Platform Analytics 📊</div></div>
      <div className="stats-row">
        <StatCard icon="💰" bg="#d1fae5" label="Gross Revenue" value={`₹${(totalRevenue/1000).toFixed(1)}k`} trend="Completed visits" trendType="up" />
        <StatCard icon="📈" bg="#dbeafe" label="Completion Rate" value={`${appointments.length?Math.round(appointments.filter(a=>a.status==="completed").length/appointments.length*100):0}%`} trend="Of all appointments" trendType="up" />
        <StatCard icon="🎥" bg="#fef3c7" label="Video Consults" value={appointments.filter(a=>a.type==="Video").length} trend="Online" trendType="neutral" />
        <StatCard icon="🏥" bg="#ede9fe" label="In-Person" value={appointments.filter(a=>a.type==="In-Person").length} trend="Walk-in" trendType="neutral" />
      </div>
      <div className="grid-2">
        <div className="card">
          <div className="card-header"><div className="card-title">Monthly Growth</div></div>
          <div className="card-pad">
            <div className="chart-wrap-lg">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthly}>
                  <defs>
                    <linearGradient id="ga" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#0f3460" stopOpacity={0.3}/><stop offset="95%" stopColor="#0f3460" stopOpacity={0}/></linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false}/>
                  <XAxis dataKey="month" tick={{fontSize:11,fill:"#8fa8c2"}} axisLine={false} tickLine={false}/>
                  <YAxis tick={{fontSize:11,fill:"#8fa8c2"}} axisLine={false} tickLine={false}/>
                  <Tooltip contentStyle={{borderRadius:8,border:"1px solid var(--border)",fontSize:12}}/>
                  <Legend wrapperStyle={{fontSize:11}}/>
                  <Area type="monotone" dataKey="appointments" stroke="#0f3460" fill="url(#ga)" strokeWidth={2.5} name="Appointments"/>
                  <Area type="monotone" dataKey="patients" stroke="#00b4d8" fill="none" strokeWidth={2} strokeDasharray="6 3" name="New Patients"/>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-header"><div className="card-title">Specialty Distribution</div></div>
          <div className="card-pad">
            <div style={{height:230}}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={specData} cx="50%" cy="50%" outerRadius={90} paddingAngle={3} dataKey="value">
                    {specData.map((_,i)=><Cell key={i} fill={PIE_COLORS[i%PIE_COLORS.length]}/>)}
                  </Pie>
                  <Tooltip contentStyle={{borderRadius:8,border:"1px solid var(--border)",fontSize:12}}/>
                  <Legend wrapperStyle={{fontSize:10}}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// SHARED COMPONENTS
// ═══════════════════════════════════════════════════════════════════

function StatCard({ icon, bg, label, value, trend, trendType }) {
  return (
    <div className="stat-card">
      <div>
        <div className="stat-label">{label}</div>
        <div className="stat-value">{value}</div>
        <div className={`stat-trend ${trendType}`}>{trendType==="up"?"↑ ":trendType==="down"?"↓ ":""}{trend}</div>
      </div>
      <div className="stat-icon" style={{background:bg}}>{icon}</div>
    </div>
  );
}

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || { bg:"#f3f4f6", color:"#374151", icon:"•", label:status };
  return (
    <span className="status-badge" style={{background:cfg.bg,color:cfg.color}}>
      {cfg.icon} {cfg.label}
    </span>
  );
}

function StarDisplay({ rating, size=12 }) {
  return (
    <div className="star-display">
      {[1,2,3,4,5].map(i=>(
        <span key={i} className={`star ${i<=Math.round(rating)?"filled":"empty"}`} style={{fontSize:size}}>★</span>
      ))}
    </div>
  );
}

function HealthCard({ icon, label, value, unit }) {
  return (
    <div className="health-card">
      <div className="health-icon">{icon}</div>
      <div className="health-label">{label}</div>
      <div className="health-value">{value}<span className="health-unit"> {unit}</span></div>
    </div>
  );
}

function Empty({ icon, title, sub }) {
  return (
    <div className="empty">
      <div className="empty-icon">{icon}</div>
      <div className="empty-title">{title}</div>
      <div className="empty-sub">{sub}</div>
    </div>
  );
}

function ApptCard({ appt, view, delay=0, onClick, actions }) {
  const d = new Date(appt.date);
  return (
    <div className="appt-card" style={{animationDelay:`${delay}s`,cursor:onClick?"pointer":"default"}} onClick={onClick}>
      <div className="appt-date-box">
        <div className="appt-date-day">{d.getDate()}</div>
        <div className="appt-date-mon">{MONTHS[d.getMonth()]}</div>
      </div>
      <div className="appt-info">
        <div className="appt-name">{view==="patient"?appt.doctorName:appt.patientName}</div>
        <div className="appt-meta">
          {view==="patient"&&<span className="appt-meta-tag">🩺 {appt.specialty}</span>}
          <span className="appt-meta-tag">🕐 {fmtTime(appt.time)}</span>
          <span className="appt-meta-tag">{appt.type==="Video"?"🎥":"🏥"} {appt.type}</span>
        </div>
      </div>
      <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:6,flexShrink:0}}>
        <StatusBadge status={appt.status} />
        {actions}
      </div>
    </div>
  );
}

function ApptDetail({ appt, onClose, view, onUpdate }) {
  const [prescText, setPrescText] = useState(appt.prescription||"");
  const [notesText, setNotesText] = useState(appt.notes||"");

  return (
    <div className="card animate-slideIn">
      <div className="card-header">
        <div><div className="card-title">Appointment Details</div><div className="card-sub">{appt.patientName || appt.doctorName}</div></div>
        <button className="modal-close" onClick={onClose}>✕</button>
      </div>
      <div className="card-pad">
        {[
          ["Doctor",appt.doctorName],
          ["Patient",appt.patientName],
          ["Date",fmtDate(appt.date)],
          ["Time",fmtTime(appt.time)],
          ["Specialty",appt.specialty],
          ["Hospital",appt.hospital],
          ["Type",appt.type],
          ["Fee",`₹${appt.fee}`],
          ["Status",<StatusBadge key="s" status={appt.status}/>],
        ].filter(([l,v]) => v).map(([label,val])=>(
          <div key={label} className="modal-info-row">
            <span className="modal-info-label">{label}</span>
            <span className="modal-info-val">{val}</span>
          </div>
        ))}

        <div className="divider"/>
        <div style={{fontSize:12,fontWeight:700,color:"var(--text4)",textTransform:"uppercase",letterSpacing:0.5,marginBottom:6}}>Reason</div>
        <div style={{fontSize:13,color:"var(--text2)",background:"var(--surface2)",borderRadius:8,padding:10}}>{appt.reason}</div>

        {appt.prescription && (
          <>
            <div className="divider"/>
            <div className="rx-card">
              <span className="rx-badge">Rx</span>
              <div className="rx-header"><div className="rx-symbol">℞</div><div><div className="rx-title">Prescription</div></div></div>
              <div className="rx-content">{appt.prescription}</div>
            </div>
          </>
        )}
        {appt.notes && (
          <>
            <div className="divider"/>
            <div style={{fontSize:12,fontWeight:700,color:"var(--text4)",textTransform:"uppercase",letterSpacing:0.5,marginBottom:6}}>Doctor's Notes</div>
            <div style={{fontSize:13,color:"var(--text2)",fontStyle:"italic",padding:10,background:"#f0fdf4",borderRadius:8,borderLeft:"3px solid var(--success)"}}>{appt.notes}</div>
          </>
        )}

        {view==="doctor" && appt.status==="confirmed" && onUpdate && (
          <>
            <div className="divider"/>
            <div className="field"><label className="field-label">Prescription</label><textarea className="field-input" rows={3} style={{fontFamily:"monospace"}} value={prescText} onChange={e=>setPrescText(e.target.value)} placeholder="Medications..."/></div>
            <div className="field"><label className="field-label">Notes</label><textarea className="field-input" rows={2} value={notesText} onChange={e=>setNotesText(e.target.value)} placeholder="Follow-up..."/></div>
            <button className="btn btn-success btn-full" onClick={()=>{onUpdate(appt.id,{status:"completed",prescription:prescText||null,notes:notesText});onClose();}}>✓ Complete Appointment</button>
          </>
        )}
      </div>
    </div>
  );
}

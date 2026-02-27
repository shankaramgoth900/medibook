import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, where } from 'firebase/firestore';
import { db } from './firebase';

// Appointments
export const addAppointment = async (appointment) => {
  return addDoc(collection(db, 'appointments'), appointment);
};

export const getAppointments = async (userId) => {
  const q = query(collection(db, 'appointments'), where('patientId', '==', userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const updateAppointment = async (id, data) => {
  return updateDoc(doc(db, 'appointments', id), data);
};

export const deleteAppointment = async (id) => {
  return deleteDoc(doc(db, 'appointments', id));
};

// Prescriptions
export const addPrescription = async (prescription) => {
  return addDoc(collection(db, 'prescriptions'), prescription);
};

export const getPrescriptions = async (patientId) => {
  const q = query(collection(db, 'prescriptions'), where('patientId', '==', patientId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Medical Records
export const addMedicalRecord = async (record) => {
  return addDoc(collection(db, 'medicalRecords'), record);
};

export const getMedicalRecords = async (patientId) => {
  const q = query(collection(db, 'medicalRecords'), where('patientId', '==', patientId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

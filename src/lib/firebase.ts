
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// IMPORTANT: Replace this with your actual Firebase project configuration
const firebaseConfig = {
  "projectId": "consultantflow-tvcnw",
  "appId": "1:115709835790:web:769dc814bff7502811da5f",
  "storageBucket": "consultantflow-tvcnw.firebasestorage.app",
  "apiKey": "AIzaSyBdhSdd1Y0rs5DE7yU_cycmAz6cedAb-Ow",
  "authDomain": "consultantflow-tvcnw.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "115709835790"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { db };

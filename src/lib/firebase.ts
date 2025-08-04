import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// IMPORTANT: Replace this with your actual Firebase project configuration
const firebaseConfig = {
  "projectId": process.env.FIREBASE_PROJECT_ID,
  "appId": process.env.FIREBASE_APP_ID,
  "storageBucket":process.env.FIREBASE_STORAGE_BUCKET,
  "apiKey": process.env.FIREBASE_API_KEY,
  "authDomain": process.env.FIREBASE_AUTH_DOMAIN,
  "measurementId": process.env.FIREBASE_MEASUREMENT_ID,
  "messagingSenderId": process.env.FIREBASE_MESSAGING_SENDER_ID
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { db };

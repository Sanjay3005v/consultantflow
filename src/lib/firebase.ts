
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// IMPORTANT: Replace this with your actual Firebase project configuration
const firebaseConfig = {
  "projectId": process.env.FIREBASE_PROJECTID,
  "appId": process.env.FIREBASE_APPID,
  "storageBucket":process.env.FIREBASE_STORAGEBUCKET,
  "apiKey": process.env.FIREBASE_API_KEY,
  "authDomain": process.env.FIREBASE_AUTHDOMAIN,
  "measurementId": process.env.FIREBASE_MEASUREMENTID,
  "messagingSenderId": process.env.FIREBASE_MESSAGINGSENDERID
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { db };

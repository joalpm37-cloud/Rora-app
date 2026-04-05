import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyB2kn0KeE7DT702-QEm7c2Q96VXcH-oXX0",
  authDomain: "rora-app-d98e6.firebaseapp.com",
  projectId: "rora-app-d98e6",
  storageBucket: "rora-app-d98e6.firebasestorage.app",
  messagingSenderId: "446521523625",
  appId: "1:446521523625:web:28787178780302080798b8",
  measurementId: "G-JYBGG504E3"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyB2kn0KeE7DT702-QEm7c2Q96VXcH-oXX0",
  authDomain: "rora-app-d98e6.firebaseapp.com",
  projectId: "rora-app-d98e6",
  storageBucket: "rora-app-d98e6.firebasestorage.app",
  messagingSenderId: "446521523625",
  appId: "1:446521523625:web:28787178780302080798b8",
  measurementId: "G-JYBGG504E3"
};

let _app = null;
let _db = null;

// Lazy Loaders
export const getApp = () => {
  if (!_app) _app = initializeApp(firebaseConfig);
  return _app;
};

export const getDb = () => {
  if (!_db) _db = getFirestore(getApp());
  return _db;
};

// Retrocompatibilidad
export const app = getApp();
export const db = getDb();

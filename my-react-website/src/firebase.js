import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBwUQW_13ylZe6aEGWQc3loma9O27FsObM",
  authDomain: "mikxx-a0fd8.firebaseapp.com",
  projectId: "mikxx-a0fd8",
  storageBucket: "mikxx-a0fd8.firebasestorage.app",
  messagingSenderId: "82639660260",
  appId: "1:82639660260:web:d83efafac6f4d9ae3ef8f1",
  measurementId: "G-7LC28ZKJQS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app; 
// firebaseConfig.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

// Firebase project configuration for final-year-project-gctu
const firebaseConfig = {
  apiKey: "AIzaSyDE5fisKHXVSRAMQUWAvR3s957H-PNsTVM",
  authDomain: "final-year-project-gctu.firebaseapp.com",
  projectId: "final-year-project-gctu",
  storageBucket: "final-year-project-gctu.appspot.com",
  messagingSenderId: "1092508633220",
  appId: "1:1092508633220:web:5dd2def392b4144c489ad1",
  measurementId: "G-EGDQ6ZVGEK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

// Export app instance for other uses
export default app;

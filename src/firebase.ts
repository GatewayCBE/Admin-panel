import { initializeApp } from "firebase/app";
import { getAuth, RecaptchaVerifier } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Add this line to tell TypeScript about recaptchaVerifier
declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
  }
}

// Firebase config from environment variables
const firebaseConfig = {
  apiKey: "AIzaSyAHzKI92ku_apVyNcyK-8tiYHKXQ9jiDgA",
  authDomain: "play-arena-e83d8.firebaseapp.com",
  projectId: "play-arena-e83d8",
  storageBucket: "play-arena-e83d8.firebasestorage.app",
  messagingSenderId: "957786893349",
  appId: "1:957786893349:web:10ac7e55fabd2a200423cc",
  measurementId: "G-ZTR4PJFLBN"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

// Required for Phone Auth on Web
// This invisible Recaptcha will be added automatically
window.recaptchaVerifier = undefined;

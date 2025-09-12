import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

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



// // Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
// // TODO: Add SDKs for Firebase products that you want to use
// // https://firebase.google.com/docs/web/setup#available-libraries

// // Your web app's Firebase configuration
// // For Firebase JS SDK v7.20.0 and later, measurementId is optional
// const firebaseConfig = {
//   apiKey: "AIzaSyAHzKI92ku_apVyNcyK-8tiYHKXQ9jiDgA",
//   authDomain: "play-arena-e83d8.firebaseapp.com",
//   projectId: "play-arena-e83d8",
//   storageBucket: "play-arena-e83d8.firebasestorage.app",
//   messagingSenderId: "957786893349",
//   appId: "1:957786893349:web:10ac7e55fabd2a200423cc",
//   measurementId: "G-ZTR4PJFLBN"
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
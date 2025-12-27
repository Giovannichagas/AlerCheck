// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAYVFKiY7P8e_eruErHkuFU4jRhVCLJzbY",
  authDomain: "alerchek-eff98.firebaseapp.com",
  projectId: "alerchek-eff98",
  storageBucket: "alerchek-eff98.firebasestorage.app",
  messagingSenderId: "914629861616",
  appId: "1:914629861616:web:eb0a285300dbbc99736235",
  measurementId: "G-K9RMLXFDBD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
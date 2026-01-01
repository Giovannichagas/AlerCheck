// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBNXQdnaaATvFgJ0mmDpeCJ1UOi-d-EH0w",
  authDomain: "alercheck.firebaseapp.com",
  projectId: "alercheck",
  storageBucket: "alercheck.firebasestorage.app",
  messagingSenderId: "389174712778",
  appId: "1:389174712778:web:b81ba1927002af2f8f1733",
  measurementId: "G-PQ8ECZ6CHN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
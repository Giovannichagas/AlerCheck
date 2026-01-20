// app/services/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBNXQdnaaATvFgJ0mmDpeCJ1UOi-d-EH0w",
  authDomain: "alercheck.firebaseapp.com",
  projectId: "alercheck",
  storageBucket: "alercheck.firebasestorage.app",
  messagingSenderId: "389174712778",
  appId: "1:389174712778:web:b81ba1927002af2f8f1733",
  measurementId: "G-PQ8ECZ6CHN",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

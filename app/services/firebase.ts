import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

import { getApp, getApps, initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

import { getAuth, initializeAuth } from "firebase/auth";
//import { getReactNativePersistence } from "firebase/auth/react-native";
// criando o commit correto
const firebaseConfig = {
  apiKey: "AIzaSyBNXQdnaaATvFgJ0mmDpeCJ1UOi-d-EH0w",
  authDomain: "alercheck.firebaseapp.com",
  projectId: "alercheck",
  storageBucket: "alercheck.firebasestorage.app",
  messagingSenderId: "389174712778",
  appId: "1:389174712778:web:b81ba1927002af2f8f1733",
  measurementId: "G-PQ8ECZ6CHN",
};

export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app);

export const auth =
  Platform.OS === "web"
    ? getAuth(app)
    : initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage),
      });

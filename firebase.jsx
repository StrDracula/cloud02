// Update firebase.jsx
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC4uo3U1aQVXWW4Ru7b9HiOXMq9Thqg0Kk",
  authDomain: "login-1-a9391.firebaseapp.com",
  projectId: "login-1-a9391",
  storageBucket: "login-1-a9391.appspot.com", // Fixed storageBucket URL
  messagingSenderId: "57940307145",
  appId: "1:57940307145:web:8241955f82843c7ba57118"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app); // Add app parameter here
export const db = getFirestore(app);
export default app;
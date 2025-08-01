import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyARt1QFtQfxJO17pFb7Pk5tUd8kf8h4tV8",
  authDomain: "flashmy-zhjpwlj.firebaseapp.com",
  projectId: "flashmy-zhjpwlj",
  storageBucket: "flashmy-zhjpwlj.firebasestorage.app",
  messagingSenderId: "741150764398",
  appId: "1:741150764398:web:40aaae6a268b5a698fe57f",
  measurementId: "G-5ZM4MN8H3Z"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "你的API_KEY",
  authDomain: "你的PROJECT_ID.firebaseapp.com",
  projectId: "你的PROJECT_ID",
  storageBucket: "你的PROJECT_ID.appspot.com",
  messagingSenderId: "你的消息发送ID",
  appId: "你的APP_ID"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);

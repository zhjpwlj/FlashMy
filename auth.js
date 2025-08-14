import { auth, provider } from "./firebase-config.js";
import { signInWithPopup, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const googleLoginBtn = document.getElementById('googleLoginBtn');
const emailLoginForm = document.getElementById('emailLoginForm');
const authSection = document.getElementById('authSection');
const flashcardSection = document.getElementById('flashcardSection');

googleLoginBtn.addEventListener('click', async () => {
  try {
    await signInWithPopup(auth, provider);
  } catch(e) {
    alert("登录失败：" + e.message);
  }
});

emailLoginForm.addEventListener('submit', async e => {
  e.preventDefault();
  const email = document.getElementById('emailInput').value;
  const password = document.getElementById('passwordInput').value;
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch(e) {
    alert("登录失败：" + e.message);
  }
});

logoutBtn.addEventListener('click', () => {
  signOut(auth);
});

onAuthStateChanged(auth, user => {
  if (user) {
    authSection.hidden = true;
    flashcardSection.hidden = false;
    logoutBtn.style.display = 'inline-block';
    loginBtn.style.display = 'none';
    // 这里可以触发加载用户数据
    window.currentUser = user;
    document.dispatchEvent(new CustomEvent('user-logged-in', { detail: user }));
  } else {
    authSection.hidden = false;
    flashcardSection.hidden = true;
    logoutBtn.style.display = 'none';
    loginBtn.style.display = 'inline-block';
    window.currentUser = null;
  }
});

import { auth, provider } from "./firebase-config.js";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const googleLoginBtn = document.getElementById('googleLoginBtn');
const emailLoginForm = document.getElementById('emailLoginForm');
const emailRegisterForm = document.getElementById('emailRegisterForm');

const authSection = document.getElementById('authSection');
const flashcardSection = document.getElementById('flashcardSection');

// -------- Google 登录 --------
googleLoginBtn.addEventListener('click', async () => {
  try {
    await signInWithPopup(auth, provider);
  } catch(e) {
    console.error("Google 登录失败", e.code, e.message);
    alert(`Google 登录失败: ${e.message}`);
  }
});

// -------- Email 注册 --------
emailRegisterForm.addEventListener('submit', async e => {
  e.preventDefault();
  const email = document.getElementById('regEmail').value;
  const password = document.getElementById('regPassword').value;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    console.log("注册成功", userCredential.user);
    alert("注册成功！");
  } catch(e) {
    console.error("注册失败", e.code, e.message);
    alert(`注册失败: ${e.message}`);
  }
});

// -------- Email 登录 --------
emailLoginForm.addEventListener('submit', async e => {
  e.preventDefault();
  const email = document.getElementById('emailInput').value;
  const password = document.getElementById('passwordInput').value;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log("登录成功", userCredential.user);
    alert("登录成功！");
  } catch(e) {
    console.error("登录失败", e.code, e.message);
    alert(`登录失败: ${e.message}`);
  }
});

// -------- 登出 --------
logoutBtn.addEventListener('click', () => {
  signOut(auth).then(() => console.log("已登出"));
});

// -------- 用户状态监听 --------
onAuthStateChanged(auth, user => {
  if (user) {
    authSection.hidden = true;
    flashcardSection.hidden = false;
    logoutBtn.style.display = 'inline-block';
    loginBtn.style.display = 'none';
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

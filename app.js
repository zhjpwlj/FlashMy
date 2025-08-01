import { auth, provider, db } from './firebase-config.js';
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import {
  collection,
  addDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

import Chart from "https://cdn.jsdelivr.net/npm/chart.js@4.3.0/dist/chart.umd.min.js";

const loading = document.getElementById('loading');
const authDiv = document.getElementById('auth');
const mainDiv = document.getElementById('main');

const btnGoogle = document.getElementById('btn-google');
const emailForm = document.getElementById('email-form');
const inputEmail = document.getElementById('email');
const inputPassword = document.getElementById('password');
const btnLogout = document.getElementById('btn-logout');
const btnThemeToggle = document.getElementById('btn-theme-toggle');

const navSets = document.getElementById('nav-sets');
const navStudy = document.getElementById('nav-study');
const navPublic = document.getElementById('nav-public');
const navStats = document.getElementById('nav-stats');

const setsSection = document.getElementById('sets-section');
const setEditSection = document.getElementById('set-edit-section');
const studySection = document.getElementById('study-section');
const publicSetsSection = document.getElementById('public-sets-section');
const statsSection = document.getElementById('stats-section');

const setsList = document.getElementById('sets-list');
const btnCreateSet = document.getElementById('btn-create-set');

const setTitleInput = document.getElementById('set-title');
const setDescInput = document.getElementById('set-desc');
const cardsListDiv = document.getElementById('cards-list');
const btnAddCard = document.getElementById('btn-add-card');
const btnSaveSet = document.getElementById('btn-save-set');
const btnCancelEdit = document.getElementById('btn-cancel-edit');

const studyTitle = document.getElementById('study-title');
const studyModeSelect = document.getElementById('study-mode-select');
const studyArea = document.getElementById('study-area');
const btnExitStudy = document.getElementById('btn-exit-study');

const publicSearch = document.getElementById('public-search');
const publicSetsList = document.getElementById('public-sets-list');

const statsChartCanvas = document.getElementById('stats-chart');

let currentUser = null;
let editingSetId = null;
let editingCards = [];
let studySet = null;
let studyMode = 'flip'; // flip/spell/quiz
let studyIndex = 0;

let chartInstance = null;

// 主题管理
function loadTheme() {
  const theme = localStorage.getItem('theme');
  if (theme === 'dark') document.body.classList.add('dark');
  else document.body.classList.remove('dark');
}
function toggleTheme() {
  if (document.body.classList.contains('dark')) {
    document.body.classList.remove('dark');
    localStorage.setItem('theme', 'light');
  } else {
    document.body.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  }
}

// 显示不同界面
function showSection(section) {
  [setsSection, setEditSection, studySection, publicSetsSection, statsSection].forEach(s => s.classList.add('hidden'));
  section.classList.remove('hidden');
}

// 显示加载状态
function setLoading(show) {
  loading.style.display = show ? 'block' : 'none';
}

// 用户认证
function setupAuth() {
  btnGoogle.onclick = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (e) {
      alert('Google 登录失败：' + e.message);
    }
  };

  emailForm.onsubmit = async (e) => {
    e.preventDefault();
    const email = inputEmail.value.trim();
    const password = inputPassword.value.trim();
    if (!email || !password) return alert('邮箱和密码不能为空');
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (e) {
      if (e.code === 'auth/user-not-found') {
        // 注册
        try {
          await createUserWithEmailAndPassword(auth, email, password);
          alert('注册成功');
        } catch (ex) {
          alert('注册失败：' + ex.message);
        }
      } else {
        alert('登录失败：' + e.message);
      }
    }
  };

  btnLogout.onclick = async () => {
    await signOut(auth);
  };

  onAuthStateChanged(auth, async (user) => {
    currentUser = user;
    if (user) {
      authDiv.classList.add('hidden');
      mainDiv.classList.remove('hidden');
      await loadUserSets();
      showSection(setsSection);
    } else {
      mainDiv.classList.add('hidden');
      authDiv.classList.remove('hidden');
    }
    setLoading(false);
  });
}

// 加载用户卡组
async function loadUserSets() {
  if (!currentUser) return;
  setsList.innerHTML = '';
  const q = query(collection(db, 'flashcards'), where('uid', '==', currentUser.uid));
  const snap = await getDocs(q);
  snap.forEach(docSnap => {
    const data = docSnap.data();
    const div = document.createElement('div');
    div.classList.add('card');
    div.innerHTML = `
      <h3>${escapeHTML(data.title)}</h3>
      <p>${escapeHTML(data.description)}</p>
      <button class="btn-edit" data-id="${docSnap.id}">编辑</button>
      <button class="btn-study" data-id="${docSnap.id}">学习</button>
      <button class="btn-delete" data-id="${docSnap.id}">删除</button>
    `;
    setsList.appendChild(div);
  });

  // 事件绑定
  setsList.querySelectorAll('.btn-edit').forEach(btn => {
    btn.onclick = () => startEditSet(btn.dataset.id);
  });
  setsList.querySelectorAll('.btn-study').forEach(btn => {
    btn.onclick = () => startStudySet(btn.dataset.id);
  });
  setsList.querySelectorAll('.btn-delete').forEach(btn => {
    btn.onclick = async () => {
      if (!confirm('确定删除此卡组吗？')) return;
      await deleteDoc(doc(db, 'flashcards', btn.dataset.id));
      await loadUserSets();
    };
  });
}

// 创建新卡组
btnCreateSet.onclick = () => {
  editingSetId = null;
  editingCards = [];
  setTitleInput.value = '';
  setDescInput.value = '';
  cardsListDiv.innerHTML = '';
  showSection(setEditSection);
};

// 添加卡片编辑控件
btnAddCard.onclick = () => {
  addCardEditor('', '');
};

function addCardEditor(term, def) {
  const div = document.createElement('div');
  div.classList.add('card-edit');

  div.innerHTML = `
    <input type="text" class="card-term" placeholder="术语" value="${escapeHTML(term)}" required />
    <input type="text" class="card-definition" placeholder="定义" value="${escapeHTML(def)}" required />
    <button class="btn-remove-card">删除</button>
  `;
  cardsListDiv.appendChild(div);

  div.querySelector('.btn-remove-card').onclick = () => {
    cardsListDiv.removeChild(div);
  };
}

// 保存卡组
btnSaveSet.onclick = async () => {
  const title = setTitleInput.value.trim();
  if (!title) return alert('卡组标题不能为空');
  const description = setDescInput.value.trim();

  const cards = [];
  const editors = cardsListDiv.querySelectorAll('.card-edit');
  for (const editor of editors) {
    const term = editor.querySelector('.card-term').value.trim();
    const def = editor.querySelector('.card-definition').value.trim();
    if (!term || !def) return alert('卡片术语和定义不能为空');
    cards.push({
      term, definition: def,
      repetition: 0,
      interval: 0,
      efactor: 2.5,
      dueDate: new Date().toISOString()
    });
  }
  if (cards.length === 0) return alert('至少要有一张卡片');

  setLoading(true);

  try {
    if (editingSetId) {
      await setDoc(doc(db, 'flashcards', editingSetId), {
        uid: currentUser.uid,
        title,
        description,
        cards
      });
    } else {
      const docRef = await addDoc(collection(db, 'flashcards'), {
        uid: currentUser.uid,
        title,
        description,
        cards
      });
      editingSetId = docRef.id;
    }
    alert('保存成功');
    await loadUserSets();
    showSection(setsSection);
  } catch (e) {
    alert('保存失败: ' + e.message);
  } finally {
    setLoading(false);
  }
};

btnCancelEdit.onclick = () => {
  showSection(setsSection);
};

// 编辑卡组
async function startEditSet(id) {
  setLoading(true);
  try {
    const docSnap = await getDoc(doc(db, 'flashcards', id));
    if (!docSnap.exists()) {
      alert('卡组不存在');
      return;
    }
    const data = docSnap.data();
    editingSetId = id;
    setTitleInput.value = data.title;
    setDescInput.value = data.description;
    cardsListDiv.innerHTML = '';
    for (const c of data.cards) {
      addCardEditor(c.term, c.definition);
    }
    showSection(setEditSection);
  } catch (e) {
    alert('读取失败: ' + e.message);
  } finally {
    setLoading(false);
  }
}

// 学习模式入口
async function startStudySet(id) {
  setLoading(true);
  try {
    const docSnap = await getDoc(doc(db, 'flashcards', id));
    if (!docSnap.exists()) {
      alert('卡组不存在');
      return;
    }
    studySet = docSnap.data();
    studySet.id = id;
    studyTitle.textContent = studySet.title;
    studyIndex = 0;
    studyMode = 'flip';
    updateStudyModeButtons();
    showSection(studySection);
    loadStudyCard();
  } catch (e) {
    alert('读取失败: ' + e.message);
  } finally {
    setLoading(false);
  }
}

function updateStudyModeButtons() {
  studyModeSelect.querySelectorAll('button').forEach(b => b.classList.remove('active'));
  studyModeSelect.querySelector(`button[data-mode="${studyMode}"]`).classList.add('active');
}
studyModeSelect.onclick = (e) => {
  if (e.target.tagName === 'BUTTON') {
    studyMode = e.target.dataset.mode;
    updateStudyModeButtons();
    studyIndex = 0;
    loadStudyCard();
  }
};
btnExitStudy.onclick = () => {
  showSection(setsSection);
  studySet = null;
};

// 加载当前学习卡片
function loadStudyCard() {
  studyArea.innerHTML = '';
  if (!studySet || studySet.cards.length === 0) {
    studyArea.textContent = '无卡片';
    return;
  }
  if (studyIndex >= studySet.cards.length) {
    studyArea.innerHTML = '<p>学习完成！</p><button id="btn-study-again">再学一遍</button>';
    document.getElementById('btn-study-again').onclick = () => {
      studyIndex = 0;
      loadStudyCard();
    };
    return;
  }

  const card = studySet.cards[studyIndex];
  switch (studyMode) {
    case 'flip': return loadFlipCard(card);
    case 'spell': return loadSpellCard(card);
    case 'quiz': return loadQuizCard(card);
  }
}

function loadFlipCard(card) {
  const container = document.createElement('div');
  container.classList.add('flip-card');

  const front = document.createElement('div');
  front.classList.add('card-front');
  front.textContent = card.term;

  const back = document.createElement('div');
  back.classList.add('card-back', 'hidden');
  back.textContent = card.definition;

  container.appendChild(front);
  container.appendChild(back);
  container.style.cursor = 'pointer';

  container.onclick = () => {
    front.classList.toggle('hidden');
    back.classList.toggle('hidden');
  };

  studyArea.appendChild(container);

  const btnNext = document.createElement('button');
  btnNext.textContent = '记忆评分 0-5';
  btnNext.onclick = () => {
    let rating = prompt('你对这张卡片的记忆评分（0-5）：', '5');
    rating = Number(rating);
    if (isNaN(rating) || rating < 0 || rating > 5) {
      alert('请输入 0 到 5 的数字');
      return;
    }
    updateCardSRS(studySet.id, studyIndex, rating).then(() => {
      studyIndex++;
      loadStudyCard();
    });
  };
  studyArea.appendChild(btnNext);
}

function loadSpellCard(card) {
  const container = document.createElement('div');
  container.innerHTML = `
    <p>拼写：请键入定义</p>
    <p><b>术语：</b>${escapeHTML(card.term)}</p>
    <input id="spell-input" type="text" autocomplete="off" />
    <button id="spell-check-btn">检查</button>
    <p id="spell-result"></p>
  `;
  studyArea.appendChild(container);

  const input = document.getElementById('spell-input');
  const checkBtn = document.getElementById('spell-check-btn');
  const resultP = document.getElementById('spell-result');

  checkBtn.onclick = () => {
    if (input.value.trim() === card.definition) {
      resultP.textContent = '正确！';
      updateCardSRS(studySet.id, studyIndex, 5).then(() => {
        studyIndex++;
        loadStudyCard();
      });
    } else {
      resultP.textContent = `错误，正确答案：${escapeHTML(card.definition)}`;
      updateCardSRS(studySet.id, studyIndex, 2);
    }
  };
}

function loadQuizCard(card) {
  const container = document.createElement('div');
  container.innerHTML = `
    <p>测验：请选择正确的定义</p>
    <p><b>术语：</b>${escapeHTML(card.term)}</p>
    <div id="quiz-options"></div>
  `;
  studyArea.appendChild(container);

  // 生成 3 个错误选项 + 1 正确选项
  let options = [card.definition];
  while (options.length < 4) {
    const randomCard = studySet.cards[Math.floor(Math.random() * studySet.cards.length)];
    if (!options.includes(randomCard.definition)) options.push(randomCard.definition);
  }
  options = options.sort(() => Math.random() - 0.5);

  const quizOptionsDiv = document.getElementById('quiz-options');
  options.forEach(opt => {
    const btn = document.createElement('button');
    btn.textContent = opt;
    btn.onclick = () => {
      if (opt === card.definition) {
        alert('正确！');
        updateCardSRS(studySet.id, studyIndex, 5).then(() => {
          studyIndex++;
          loadStudyCard();
        });
      } else {
        alert('错误！');
        updateCardSRS(studySet.id, studyIndex, 1);
      }
    };
    quizOptionsDiv.appendChild(btn);
  });
}

// SRS: SM-2算法实现
async function updateCardSRS(setId, cardIndex, quality) {
  // quality: 0-5分 用户对记忆的反馈
  if (!studySet) return;

  const card = studySet.cards[cardIndex];
  let { repetition, interval, efactor, dueDate } = card;

  if (quality < 3) {
    repetition = 0;
    interval = 1;
  } else {
    if (repetition === 0) interval = 1;
    else if (repetition === 1) interval = 6;
    else interval = Math.round(interval * efactor);

    efactor = efactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    if (efactor < 1.3) efactor = 1.3;
    repetition++;
  }

  const nextDueDate = new Date();
  nextDueDate.setDate(nextDueDate.getDate() + interval);

  // 更新本地对象
  card.repetition = repetition;
  card.interval = interval;
  card.efactor = efactor;
  card.dueDate = nextDueDate.toISOString();

  // 写回数据库
  try {
    const setDocRef = doc(db, 'flashcards', setId);
    const snap = await getDoc(setDocRef);
    if (!snap.exists()) return;
    const data = snap.data();
    data.cards[cardIndex] = card;
    await updateDoc(setDocRef, { cards: data.cards });
  } catch (e) {
    console.error('更新SRS失败', e);
  }
}

// 转义HTML避免XSS
function escapeHTML(str) {
  return str.replace(/[&<>"']/g, (m) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[m]));
}

// 导航按钮
navSets.onclick = () => { showSection(setsSection); loadUserSets(); };
navStudy.onclick = () => {
  if (!studySet) alert('请先选择卡组学习');
  else showSection(studySection);
};
navPublic.onclick = () => { showSection(publicSetsSection); loadPublicSets(); };
navStats.onclick = () => { showSection(statsSection); loadStats(); };

// 公开卡组
async function loadPublicSets() {
  publicSetsList.innerHTML = '<p>加载中...</p>';
  try {
    const snap = await getDocs(collection(db, 'publicFlashcards'));
    publicSetsList.innerHTML = '';
    snap.forEach(docSnap => {
      const data = docSnap.data();
      const div = document.createElement('div');
      div.classList.add('card');
      div.innerHTML = `
        <h3>${escapeHTML(data.title)}</h3>
        <p>${escapeHTML(data.description)}</p>
        <button data-id="${docSnap.id}">导入</button>
      `;
      publicSetsList.appendChild(div);
    });
    publicSetsList.querySelectorAll('button').forEach(btn => {
      btn.onclick = async () => {
        const id = btn.dataset.id;
        if (!currentUser) return alert('请先登录');
        const pubDoc = await getDoc(doc(db, 'publicFlashcards', id));
        if (!pubDoc.exists()) return alert('卡组不存在');
        const data = pubDoc.data();
        // 导入到用户私人卡组
        await addDoc(collection(db, 'flashcards'), {
          uid: currentUser.uid,
          title: data.title,
          description: data.description,
          cards: data.cards
        });
        alert('导入成功');
        await loadUserSets();
      };
    });
  } catch (e) {
    publicSetsList.innerHTML = '<p>加载失败</p>';
  }
}

publicSearch.oninput = async () => {
  const keyword = publicSearch.value.trim().toLowerCase();
  if (!keyword) return loadPublicSets();
  try {
    const snap = await getDocs(collection(db, 'publicFlashcards'));
    publicSetsList.innerHTML = '';
    snap.forEach(docSnap => {
      const data = docSnap.data();
      if (data.title.toLowerCase().includes(keyword) || (data.description && data.description.toLowerCase().includes(keyword))) {
        const div = document.createElement('div');
        div.classList.add('card');
        div.innerHTML = `
          <h3>${escapeHTML(data.title)}</h3>
          <p>${escapeHTML(data.description)}</p>
          <button data-id="${docSnap.id}">导入</button>
        `;
        publicSetsList.appendChild(div);
      }
    });
  } catch (e) {
    publicSetsList.innerHTML = '<p>加载失败</p>';
  }
};

// 学习统计图表
async function loadStats() {
  if (!currentUser) return alert('请先登录');
  setLoading(true);
  try {
    // 读取用户所有卡组和复习数据
    const q = query(collection(db, 'flashcards'), where('uid', '==', currentUser.uid));
    const snap = await getDocs(q);
    let reviewCountByDate = {};
    snap.forEach(docSnap => {
      const data = docSnap.data();
      data.cards.forEach(c => {
        if (c.dueDate) {
          const d = c.dueDate.substr(0, 10);
          reviewCountByDate[d] = (reviewCountByDate[d] || 0) + 1;
        }
      });
    });
    const labels = Object.keys(reviewCountByDate).sort();
    const dataPoints = labels.map(d => reviewCountByDate[d]);
    if (chartInstance) chartInstance.destroy();
    chartInstance = new Chart(statsChartCanvas, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: '复习次数',
          data: dataPoints,
          borderColor: '#6200ee',
          backgroundColor: 'rgba(98,0,238,0.3)',
          fill: true,
          tension: 0.3
        }]
      },
      options: {
        responsive: true,
        scales: { y: { beginAtZero: true } }
      }
    });
  } catch (e) {
    alert('加载统计失败');
  } finally {
    setLoading(false);
  }
}

// 初始化
loadTheme();
setupAuth();

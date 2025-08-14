import { srs } from "./fsrs.js";
import { db } from "./firebase-config.js";
import { doc, getDoc, updateDoc, setDoc, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

let studyMode = 'flip';
let reverse = false;
let currentSetId = null;
let currentCards = [];
let currentIndex = 0;

const cardContainer = document.getElementById('cardContainer');
const modeSelect = document.getElementById('modeSelect');
const reverseBtn = document.getElementById('reverseBtn');
const studySetTitle = document.getElementById('studySetTitle');

modeSelect.addEventListener('change', () => {
  studyMode = modeSelect.value;
  renderCard();
});
reverseBtn.addEventListener('click', () => {
  reverse = !reverse;
  renderCard();
});

document.getElementById('nextCardBtn').addEventListener('click', () => {
  if (currentIndex < currentCards.length - 1) {
    currentIndex++;
    renderCard();
  }
});
document.getElementById('prevCardBtn').addEventListener('click', () => {
  if (currentIndex > 0) {
    currentIndex--;
    renderCard();
  }
});

export async function loadSet(setId) {
  currentSetId = setId;
  const docSnap = await getDoc(doc(db, "flashcards", setId));
  if (!docSnap.exists()) return alert('闪卡集不存在');
  const data = docSnap.data();
  currentCards = data.cards || [];
  studySetTitle.textContent = data.title;
  currentIndex = 0;
  renderCard();
}

function renderCard() {
  if (!currentCards.length) {
    cardContainer.textContent = '无卡片';
    return;
  }
  const card = currentCards[currentIndex];
  let front = reverse ? card.back : card.front;
  let back = reverse ? card.front : card.back;

  cardContainer.innerHTML = '';

  if (studyMode === 'flip') {
    cardContainer.innerHTML = `
      <div class="card-front">${renderContent(front)}</div>
      <div class="card-back" style="display:none;">${renderContent(back)}</div>
      <button id="flipBtn">翻转卡片</button>
      <button id="ttsBtn">朗读题面</button>
    `;
    document.getElementById('flipBtn').onclick = () => {
      const backDiv = cardContainer.querySelector('.card-back');
      const frontDiv = cardContainer.querySelector('.card-front');
      if (backDiv.style.display === 'none') {
        backDiv.style.display = 'block';
        frontDiv.style.display = 'none';
      } else {
        backDiv.style.display = 'none';
        frontDiv.style.display = 'block';
      }
    };
    document.getElementById('ttsBtn').onclick = () => {
      speak(front);
    };
  }
  // TODO: 其他模式如 typing、listening、blast、multipleChoice 等也可类似实现
}

function renderContent(text) {
  // 支持 <img> 标签、MathJax 语法和普通文本
  if (!text) return '';
  let html = text;
  // 简单检测图片标签
  if (text.match(/\<img\s+src=['"].+['"]\>/)) {
    html = text; // 直接渲染 HTML
  } else if (text.match(/\\\(.*?\\\)/)) {
    html = text; // MathJax 语法，MathJax 会自动渲染
  } else {
    html = text.replace(/\n/g, '<br>');
  }
  return html;
}

function speak(text) {
  const uttr = new SpeechSynthesisUtterance(text);
  window.speechSynthesis.speak(uttr);
}

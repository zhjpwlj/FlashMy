import { db } from "./firebase-config.js";
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

const csvImportInput = document.getElementById('csvImportInput');
const exportCsvBtn = document.getElementById('exportCsvBtn');

csvImportInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const text = await file.text();
  const lines = text.split('\n');
  for (const line of lines) {
    const [front, back] = line.split(',');
    await addDoc(collection(db, 'flashcards'), { front, back, userId: window.currentUser.uid, createdAt: Date.now() });
  }
  alert('导入完成');
});

exportCsvBtn.addEventListener('click', async () => {
  // 查询所有用户卡片导出
  // TODO 这里可做具体实现
  alert('导出功能开发中');
});

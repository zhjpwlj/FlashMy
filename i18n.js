// i18n.js
export const languages = {
  en: {
    title: "FlashMy - Advanced Flashcards",
    welcome: "Welcome to FlashMy",
    login: "Login",
    logout: "Logout",
    googleLogin: "Login with Google",
    createSet: "Create Flashcard Set",
    searchPlaceholder: "Search public flashcards",
    emailPlaceholder: "Email",
    passwordPlaceholder: "Password",
    studyModeLabel: "Study Mode",
    modeFlip: "Flip Mode",
    modeTyping: "Typing Mode",
    modeListening: "Listening Mode",
    modeBlast: "Blast Mode",
    modeMultipleChoice: "Multiple Choice",
    reverseBtn: "Reverse",
    prevCardBtn: "Previous Card",
    nextCardBtn: "Next Card",
    dashboardTitle: "Learning Dashboard",
    importExportTitle: "Import & Export",
    exportCsvBtn: "Export CSV",
    themeSelector: "Theme Selector",
    lightMode: "Light Mode",
    darkMode: "Dark Mode",
    customTheme: "Custom Theme",
    langChinese: "Chinese",
    langEnglish: "English",
    langJapanese: "Japanese"
  },
  zh: {
    title: "FlashMy - 高级闪卡学习",
    welcome: "欢迎使用 FlashMy",
    login: "登录",
    logout: "退出",
    googleLogin: "用 Google 登录",
    createSet: "新建闪卡集",
    searchPlaceholder: "搜索公开闪卡",
    emailPlaceholder: "邮箱",
    passwordPlaceholder: "密码",
    studyModeLabel: "学习模式",
    modeFlip: "翻牌模式",
    modeTyping: "打字模式",
    modeListening: "听写模式",
    modeBlast: "Blast 模式",
    modeMultipleChoice: "选择题模式",
    reverseBtn: "反向切换",
    prevCardBtn: "上一张",
    nextCardBtn: "下一张",
    dashboardTitle: "学习仪表盘",
    importExportTitle: "导入导出",
    exportCsvBtn: "导出为 CSV",
    themeSelector: "主题切换",
    lightMode: "浅色模式",
    darkMode: "深色模式",
    customTheme: "自定义主题",
    langChinese: "中文",
    langEnglish: "英语",
    langJapanese: "日语"
  },
  ja: {
    title: "FlashMy - 高度なフラッシュカード学習",
    welcome: "FlashMyへようこそ",
    login: "ログイン",
    logout: "ログアウト",
    googleLogin: "Googleでログイン",
    createSet: "フラッシュカードセットを作成",
    searchPlaceholder: "公開フラッシュカードを検索",
    emailPlaceholder: "メール",
    passwordPlaceholder: "パスワード",
    studyModeLabel: "学習モード",
    modeFlip: "フリップモード",
    modeTyping: "タイピングモード",
    modeListening: "リスニングモード",
    modeBlast: "ブラストモード",
    modeMultipleChoice: "選択肢モード",
    reverseBtn: "反転切り替え",
    prevCardBtn: "前のカード",
    nextCardBtn: "次のカード",
    dashboardTitle: "学習ダッシュボード",
    importExportTitle: "インポート＆エクスポート",
    exportCsvBtn: "CSVエクスポート",
    themeSelector: "テーマ切替",
    lightMode: "ライトモード",
    darkMode: "ダークモード",
    customTheme: "カスタムテーマ",
    langChinese: "中国語",
    langEnglish: "英語",
    langJapanese: "日本語"
  }
};

let currentLang = localStorage.getItem('lang') || 'zh';

export function setLanguage(lang) {
  currentLang = lang;
  document.documentElement.lang = lang;

  // 替换所有 data-i18n 文本
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    if (languages[lang] && languages[lang][key]) {
      el.textContent = languages[lang][key];
    }
  });

  // 替换 placeholder
  document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
    const key = el.getAttribute("data-i18n-placeholder");
    if (languages[lang] && languages[lang][key]) {
      el.setAttribute("placeholder", languages[lang][key]);
    }
  });

  localStorage.setItem('lang', lang);
}

export function getLanguage() {
  return currentLang;
}

// 页面加载时自动执行
window.addEventListener('DOMContentLoaded', () => {
  setLanguage(currentLang);

  const langSelector = document.getElementById('langSelector');
  if (langSelector) {
    langSelector.value = currentLang;
    langSelector.addEventListener('change', e => {
      setLanguage(e.target.value);
    });
  }
});

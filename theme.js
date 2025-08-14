const themeSelector = document.getElementById('themeSelector');

function applyTheme(theme) {
  if (theme === 'custom') {
    // 这里可以弹窗让用户自定义颜色
  }
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
}

themeSelector.addEventListener('change', e => applyTheme(e.target.value));

const savedTheme = localStorage.getItem('theme') || 'light';
applyTheme(savedTheme);
themeSelector.value = savedTheme;

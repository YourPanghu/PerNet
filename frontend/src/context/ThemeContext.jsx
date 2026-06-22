import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  // 从 localStorage 读取偏好，默认白天模式
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    // 也可以跟随系统偏好
    // return window.matchMedia?.('(prefers-color-scheme: dark)').matches;
    return false;
  });

  useEffect(() => {
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
    // 给 html 设置 data-theme 属性，Ant Design 5.x+ / 6.x 的 ConfigProvider
    // 会自动设此属性，但我们补上确保 CSS 选择器可用
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    // 给 body 添加 class，方便全局 CSS 适配
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

  const toggleTheme = () => setDarkMode((prev) => !prev);

  return (
    <ThemeContext.Provider value={{ darkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}

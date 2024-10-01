import './App.css';
import React, { useContext, useEffect, useState } from 'react';
import Header from './components/New-Components/Header';
import Home from './components/New-Components/Home';
import { ThemeContext } from './ThemeHandler';

function App() {
  const { theme } = useContext(ThemeContext);
  const [isThemeLoaded, setIsThemeLoaded] = useState(false);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem('theme') || 'light';
    document.documentElement.style.setProperty('--main-bg-color',
      savedTheme === 'light' ? 'var(--main-light-bg-color)' : 'var(--main-dark-bg-color)'
    );
    setIsThemeLoaded(true);
  }, []);

  useEffect(() => {
    if (isThemeLoaded) {
      document.documentElement.style.setProperty('--main-bg-color',
        theme === 'light' ? 'var(--main-light-bg-color)' : 'var(--main-dark-bg-color)'
      );
    }
  }, [theme, isThemeLoaded]);

  if (!isThemeLoaded) {
    return null;
  }

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', rowGap: '0px' }}>
        <Header />
        <Home />
      </div>
      <div className={`watermark ${theme === 'light' ? 'watermark-light' : 'watermark-dark'}`}></div>
    </>
  );
}

export default App;

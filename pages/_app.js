// pages/_app.js (updated)
import React, { useState, useEffect } from 'react';
import { CssVarsProvider } from '@mui/joy/styles';
import CssBaseline from '@mui/joy/CssBaseline';
import { createTheme, themeColors } from '../lib/theme';
import { SessionProvider } from 'next-auth/react';
import '../lib/i18n';

function MyApp({ Component, pageProps: { session, ...pageProps } }) {
  const [theme, setTheme] = useState('purple');
  const [mode, setMode] = useState('light');
  
  useEffect(() => {
    // Check local storage for theme preferences
    const savedTheme = localStorage.getItem('theme') || 'purple';
    const savedMode = localStorage.getItem('mode') || 'light';
    
    setTheme(savedTheme);
    setMode(savedMode);
    
    // Set up event listener for theme changes
    const handleThemeChange = (e) => {
      setTheme(e.detail);
      localStorage.setItem('theme', e.detail);
    };
    
    document.addEventListener('themeChange', handleThemeChange);
    
    return () => {
      document.removeEventListener('themeChange', handleThemeChange);
    };
  }, []);
  
  // Create the MUI Joy theme with our custom theme
  const joyTheme = createTheme(theme, mode);
  
  return (
    <SessionProvider session={session}>
      <CssVarsProvider theme={joyTheme} defaultMode={mode}>
        <CssBaseline />
        <Component {...pageProps} />
      </CssVarsProvider>
    </SessionProvider>
  );
}

export default MyApp;
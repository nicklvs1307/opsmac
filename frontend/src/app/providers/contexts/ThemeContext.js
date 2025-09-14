import React, { createContext, useState, useMemo, useContext, useEffect } from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import { appBarDrawerTheme } from './theme/appBarDrawerTheme';
import { cssBaselineTheme } from './theme/cssBaselineTheme';
import { buttonTheme } from './theme/buttonTheme';
import { cardTheme } from './theme/cardTheme';
import { paperTheme } from './theme/paperTheme';
import { formTheme } from './theme/formTheme';
import { listTheme } from './theme/listTheme';
import { dividerTheme } from './theme/dividerTheme';
import { dialogTheme } from './theme/dialogTheme';
import { tableTheme } from './theme/tableTheme';
import { tooltipTheme } from './theme/tooltipTheme';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [mode, setMode] = useState(() => {
    // Tenta carregar o tema do localStorage, ou usa 'light' como padrão
    return localStorage.getItem('themeMode') || 'light';
  });

  useEffect(() => {
    // Salva o tema no localStorage sempre que ele muda
    localStorage.setItem('themeMode', mode);
  }, [mode]);

  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: '#D32F2F', // Red 700
            light: '#FF5252', // Red A200
            dark: '#B71C1C', // Red 900
            contrastText: '#ffffff',
          },
          secondary: {
            main: '#dc004e',
            light: '#ff5c8d',
            dark: '#9a0036',
            contrastText: '#ffffff',
          },
          success: {
            main: '#4caf50',
            light: '#80e27e',
            dark: '#087f23',
          },
          warning: {
            main: '#ff9800',
            light: '#ffc947',
            dark: '#c66900',
          },
          error: {
            main: '#f44336',
            light: '#ff7961',
            dark: '#ba000d',
          },
          info: {
            main: '#2196f3',
            light: '#64b5f6',
            dark: '#0b79d0',
          },
          background: {
            default: mode === 'light' ? '#f8f9fa' : '#121212',
            paper: mode === 'light' ? '#ffffff' : '#1e1e1e',
            card: mode === 'light' ? '#ffffff' : '#2d2d2d',
          },
          text: {
            primary: mode === 'light' ? '#2c3e50' : '#e0e0e0',
            secondary: mode === 'light' ? '#7f8c8d' : '#aaaaaa',
            disabled: mode === 'light' ? '#bdc3c7' : '#666666',
          },
          divider: mode === 'light' ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.08)',
        },
        typography: {
          fontSize: 12.8, // Adjusted for 80% scale
          fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
          h1: {
            fontWeight: 700,
            fontSize: '2.5rem',
            lineHeight: 1.2,
          },
          h2: {
            fontWeight: 700,
            fontSize: '2rem',
            lineHeight: 1.3,
          },
          h3: {
            fontWeight: 600,
            fontSize: '1.75rem',
            lineHeight: 1.3,
          },
          h4: {
            fontWeight: 600,
            fontSize: '1.5rem',
            lineHeight: 1.4,
          },
          h5: {
            fontWeight: 600,
            fontSize: '1.25rem',
            lineHeight: 1.4,
          },
          h6: {
            fontWeight: 600,
            fontSize: '1rem',
            lineHeight: 1.5,
          },
          subtitle1: {
            fontWeight: 500,
            fontSize: '1rem',
            lineHeight: 1.5,
          },
          subtitle2: {
            fontWeight: 500,
            fontSize: '0.875rem',
            lineHeight: 1.5,
          },
          body1: {
            fontSize: '1rem',
            lineHeight: 1.5,
          },
          body2: {
            fontSize: '0.875rem',
            lineHeight: 1.5,
          },
          button: {
            fontWeight: 500,
            fontSize: '0.875rem',
            textTransform: 'none',
          },
          caption: {
            fontSize: '0.75rem',
            lineHeight: 1.5,
          },
        },
        spacing: 6, // Adjusted for overall element size reduction
        shape: {
          borderRadius: 10,
        },
        shadows: [
          'none',
          '0 2px 4px rgba(0,0,0,0.05)',
          '0 4px 8px rgba(0,0,0,0.08)',
          '0 6px 12px rgba(0,0,0,0.1)',
          '0 8px 16px rgba(0,0,0,0.12)',
          '0 10px 20px rgba(0,0,0,0.15)',
          '0 12px 24px rgba(0,0,0,0.18)',
          '0 14px 28px rgba(0,0,0,0.2)',
          '0 16px 32px rgba(0,0,0,0.22)',
          '0 18px 36px rgba(0,0,0,0.25)',
          '0 20px 40px rgba(0,0,0,0.28)',
          '0 22px 44px rgba(0,0,0,0.3)',
          '0 24px 48px rgba(0,0,0,0.32)',
          '0 26px 52px rgba(0,0,0,0.35)',
          '0 28px 56px rgba(0,0,0,0.38)',
          '0 30px 60px rgba(0,0,0,0.4)',
          '0 32px 64px rgba(0,0,0,0.42)',
          '0 34px 68px rgba(0,0,0,0.45)',
          '0 36px 72px rgba(0,0,0,0.48)',
          '0 38px 76px rgba(0,0,0,0.5)',
          '0 40px 80px rgba(0,0,0,0.52)',
          '0 42px 84px rgba(0,0,0,0.55)',
          '0 44px 88px rgba(0,0,0,0.58)',
          '0 46px 92px rgba(0,0,0,0.6)',
          '0 48px 96px rgba(0,0,0,0.62)',
        ],
        components: {
          ...appBarDrawerTheme(mode),
          ...cssBaselineTheme(mode),
          ...buttonTheme(mode),
          ...cardTheme(mode),
          ...paperTheme(mode),
          ...formTheme(mode),
          ...listTheme(mode),
          ...dividerTheme(mode),
          ...dialogTheme(mode),
          ...tableTheme(mode),
          ...tooltipTheme(mode),
          MuiSwitch: {
            styleOverrides: {
              root: {
                width: 42,
                height: 26,
                padding: 0,
                margin: 8,
              },
              switchBase: {
                padding: 1,
                '&.Mui-checked': {
                  transform: 'translateX(16px)',
                  color: '#fff',
                  '& + .MuiSwitch-track': {
                    backgroundColor: mode === 'light' ? '#D32F2F' : '#FF5252',
                    opacity: 1,
                    border: 'none',
                  },
                },
                '&.Mui-focusVisible .MuiSwitch-thumb': {
                  color: '#D32F2F',
                  border: '6px solid #fff',
                },
              },
              thumb: {
                width: 24,
                height: 24,
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
              },
              track: {
                borderRadius: 26 / 2,
                backgroundColor: mode === 'light' ? '#bdc3c7' : '#666666',
                opacity: 1,
                transition: 'background-color 0.3s ease',
              },
            },
          },
        },
      }),
    [mode]
  );

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

export const useThemeMode = () => useContext(ThemeContext);
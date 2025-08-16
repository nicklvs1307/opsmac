import React, { createContext, useState, useMemo, useContext, useEffect } from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider, alpha } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

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

  const theme = useMemo(() =>
    createTheme({
      palette: {
        mode,
        primary: {
          main: '#1976d2',
          light: '#42a5f5',
          dark: '#1565c0',
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
        fontSize: 14, // Reverted to Material UI default
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
      spacing: 8, // Reverted to Material UI default
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
        MuiCssBaseline: {
          styleOverrides: {
            body: {
              scrollbarWidth: 'thin',
              scrollbarColor: mode === 'light' ? '#bdc3c7 #f5f5f5' : '#666666 #303030',
              '&::-webkit-scrollbar': {
                width: '8px',
                height: '8px',
              },
              '&::-webkit-scrollbar-track': {
                background: mode === 'light' ? '#f5f5f5' : '#303030',
              },
              '&::-webkit-scrollbar-thumb': {
                background: mode === 'light' ? '#bdc3c7' : '#666666',
                borderRadius: '4px',
              },
              '&::-webkit-scrollbar-thumb:hover': {
                background: mode === 'light' ? '#95a5a6' : '#888888',
              },
            },
          },
        },
        MuiButton: {
          styleOverrides: {
            root: {
              textTransform: 'none',
              borderRadius: 10,
              fontWeight: 500,
              boxShadow: mode === 'light' ? '0 2px 4px rgba(0,0,0,0.08)' : '0 2px 4px rgba(0,0,0,0.2)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: mode === 'light' ? '0 4px 8px rgba(0,0,0,0.12)' : '0 4px 8px rgba(0,0,0,0.3)',
              },
              '&:active': {
                transform: 'translateY(0)',
              },
            },
            contained: {
              '&.Mui-disabled': {
                backgroundColor: mode === 'light' ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.08)',
                color: mode === 'light' ? 'rgba(0, 0, 0, 0.38)' : 'rgba(255, 255, 255, 0.38)',
              },
            },
            outlined: {
              borderWidth: '1.5px',
              '&:hover': {
                borderWidth: '1.5px',
              },
            },
            containedPrimary: {
              background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #1565c0 0%, #1976d2 100%)',
              },
            },
            containedSecondary: {
              background: 'linear-gradient(135deg, #dc004e 0%, #ff4081 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #9a0036 0%, #dc004e 100%)',
              },
            },
            sizeSmall: {
              padding: '6px 16px',
              fontSize: '0.8125rem',
            },
            sizeMedium: {
              padding: '8px 20px',
            },
            sizeLarge: {
              padding: '10px 24px',
              fontSize: '0.9375rem',
            },
          },
        },
        MuiCard: {
          styleOverrides: {
            root: {
              borderRadius: 16,
              boxShadow: mode === 'light' ? '0 4px 20px rgba(0,0,0,0.08)' : '0 4px 20px rgba(0,0,0,0.4)',
              overflow: 'hidden',
              transition: 'all 0.3s ease',
              border: `1px solid ${mode === 'light' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)'}`,
              '&:hover': {
                boxShadow: mode === 'light' ? '0 8px 30px rgba(0,0,0,0.12)' : '0 8px 30px rgba(0,0,0,0.5)',
              },
            },
          },
        },
        MuiCardHeader: {
          styleOverrides: {
            root: {
              padding: '20px 24px',
              background: mode === 'light' ? 'linear-gradient(to right, rgba(25, 118, 210, 0.05), transparent)' : 'linear-gradient(to right, rgba(25, 118, 210, 0.15), transparent)',
              borderBottom: `1px solid ${mode === 'light' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)'}`,
            },
            title: {
              fontWeight: 600,
              fontSize: '1.125rem',
            },
            subheader: {
              color: mode === 'light' ? '#7f8c8d' : '#aaaaaa',
              fontSize: '0.875rem',
            },
          },
        },
        MuiCardContent: {
          styleOverrides: {
            root: {
              padding: '24px',
              '&:last-child': {
                paddingBottom: '24px',
              },
            },
          },
        },
        MuiCardActions: {
          styleOverrides: {
            root: {
              padding: '16px 24px',
              borderTop: `1px solid ${mode === 'light' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)'}`,
            },
          },
        },
        MuiPaper: {
          styleOverrides: {
            root: {
              borderRadius: 16,
              boxShadow: mode === 'light' ? '0 4px 20px rgba(0,0,0,0.08)' : '0 4px 20px rgba(0,0,0,0.4)',
              transition: 'all 0.3s ease',
              border: `1px solid ${mode === 'light' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)'}`,
            },
            elevation1: {
              boxShadow: mode === 'light' ? '0 2px 8px rgba(0,0,0,0.08)' : '0 2px 8px rgba(0,0,0,0.3)',
            },
            elevation2: {
              boxShadow: mode === 'light' ? '0 4px 12px rgba(0,0,0,0.1)' : '0 4px 12px rgba(0,0,0,0.35)',
            },
            elevation3: {
              boxShadow: mode === 'light' ? '0 6px 16px rgba(0,0,0,0.12)' : '0 6px 16px rgba(0,0,0,0.4)',
            },
            elevation4: {
              boxShadow: mode === 'light' ? '0 8px 20px rgba(0,0,0,0.15)' : '0 8px 20px rgba(0,0,0,0.45)',
            },
            elevation5: {
              boxShadow: mode === 'light' ? '0 10px 24px rgba(0,0,0,0.18)' : '0 10px 24px rgba(0,0,0,0.5)',
            },
          },
        },
        MuiTextField: {
          styleOverrides: {
            root: {
              '& .MuiOutlinedInput-root': {
                borderRadius: 10,
                transition: 'all 0.3s ease',
                '& fieldset': {
                  borderColor: mode === 'light' ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.15)',
                  transition: 'all 0.3s ease',
                },
                '&:hover fieldset': {
                  borderColor: mode === 'light' ? 'rgba(25, 118, 210, 0.5)' : 'rgba(66, 165, 245, 0.5)',
                  boxShadow: mode === 'light' ? '0 0 0 4px rgba(25, 118, 210, 0.08)' : '0 0 0 4px rgba(66, 165, 245, 0.08)',
                },
                '&.Mui-focused fieldset': {
                  borderWidth: '2px',
                  boxShadow: mode === 'light' ? '0 0 0 4px rgba(25, 118, 210, 0.15)' : '0 0 0 4px rgba(66, 165, 245, 0.15)',
                },
              },
            },
          },
        },
        MuiSelect: {
          styleOverrides: {
            outlined: {
              borderRadius: 10,
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: mode === 'light' ? 'rgba(25, 118, 210, 0.5)' : 'rgba(66, 165, 245, 0.5)',
                boxShadow: mode === 'light' ? '0 0 0 4px rgba(25, 118, 210, 0.08)' : '0 0 0 4px rgba(66, 165, 245, 0.08)',
              },
            },
          },
        },
        MuiMenuItem: {
          styleOverrides: {
            root: {
              borderRadius: 8,
              margin: '2px 4px',
              padding: '8px 12px',
              '&.Mui-selected': {
                backgroundColor: mode === 'light' ? 'rgba(25, 118, 210, 0.08)' : 'rgba(66, 165, 245, 0.08)',
                '&:hover': {
                  backgroundColor: mode === 'light' ? 'rgba(25, 118, 210, 0.12)' : 'rgba(66, 165, 245, 0.12)',
                },
              },
              '&:hover': {
                backgroundColor: mode === 'light' ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.04)',
              },
            },
          },
        },
        MuiListItem: {
          styleOverrides: {
            root: {
              borderRadius: 8,
              '&.Mui-selected': {
                backgroundColor: mode === 'light' ? 'rgba(25, 118, 210, 0.08)' : 'rgba(66, 165, 245, 0.08)',
                '&:hover': {
                  backgroundColor: mode === 'light' ? 'rgba(25, 118, 210, 0.12)' : 'rgba(66, 165, 245, 0.12)',
                },
              },
            },
          },
        },
        MuiListItemButton: {
          styleOverrides: {
            root: {
              borderRadius: 8,
              transition: 'all 0.2s ease',
              '&:hover': {
                backgroundColor: mode === 'light' ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.04)',
                transform: 'translateX(4px)',
              },
              '&.Mui-selected': {
                backgroundColor: mode === 'light' ? 'rgba(25, 118, 210, 0.12)' : 'rgba(66, 165, 245, 0.12)',
                '&:hover': {
                  backgroundColor: mode === 'light' ? 'rgba(25, 118, 210, 0.16)' : 'rgba(66, 165, 245, 0.16)',
                },
              },
            },
          },
        },
        MuiDivider: {
          styleOverrides: {
            root: {
              borderColor: mode === 'light' ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.08)',
              margin: '16px 0',
            },
          },
        },
        MuiAlert: {
          styleOverrides: {
            root: {
              borderRadius: 10,
              boxShadow: mode === 'light' ? '0 2px 8px rgba(0,0,0,0.08)' : '0 2px 8px rgba(0,0,0,0.3)',
              border: `1px solid ${mode === 'light' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)'}`,
            },
            standardSuccess: {
              backgroundColor: mode === 'light' ? 'rgba(76, 175, 80, 0.1)' : 'rgba(76, 175, 80, 0.15)',
              color: mode === 'light' ? '#2e7d32' : '#81c784',
            },
            standardInfo: {
              backgroundColor: mode === 'light' ? 'rgba(33, 150, 243, 0.1)' : 'rgba(33, 150, 243, 0.15)',
              color: mode === 'light' ? '#0277bd' : '#64b5f6',
            },
            standardWarning: {
              backgroundColor: mode === 'light' ? 'rgba(255, 152, 0, 0.1)' : 'rgba(255, 152, 0, 0.15)',
              color: mode === 'light' ? '#ef6c00' : '#ffb74d',
            },
            standardError: {
              backgroundColor: mode === 'light' ? 'rgba(244, 67, 54, 0.1)' : 'rgba(244, 67, 54, 0.15)',
              color: mode === 'light' ? '#d32f2f' : '#e57373',
            },
          },
        },
        MuiAvatar: {
          styleOverrides: {
            root: {
              boxShadow: mode === 'light' ? '0 2px 8px rgba(0,0,0,0.1)' : '0 2px 8px rgba(0,0,0,0.3)',
            },
          },
        },
        MuiChip: {
          styleOverrides: {
            root: {
              borderRadius: 16,
              transition: 'all 0.2s ease',
              '&:hover': {
                boxShadow: mode === 'light' ? '0 2px 4px rgba(0,0,0,0.1)' : '0 2px 4px rgba(0,0,0,0.3)',
              },
            },
            colorPrimary: {
              backgroundColor: mode === 'light' ? 'rgba(25, 118, 210, 0.12)' : 'rgba(66, 165, 245, 0.12)',
              color: mode === 'light' ? '#1976d2' : '#42a5f5',
              '&:hover': {
                backgroundColor: mode === 'light' ? 'rgba(25, 118, 210, 0.18)' : 'rgba(66, 165, 245, 0.18)',
              },
            },
            colorSecondary: {
              backgroundColor: mode === 'light' ? 'rgba(220, 0, 78, 0.12)' : 'rgba(255, 64, 129, 0.12)',
              color: mode === 'light' ? '#dc004e' : '#ff4081',
              '&:hover': {
                backgroundColor: mode === 'light' ? 'rgba(220, 0, 78, 0.18)' : 'rgba(255, 64, 129, 0.18)',
              },
            },
            outlined: {
              borderWidth: '1.5px',
              '&:hover': {
                borderWidth: '1.5px',
              },
            },
          },
        },
        MuiDialog: {
          styleOverrides: {
            paper: {
              borderRadius: 16,
              boxShadow: mode === 'light' ? '0 8px 32px rgba(0,0,0,0.15)' : '0 8px 32px rgba(0,0,0,0.5)',
              backgroundImage: mode === 'light' ? 'linear-gradient(to bottom, rgba(255,255,255,0.95), rgba(255,255,255,1) 20%)' : 'linear-gradient(to bottom, rgba(30,30,30,0.95), rgba(30,30,30,1) 20%)',
            },
          },
        },
        MuiDialogTitle: {
          styleOverrides: {
            root: {
              padding: '20px 24px',
              fontSize: '1.25rem',
              fontWeight: 600,
            },
          },
        },
        MuiDialogContent: {
          styleOverrides: {
            root: {
              padding: '12px 24px 20px',
            },
          },
        },
        MuiDialogActions: {
          styleOverrides: {
            root: {
              padding: '12px 24px 20px',
            },
          },
        },
        MuiTableContainer: {
          styleOverrides: {
            root: {
              borderRadius: 12,
              boxShadow: mode === 'light' ? '0 2px 8px rgba(0,0,0,0.08)' : '0 2px 8px rgba(0,0,0,0.3)',
              border: `1px solid ${mode === 'light' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)'}`,
              overflow: 'hidden',
            },
          },
        },
        MuiTableHead: {
          styleOverrides: {
            root: {
              backgroundColor: mode === 'light' ? 'rgba(25, 118, 210, 0.05)' : 'rgba(66, 165, 245, 0.05)',
              '& .MuiTableCell-head': {
                fontWeight: 600,
                color: mode === 'light' ? '#2c3e50' : '#e0e0e0',
              },
            },
          },
        },
        MuiTableRow: {
          styleOverrides: {
            root: {
              '&:last-child td': {
                borderBottom: 0,
              },
              '&:hover': {
                backgroundColor: mode === 'light' ? 'rgba(0, 0, 0, 0.02)' : 'rgba(255, 255, 255, 0.02)',
              },
            },
          },
        },
        MuiTableCell: {
          styleOverrides: {
            root: {
              borderColor: mode === 'light' ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.08)',
              padding: '16px',
            },
          },
        },
        MuiTooltip: {
          styleOverrides: {
            tooltip: {
              backgroundColor: mode === 'light' ? 'rgba(44, 62, 80, 0.9)' : 'rgba(224, 224, 224, 0.9)',
              color: mode === 'light' ? '#ffffff' : '#121212',
              fontSize: '0.75rem',
              borderRadius: 6,
              boxShadow: mode === 'light' ? '0 2px 8px rgba(0,0,0,0.15)' : '0 2px 8px rgba(0,0,0,0.5)',
              padding: '8px 12px',
            },
            arrow: {
              color: mode === 'light' ? 'rgba(44, 62, 80, 0.9)' : 'rgba(224, 224, 224, 0.9)',
            },
          },
        },
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
                  backgroundColor: mode === 'light' ? '#1976d2' : '#42a5f5',
                  opacity: 1,
                  border: 'none',
                },
              },
              '&.Mui-focusVisible .MuiSwitch-thumb': {
                color: '#1976d2',
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
    [mode],
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

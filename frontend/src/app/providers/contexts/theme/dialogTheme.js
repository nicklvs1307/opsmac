export const dialogTheme = (mode) => ({
  MuiDialog: {
    styleOverrides: {
      paper: {
        borderRadius: 16,
        boxShadow: mode === 'light' ? '0 8px 32px rgba(0,0,0,0.15)' : '0 8px 32px rgba(0,0,0,0.5)',
        backgroundImage:
          mode === 'light'
            ? 'linear-gradient(to bottom, rgba(255,255,255,0.95), rgba(255,255,255,1) 20%)'
            : 'linear-gradient(to bottom, rgba(30,30,30,0.95), rgba(30,30,30,1) 20%)',
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
});

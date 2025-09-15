const cardTheme = (mode) => ({
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: 16,
        boxShadow: mode === 'light' ? '0 4px 20px rgba(0,0,0,0.08)' : '0 4px 20px rgba(0,0,0,0.4)',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        border: `1px solid ${mode === 'light' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)'}`,
        '&:hover': {
          boxShadow:
            mode === 'light' ? '0 8px 30px rgba(0,0,0,0.12)' : '0 8px 30px rgba(0,0,0,0.5)',
        },
      },
    },
  },
  MuiCardHeader: {
    styleOverrides: {
      root: {
        padding: '20px 24px',
        background:
          mode === 'light'
            ? 'linear-gradient(to right, rgba(211, 47, 47, 0.05), transparent)'
            : 'linear-gradient(to right, rgba(211, 47, 47, 0.15), transparent)',
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
});

export default cardTheme;

const buttonTheme = (mode) => ({
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
        background: 'linear-gradient(135deg, #D32F2F 0%, #FF5252 100%)',
        '&:hover': {
          background: 'linear-gradient(135deg, #B71C1C 0%, #D32F2F 100%)',
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
});

export default buttonTheme;

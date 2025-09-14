const paperTheme = (mode) => ({
  MuiPaper: {
    styleOverrides: {
      root: {
        borderRadius: 16,
        boxShadow:
          mode === 'light' ? '0 4px 20px rgba(0,0,0,0.08)' : '0 4px 20px rgba(0,0,0,0.4)',
        transition: 'all 0.3s ease',
        border: `1px solid ${mode === 'light' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)'}`, 
      },
      elevation1: {
        boxShadow:
          mode === 'light' ? '0 2px 8px rgba(0,0,0,0.08)' : '0 2px 8px rgba(0,0,0,0.3)',
      },
      elevation2: {
        boxShadow:
          mode === 'light' ? '0 4px 12px rgba(0,0,0,0.1)' : '0 4px 12px rgba(0,0,0,0.35)',
      },
      elevation3: {
        boxShadow:
          mode === 'light' ? '0 6px 16px rgba(0,0,0,0.12)' : '0 6px 16px rgba(0,0,0,0.4)',
      },
      elevation4: {
        boxShadow:
          mode === 'light' ? '0 8px 20px rgba(0,0,0,0.15)' : '0 8px 20px rgba(0,0,0,0.45)',
      },
      elevation5: {
        boxShadow:
          mode === 'light' ? '0 10px 24px rgba(0,0,0,0.18)' : '0 10px 24px rgba(0,0,0,0.5)',
      },
    },
  },
});

export default paperTheme;

export const tooltipTheme = (mode) => ({
  MuiTooltip: {
    styleOverrides: {
      tooltip: {
        backgroundColor:
          mode === 'light' ? 'rgba(44, 62, 80, 0.9)' : 'rgba(224, 224, 224, 0.9)',
        color: mode === 'light' ? '#ffffff' : '#121212',
        fontSize: '0.75rem',
        borderRadius: 6,
        boxShadow:
          mode === 'light' ? '0 2px 8px rgba(0,0,0,0.15)' : '0 2px 8px rgba(0,0,0,0.5)',
        padding: '8px 12px',
      },
      arrow: {
        color: mode === 'light' ? 'rgba(44, 62, 80, 0.9)' : 'rgba(224, 224, 224, 0.9)',
      },
    },
  },
});
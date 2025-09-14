export const dividerTheme = (mode) => ({
  MuiDivider: {
    styleOverrides: {
      root: {
        borderColor: mode === 'light' ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.08)',
        margin: '16px 0',
      },
    },
  },
});
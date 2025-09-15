export const cssBaselineTheme = (mode) => ({
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
});

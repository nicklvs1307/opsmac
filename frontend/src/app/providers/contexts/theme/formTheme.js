const formTheme = (mode) => ({
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
            borderColor: mode === 'light' ? 'rgba(211, 47, 47, 0.5)' : 'rgba(255, 82, 82, 0.5)',
            boxShadow:
              mode === 'light'
                ? '0 0 0 4px rgba(211, 47, 47, 0.08)'
                : '0 0 0 4px rgba(255, 82, 82, 0.08)',
          },
          '&.Mui-focused fieldset': {
            borderWidth: '2px',
            boxShadow:
              mode === 'light'
                ? '0 0 0 4px rgba(211, 47, 47, 0.15)'
                : '0 0 0 4px rgba(255, 82, 82, 0.15)',
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
          borderColor: mode === 'light' ? 'rgba(211, 47, 47, 0.5)' : 'rgba(255, 82, 82, 0.5)',
          boxShadow:
            mode === 'light'
              ? '0 0 0 4px rgba(211, 47, 47, 0.08)'
              : '0 0 0 4px rgba(255, 82, 82, 0.08)',
        },
      },
    },
  },
});

export default formTheme;

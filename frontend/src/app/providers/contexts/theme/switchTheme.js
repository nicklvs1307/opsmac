export const switchTheme = (mode) => ({
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
});

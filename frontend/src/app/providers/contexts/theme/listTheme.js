export const listTheme = (mode) => ({
  MuiMenuItem: {
    styleOverrides: {
      root: {
        borderRadius: 8,
        margin: '2px 4px',
        padding: '8px 12px',
        '&.Mui-selected': {
          backgroundColor: mode === 'light' ? 'rgba(211, 47, 47, 0.08)' : 'rgba(255, 82, 82, 0.08)',
          '&:hover': {
            backgroundColor:
              mode === 'light' ? 'rgba(211, 47, 47, 0.12)' : 'rgba(255, 82, 82, 0.12)',
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
          backgroundColor: mode === 'light' ? 'rgba(211, 47, 47, 0.08)' : 'rgba(255, 82, 82, 0.08)',
          '&:hover': {
            backgroundColor:
              mode === 'light' ? 'rgba(211, 47, 47, 0.12)' : 'rgba(255, 82, 82, 0.12)',
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
          backgroundColor: mode === 'light' ? 'rgba(211, 47, 47, 0.12)' : 'rgba(255, 82, 82, 0.12)',
          '&:hover': {
            backgroundColor:
              mode === 'light' ? 'rgba(211, 47, 47, 0.16)' : 'rgba(255, 82, 82, 0.16)',
          },
        },
      },
    },
  },
});

export const appBarDrawerTheme = (mode) => ({
  MuiAppBar: {
    styleOverrides: {
      root: {
        boxShadow: 'none',
      },
    },
  },
  MuiToolbar: {
    styleOverrides: {
      root: {
        backgroundColor: mode === 'light' ? '#FFFFFF' : '#2D3748',
        color: mode === 'light' ? '#333333' : '#FFFFFF',
      },
    },
  },
  MuiDrawer: {
    styleOverrides: {
      paper: {
        backgroundColor: mode === 'light' ? '#FFFFFF' : '#2D3748',
        color: mode === 'light' ? '#333333' : '#FFFFFF',
      },
    },
  },
  MuiListItemButton: {
    styleOverrides: {
      root: {
        '&.Mui-selected': {
          backgroundColor:
            mode === 'light' ? 'rgba(0, 82, 180, 0.08)' : 'rgba(255, 255, 255, 0.08)',
          '&:hover': {
            backgroundColor:
              mode === 'light' ? 'rgba(0, 82, 180, 0.12)' : 'rgba(255, 255, 255, 0.12)',
          },
        },
      },
    },
  },
  MuiListItemIcon: {
    styleOverrides: {
      root: {
        minWidth: '40px',
        color: mode === 'light' ? '#666666' : '#CCCCCC',
      },
    },
  },
  MuiListItemText: {
    styleOverrides: {
      primary: {
        color: mode === 'light' ? '#333333' : '#FFFFFF',
      },
    },
  },
  MuiTooltip: {
    styleOverrides: {
      tooltip: {
        backgroundColor: mode === 'light' ? '#333333' : '#FFFFFF',
        color: mode === 'light' ? '#FFFFFF' : '#333333',
        fontSize: '0.8rem',
      },
    },
  },
});

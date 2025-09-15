export const tableTheme = (mode) => ({
  MuiTableContainer: {
    styleOverrides: {
      root: {
        borderRadius: 12,
        boxShadow: mode === 'light' ? '0 2px 8px rgba(0,0,0,0.08)' : '0 2px 8px rgba(0,0,0,0.3)',
        border: `1px solid ${mode === 'light' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)'}`,
        overflow: 'hidden',
      },
    },
  },
  MuiTableHead: {
    styleOverrides: {
      root: {
        backgroundColor: mode === 'light' ? 'rgba(211, 47, 47, 0.05)' : 'rgba(255, 82, 82, 0.05)',
        '& .MuiTableCell-head': {
          fontWeight: 600,
          color: mode === 'light' ? '#2c3e50' : '#e0e0e0',
        },
      },
    },
  },
  MuiTableRow: {
    styleOverrides: {
      root: {
        '&:last-child td': {
          borderBottom: 0,
        },
        '&:hover': {
          backgroundColor: mode === 'light' ? 'rgba(0, 0, 0, 0.02)' : 'rgba(255, 255, 255, 0.02)',
        },
      },
    },
  },
  MuiTableCell: {
    styleOverrides: {
      root: {
        borderColor: mode === 'light' ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.08)',
        padding: '16px',
      },
    },
  },
});

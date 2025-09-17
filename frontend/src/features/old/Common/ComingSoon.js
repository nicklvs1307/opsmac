import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const ComingSoon = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '80vh',
        backgroundColor: '#f0f2f5',
        padding: 3,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          padding: 4,
          textAlign: 'center',
          borderRadius: '10px',
          backgroundColor: '#ffffff',
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)',
        }}
      >
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          sx={{ color: '#3f51b5', fontWeight: 'bold' }}
        >
          Em Breve!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Estamos trabalhando duro para trazer esta funcionalidade para você.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Agradecemos a sua paciência.
        </Typography>
      </Paper>
    </Box>
  );
};

export default ComingSoon;

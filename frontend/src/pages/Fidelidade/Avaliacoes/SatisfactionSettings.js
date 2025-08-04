
import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const SatisfactionSettings = () => {
  return (
    <Box p={3}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Configurações de Satisfação
        </Typography>
        <Typography variant="body1">
          Esta seção será usada para configurar as pesquisas de satisfação, como definir pesquisas padrão, configurar gatilhos e outras opções.
        </Typography>
        {/* Add settings form fields here */}
      </Paper>
    </Box>
  );
};

export default SatisfactionSettings;

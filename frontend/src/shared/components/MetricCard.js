import React from 'react';
import { Paper, Typography } from '@mui/material';

const MetricCard = ({ title, value, color = 'text.secondary', variant = 'h3' }) => {
  return (
    <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
      <Typography variant="subtitle1" color={color}>
        {title}
      </Typography>
      <Typography variant={variant}>{value}</Typography>
    </Paper>
  );
};

export default MetricCard;

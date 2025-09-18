import React from 'react';
import { Paper, Box, Typography, Avatar } from '@mui/material';

const StatCard = ({ icon, title, value, color = 'primary' }) => {
  return (
    <Paper
      sx={{
        p: 2,
        display: 'flex',
        alignItems: 'center',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 6,
        },
      }}
    >
      <Avatar
        sx={{
          width: 56,
          height: 56,
          mr: 2,
          bgcolor: `${color}.light`,
          color: `${color}.main`,
        }}
      >
        {icon}
      </Avatar>
      <Box>
        <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
          {value}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {title}
        </Typography>
      </Box>
    </Paper>
  );
};

export default StatCard;

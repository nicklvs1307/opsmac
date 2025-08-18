import React from 'react';
import { Box, Typography, LinearProgress } from '@mui/material';
import { Restaurant as RestaurantIcon } from '@mui/icons-material';

const SurveyHeader = ({ title, description, logo, primaryColor, secondaryColor, accentColor, textColor, progress }) => {
  return (
    <Box
      sx={{
        background: primaryColor, // Main background for the header container
        paddingTop: '60px', // Space for the shape
        position: 'relative',
        overflow: 'hidden',
        borderTopLeftRadius: '16px',
        borderTopRightRadius: '16px',
      }}
    >
      {/* Header Shape (Capsule/Cut Circle) */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '120px', // Height of the shape
          background: primaryColor,
          borderBottomLeftRadius: '50% 80%', // Asymmetric curvature
          borderBottomRightRadius: '50% 80%',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        }}
      />

      {/* Header Content */}
      <Box sx={{ position: 'relative', zIndex: 2, textAlign: 'center', padding: '20px' }}>
        {/* Logo */}
        <Box
          sx={{
            width: '80px',
            height: '80px',
            background: 'white',
            borderRadius: '50%',
            margin: '-40px auto 15px', // Negative margin to pull it up over the shape
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: `4px solid ${accentColor}`,
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
          }}
        >
          {logo ? (
            <img
              src={logo}
              alt="Restaurant Logo"
              style={{
                width: '60px',
                height: '60px',
                objectFit: 'contain',
                borderRadius: '50%',
              }}
            />
          ) : (
            <RestaurantIcon sx={{ fontSize: 40, color: primaryColor }} />
          )}
        </Box>

        <Typography variant="h4" component="h1" sx={{ color: primaryColor, mb: '5px', fontSize: '28px' }}>
          {title}
        </Typography>
        <Typography variant="body1" sx={{ color: '#666', fontSize: '16px' }}>
          {description}
        </Typography>

        {/* Progress Bar - placed here as per example.html's first structure, but can be moved if needed */}
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            height: '6px',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            mt: '25px',
            borderRadius: '3px',
            '& .MuiLinearProgress-bar': {
              backgroundColor: 'white',
            },
          }}
        />
      </Box>
    </Box>
  );
};

export default SurveyHeader;
import React from 'react';
import { Box, Typography, LinearProgress } from '@mui/material';
import { Restaurant as RestaurantIcon } from '@mui/icons-material';

const SurveyHeader = ({ title, description, logo, primaryColor, secondaryColor, textColor, progress }) => {
  return (
    <Box
      sx={{
        background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
        color: textColor,
        padding: '30px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
        borderTopLeftRadius: '16px',
        borderTopRightRadius: '16px',
      }}
    >
      {/* Circular Header Effect (Top Half) */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%) translateY(-50%)',
          width: '150px', // Adjust size as needed
          height: '150px', // Adjust size as needed
          borderRadius: '50%',
          backgroundColor: 'white', // Background for the circle
          zIndex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
          border: `4px solid ${primaryColor}`,
        }}
      >
        {logo ? (
          <img
            src={logo}
            alt="Restaurant Logo"
            style={{
              width: '80px',
              height: '80px',
              objectFit: 'contain',
              borderRadius: '50%',
            }}
          />
        ) : (
          <RestaurantIcon sx={{ fontSize: 60, color: primaryColor }} />
        )}
      </Box>

      {/* Content below the circle */}
      <Box sx={{ position: 'relative', zIndex: 2, pt: '75px' }}> {/* pt to push content below the circle */}
        <Typography variant="h4" component="h1" sx={{ fontSize: '28px', fontWeight: 700, mb: '10px' }}>
          {title}
        </Typography>
        <Typography variant="body1" sx={{ fontWeight: 300, opacity: 0.9, maxWidth: '600px', mx: 'auto' }}>
          {description}
        </Typography>
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
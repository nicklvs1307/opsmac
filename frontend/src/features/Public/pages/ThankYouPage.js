import React from 'react';
import { Box, Container, Typography } from '@mui/material';
import { useLocation } from 'react-router-dom';
import ThankYouCard from '@/components/UI/ThankYouCard';
import { useTranslation } from 'react-i18next';

const ThankYou = () => {
  const location = useLocation();
  const { t } = useTranslation();
  const { restaurant, rating, customerName, reward } = location.state || {};

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Avaliei o ${restaurant}`,
        text: `Acabei de avaliar minha experiência no ${restaurant} com ${rating} estrelas!`,
        url: window.location.origin,
      });
    } else {
      // Fallback for browsers that don't support Web Share API
      const text = t('thank_you.share_fallback_text', { restaurant, rating });
      const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
      window.open(url, '_blank');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%)', // Gradiente suave para melhor aparência
        py: { xs: 4, sm: 6, md: 8 },
        px: 2, // Padding horizontal para mobile
      }}
    >
      {/* Logo ou ícone do restaurante */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>
        <img
          src="/logo192.png"
          alt="Logo"
          style={{
            height: '70px',
            width: 'auto',
            filter: 'drop-shadow(0px 4px 8px rgba(0, 0, 0, 0.15))',
          }}
        />
      </Box>

      <Container maxWidth="md">
        <Box py={4}>
          <ThankYouCard
            customerName={customerName}
            restaurant={restaurant}
            rating={rating}
            reward={reward}
            onShare={handleShare}
          />
        </Box>

        <Box
          textAlign="center"
          mt={4}
          sx={{ opacity: 0.8, transition: 'opacity 0.3s ease', '&:hover': { opacity: 1 } }}
        >
          <Typography
            variant="caption"
            color="text.disabled"
            sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}
          >
            <span>Powered by</span>
            <span
              style={{
                fontWeight: 'bold',
                background: 'linear-gradient(45deg, #3f51b5 30%, #2196f3 90%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Sistema de Feedback
            </span>
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default ThankYou;

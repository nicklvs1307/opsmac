import React from 'react';
import { Container, Box } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import ThankYouCard from '../../components/UI/ThankYouCard';
import { useTranslation } from 'react-i18next';

const ThankYou = () => {
  const location = useLocation();
  const navigate = useNavigate();
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
  
  const handleHome = () => {
    navigate('/');
  };

  return (
    <Container maxWidth="md">
      <Box py={8}>
        <ThankYouCard
          customerName={customerName}
          restaurant={restaurant}
          rating={rating}
          reward={reward}
          onShare={handleShare}
          onHome={handleHome}
        />
      </Box>
    </Container>
  );
};

export default ThankYou;
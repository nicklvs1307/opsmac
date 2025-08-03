import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Paper, Container, CircularProgress } from '@mui/material';
import { useTranslation } from 'react-i18next';
import axiosInstance from '../../api/axiosInstance';
import toast from 'react-hot-toast';
import SpinTheWheel from '../../components/UI/SpinTheWheel';

const GirarRoleta = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { reward_earned } = location.state || {};

  const [loading, setLoading] = useState(false);
  const [winningItem, setWinningItem] = useState(null);
  const [apiResponseRewardEarned, setApiResponseRewardEarned] = useState(null);
  const [finalReward, setFinalReward] = useState(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [winningIndex, setWinningIndex] = useState(-1);

  if (!reward_earned || !reward_earned.wheel_config) {
    return (
      <Container component={Paper} sx={{ p: 4, mt: 5, textAlign: 'center' }}>
        <Typography variant="h6" color="error">{t('girar_roleta.error_no_reward')}</Typography>
      </Container>
    );
  }

  const handleSpinClick = async () => {
    setLoading(true);
    setIsSpinning(true);
    try {
      const response = await axiosInstance.post('/api/rewards/spin-wheel', {
        reward_id: reward_earned.reward_id,
        customer_id: reward_earned.customer_id,
      });
      setWinningItem(response.data.wonItem);
      setApiResponseRewardEarned(response.data.reward_earned);
      setLoading(false); // Stop loading here, as animation will start
      
      // Usar o winningIndex diretamente do backend
      setWinningIndex(response.data.winningIndex);

    } catch (err) {
      console.error('Error spinning wheel:', err);
      toast.error(err.response?.data?.message || t('girar_roleta.error_spinning'));
      setLoading(false);
      setIsSpinning(false);
    }
  };

  const handleAnimationComplete = () => {
    setFinalReward(apiResponseRewardEarned);
    toast.success(t('girar_roleta.win_message'));
    navigate('/recompensa-ganha', { state: { reward_earned: apiResponseRewardEarned } });
    setIsSpinning(false); // Animation complete, allow spinning again if needed
  };

  return (
    <Container component={Paper} elevation={3} sx={{ p: 4, mt: 5 }}>
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>{reward_earned.reward_title || t('girar_roleta.title')}</Typography>
        <Typography variant="body1" color="text.secondary">{reward_earned.description || t('girar_roleta.description')}</Typography>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <SpinTheWheel
          items={reward_earned.wheel_config.items}
          winningItem={winningItem}
          winningIndex={winningIndex} // Passando o winningIndex para o componente SpinTheWheel
          onAnimationComplete={handleAnimationComplete}
        />
      </Box>

      <Box sx={{ textAlign: 'center' }}>
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={handleSpinClick}
          disabled={isSpinning || loading}
        >
          {loading && !winningItem ? <CircularProgress size={24} /> : t('girar_roleta.spin_button')}
        </Button>
      </Box>
    </Container>
  );
};

export default GirarRoleta;

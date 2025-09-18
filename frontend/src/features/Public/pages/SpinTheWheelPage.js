import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Paper, Container, CircularProgress, Alert } from '@mui/material';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import SpinTheWheel from '@/components/UI/SpinTheWheel';
import { useGetPublicReward, useSpinTheWheel } from '../api/publicQueries';

const GirarRoleta = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { responseId, rewardId } = location.state || {}; // Obter rewardId do state

  const [winningItem, setWinningItem] = useState(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [winningIndex, setWinningIndex] = useState(-1);

  const {
    data: rewardData,
    isLoading: isLoadingReward,
    isError: isErrorReward,
    error: rewardError,
  } = useGetPublicReward(rewardId); // Usar o hook real

  const spinWheelMutation = useSpinTheWheel(); // Usar o hook real

  const reward_earned = rewardData?.reward; // Ajustar para o formato da resposta do backend

  useEffect(() => {
    if (rewardError) {
      toast.error(rewardError.message || t('girar_roleta.error_fetching_reward'));
    }
  }, [rewardError, t]);

  if (isLoadingReward) {
    return (
      <Container component={Paper} sx={{ p: 4, mt: 5, textAlign: 'center' }}>
        <CircularProgress />
        <Typography>{t('girar_roleta.loading_reward')}</Typography>
      </Container>
    );
  }

  if (isErrorReward || !reward_earned || !reward_earned.wheel_config) {
    return (
      <Container component={Paper} sx={{ p: 4, mt: 5, textAlign: 'center' }}>
        <Typography variant="h6" color="error">
          {rewardError?.message || t('girar_roleta.error_no_reward')}
        </Typography>
        {isErrorReward && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {rewardError.message}
          </Alert>
        )}
      </Container>
    );
  }

  const handleSpinClick = () => {
    setIsSpinning(true);
    spinWheelMutation.mutate( // Usar a mutação real
      { response_id: responseId, reward_id: rewardId }, // Passar reward_id
      {
        onSuccess: (data) => {
          const wonItem = data.wonItem; // Assumindo que o backend retorna o item vencedor
          const winningIndex = reward_earned.wheel_config.items.findIndex(
            (item) => item.id === wonItem.id
          ); // Encontrar o índice do item vencedor
          setWinningItem(wonItem);
          setWinningIndex(winningIndex);
        },
        onError: (error) => {
          toast.error(error.response?.data?.msg || t('girar_roleta.error_claiming_reward'));
          setIsSpinning(false);
        },
      }
    );
  };

  const handleAnimationComplete = () => {
    toast.success(t('girar_roleta.win_message'));
    navigate('/recompensa-ganha', {
      state: { reward_earned: spinWheelMutation.data?.reward_earned }, // Usar dados da mutação real
    });
    setIsSpinning(false);
  };

  return (
    <Container component={Paper} elevation={3} sx={{ p: 4, mt: 5 }}>
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {reward_earned.reward_title || t('girar_roleta.title')}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {reward_earned.description || t('girar_roleta.description')}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <SpinTheWheel
          items={reward_earned.wheel_config.items}
          winningItem={winningItem}
          winningIndex={winningIndex}
          onAnimationComplete={handleAnimationComplete}
        />
      </Box>

      <Box sx={{ textAlign: 'center' }}>
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={handleSpinClick}
          disabled={isSpinning || spinWheelMutation.isLoading}
        >
          {spinWheelMutation.isLoading ? (
            <CircularProgress size={24} />
          ) : (
            t('girar_roleta.spin_button')
          )}
        </Button>
      </Box>
    </Container>
  );
};

export default GirarRoleta;

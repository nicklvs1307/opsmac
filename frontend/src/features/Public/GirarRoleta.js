import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Paper, Container, CircularProgress, Alert } from '@mui/material';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import SpinTheWheel from '@/components/UI/SpinTheWheel';
// import { useGetPublicReward, useClaimReward } from '../api/publicService'; // Commented out due to missing exports

const GirarRoleta = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { responseId } = location.state || {};

  const [winningItem, setWinningItem] = useState(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [winningIndex, setWinningIndex] = useState(-1);

  // Temporarily mock rewardData and claimRewardMutation
  const rewardData = {
    reward_earned: {
      reward_title: t('girar_roleta.mock_title'),
      description: t('girar_roleta.mock_description'),
      wheel_config: {
        items: [
          { option: t('girar_roleta.mock_item_1'), color: '#FFD700' },
          { option: t('girar_roleta.mock_item_2'), color: '#ADFF2F' },
          { option: t('girar_roleta.mock_item_3'), color: '#87CEEB' },
          { option: t('girar_roleta.mock_item_4'), color: '#FF6347' },
        ],
      },
    },
  };
  const isLoadingReward = false;
  const isErrorReward = false;
  const rewardError = null;

  const claimRewardMutation = {
    isLoading: false,
    mutate: ({ response_id }, { onSuccess, onError }) => {
      // Simulate API call
      setTimeout(() => {
        const randomIndex = Math.floor(
          Math.random() * rewardData.reward_earned.wheel_config.items.length
        );
        const wonItem = rewardData.reward_earned.wheel_config.items[randomIndex];
        onSuccess({ wonItem, winningIndex: randomIndex });
      }, 1000);
    },
    data: { reward_earned: rewardData.reward_earned }, // Mock data for navigation
  };

  const reward_earned = rewardData?.reward_earned;

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
    claimRewardMutation.mutate(
      { response_id: responseId },
      {
        onSuccess: (data) => {
          setWinningItem(data.wonItem);
          setWinningIndex(data.winningIndex);
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
      state: { reward_earned: claimRewardMutation.data?.reward_earned },
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
          disabled={isSpinning || claimRewardMutation.isLoading}
        >
          {claimRewardMutation.isLoading ? (
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

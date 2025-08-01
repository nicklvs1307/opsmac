import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Paper, Container, CircularProgress } from '@mui/material';
import { useTranslation } from 'react-i18next';
import axiosInstance from '../../api/axiosInstance';
import toast from 'react-hot-toast';
import SpinTheWheel from '../../components/UI/SpinTheWheel'; // Verifique o caminho

const GirarRoleta = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { reward_earned } = location.state || {};

  const [loading, setLoading] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);

  if (!reward_earned || !reward_earned.wheel_config) {
    return (
      <Container component={Paper} sx={{ p: 4, mt: 5, textAlign: 'center' }}>
        <Typography variant="h6" color="error">
          {t('girar_roleta.error_no_reward')}
        </Typography>
      </Container>
    );
  }

  const handleSpinFinish = async (wonItem) => {
    try {
      setLoading(true);
      const payload = {
        reward_id: reward_earned.reward_id,
        customer_id: reward_earned.customer_id,
        won_item: wonItem, // Envia o item ganho para o backend
      };

      // Chama a nova rota para registrar o prêmio e gerar o cupom
      const response = await axiosInstance.post('/api/rewards/spin-wheel', payload);

      toast.success(t('girar_roleta.win_message'));

      // Redireciona para a página de recompensa ganha com os detalhes do cupom
      navigate('/recompensa-ganha', { state: { reward_earned: response.data.reward_earned } });

    } catch (err) {
      console.error('Error finalizing reward:', err);
      toast.error(err.response?.data?.message || t('girar_roleta.error_finalizing'));
    } finally {
      setLoading(false);
      setIsSpinning(false);
    }
  };

  const handleSpinClick = () => {
    setIsSpinning(true);
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
          onSpinFinish={handleSpinFinish}
          isSpinning={isSpinning} // Controla o giro
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
          {loading ? <CircularProgress size={24} /> : t('girar_roleta.spin_button')}
        </Button>
      </Box>
    </Container>
  );
};

export default GirarRoleta;

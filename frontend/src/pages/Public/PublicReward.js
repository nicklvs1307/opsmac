import React from 'react';
import { useLocation } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  Container,
  Card,
  CardContent,
  CardHeader,
  Divider,
} from '@mui/material';
import { CheckCircleOutline as CheckCircleIcon, Stars as StarsIcon } from '@mui/icons-material';
import SpinTheWheel from '../../components/UI/SpinTheWheel'; // Importar o componente da roleta

const PublicReward = () => {
  const location = useLocation();
  const { reward_earned } = location.state || {};

  if (!reward_earned) {
    return (
      <Container maxWidth="sm">
        <Paper sx={{ p: 4, mt: 5, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>
            Nenhuma recompensa encontrada.
          </Typography>
          <Typography color="text.secondary">
            Parece que você acessou esta página diretamente. Por favor, faça o check-in primeiro.
          </Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column', // Adicionado para alinhar o conteúdo verticalmente
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(circle at 50% 50%, #1A1A2E 0%, #0A0A1A 100%)', // Fundo do body
        color: '#fff', // Cor do texto do body
        fontFamily: 'Poppins, sans-serif', // Fonte do body
        padding: '20px', // Padding do body
      }}
    >
      <Container maxWidth="sm">
        {reward_earned.reward_type === 'spin_the_wheel' ? (
          <SpinTheWheel
            items={reward_earned.wheel_config.items}
            winningItem={{
              name: reward_earned.reward_title,
              title: reward_earned.reward_title,
              description: reward_earned.formatted_message,
              coupon_code: reward_earned.coupon_code,
              value: reward_earned.value,
            }}
          />
        ) : (
          <Card sx={{ borderRadius: 3, boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}>
            <CardHeader
              avatar={<StarsIcon color="primary" sx={{ fontSize: 40 }} />}
              title="Parabéns! Você ganhou uma recompensa!"
              titleTypographyProps={{ variant: 'h5', align: 'center', fontWeight: 'bold' }}
              sx={{ bgcolor: 'primary.main', color: 'white' }}
            />
            <CardContent sx={{ p: 4 }}>
              <Box textAlign="center" mb={3}>
                <CheckCircleIcon color="success" sx={{ fontSize: 80 }} />
                <Typography variant="h4" gutterBottom sx={{ mt: 2, fontWeight: 'bold' }}>
                  {reward_earned.reward_title}
                </Typography>
                <Typography variant="h6" color="text.secondary">
                  Cupom: {reward_earned.coupon_code}
                </Typography>
              </Box>

              <Divider sx={{ my: 3 }} />

              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', textAlign: 'center' }}>
                {reward_earned.formatted_message}
              </Typography>

              <Box textAlign="center" mt={4}>
                <Button variant="contained" color="primary" href="/">
                  Voltar ao Início
                </Button>
              </Box>
            </CardContent>
          </Card>
        )}
      </Container>
    </Box>
  );
};

export default PublicReward;

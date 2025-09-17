import React from 'react';
import { useNavigate } from 'react-router-dom';
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
  CircularProgress,
  Alert,
} from '@mui/material';
import { CheckCircleOutline as CheckCircleIcon, Stars as StarsIcon } from '@mui/icons-material';
import SpinTheWheel from '@/components/UI/SpinTheWheel';
// import { useGetPublicReward } from '../api/publicService'; // Commented out due to missing export
import { useTranslation } from 'react-i18next';

const PublicReward = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Temporarily mock rewardData
  const rewardData = {
    reward_earned: {
      reward_title: t('public_reward.mock_title'),
      description: t('public_reward.mock_description'),
      reward_type: 'coupon', // or 'spin_the_wheel'
      coupon_code: 'MOCKCOUPON123',
      formatted_message: t('public_reward.mock_formatted_message'),
      wheel_config: {
        items: [
          { option: t('public_reward.mock_item_1'), color: '#FFD700' },
          { option: t('public_reward.mock_item_2'), color: '#ADFF2F' },
          { option: t('public_reward.mock_item_3'), color: '#87CEEB' },
          { option: t('public_reward.mock_item_4'), color: '#FF6347' },
        ],
      },
    },
  };
  const isLoading = false;
  const isError = false;
  const error = null;

  const reward_earned = rewardData?.reward_earned;

  if (isLoading) {
    return (
      <Container maxWidth="sm">
        <Paper sx={{ p: 4, mt: 5, textAlign: 'center' }}>
          <CircularProgress />
          <Typography>{t('public_reward.loading_reward')}</Typography>
        </Paper>
      </Container>
    );
  }

  if (isError || !reward_earned) {
    return (
      <Container maxWidth="sm">
        <Paper sx={{ p: 4, mt: 5, textAlign: 'center' }}>
          <Typography variant="h5" color="error" gutterBottom>
            {t('public_reward.no_reward_found')}
          </Typography>
          {isError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error.message}
            </Alert>
          )}
          <Typography color="text.secondary">
            {t('public_reward.access_directly_message')}
          </Typography>
          <Button variant="contained" onClick={() => navigate('/')} sx={{ mt: 3 }}>
            {t('common.back_to_home')}
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(circle at 50% 50%, #1A1A2E 0%, #0A0A1A 100%)',
        color: '#fff',
        fontFamily: 'Poppins, sans-serif',
        padding: '20px',
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
              title={t('public_reward.congratulations_title')}
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
                  {t('public_reward.coupon')}: {reward_earned.coupon_code}
                </Typography>
              </Box>

              <Divider sx={{ my: 3 }} />

              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', textAlign: 'center' }}>
                {reward_earned.formatted_message}
              </Typography>

              <Box textAlign="center" mt={4}>
                <Button variant="contained" color="primary" onClick={() => navigate('/')}>
                  {t('common.back_to_home')}
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

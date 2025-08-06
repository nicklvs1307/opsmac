import React, { useEffect } from 'react';
import { Container, Box, Typography } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoginForm from '../../components/UI/LoginForm';
import { useTranslation } from 'react-i18next';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, loading } = useAuth();
  const { t } = useTranslation();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !loading) {
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, loading, navigate, location]);

  const handleSubmit = async (data) => {
    const result = await login(data.email, data.password);
    
    if (result.success) {
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
    
    return result;
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <Typography>{t('login.loading')}</Typography>
      </Box>
    );
  }

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          py: 4,
        }}
      >
        <LoginForm 
          onSubmit={handleSubmit}
          loading={loading}
          error={loading ? '' : location.state?.error || ''}
          showDemoCredentials={true}
          appName={t('login.app_name')}
          appDescription={t('login.app_description')}
        />
      </Box>
    </Container>
  );
};

export default Login;
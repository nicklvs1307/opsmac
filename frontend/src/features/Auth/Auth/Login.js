import { Container, Box, Typography, CircularProgress } from '@mui/material'; // Import CircularProgress
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/app/providers/contexts/AuthContext';
import LoginForm from '@/components/UI/LoginForm'; // Assuming this path is correct
import { useTranslation } from 'react-i18next';
import React, { useEffect, useState } from 'react'; // Import useState

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, loading } = useAuth();
  const { t } = useTranslation();
  const [formError, setFormError] = useState(''); // New state for form error

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !loading) {
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, loading, navigate, location]);

  const handleSubmit = async (data) => {
    setFormError(''); // Clear previous errors
    const result = await login(data.email, data.password);

    if (result.success) {
      if (result.user.role === 'waiter') {
        navigate('/waiter', { replace: true });
      } else {
        const from = location.state?.from?.pathname || '/';
        navigate(from, { replace: true });
      }
    } else {
      setFormError(result.message || t('login.generic_error')); // Set error message
    }

    return result; // Return result for LoginForm to handle error
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress /> {/* Replaced Typography with CircularProgress */}
        <Typography sx={{ ml: 2 }}>{t('login.loading')}</Typography>
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
          error={formError} // Pass formError state
          showDemoCredentials={true}
          appName={t('login.app_name')}
          appDescription={t('login.app_description')}
        />
      </Box>
    </Container>
  );
};

export default Login;

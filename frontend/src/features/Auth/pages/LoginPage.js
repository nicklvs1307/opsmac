import React, { useState, useEffect } from 'react';
import { Container, Box, Typography, CircularProgress } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast'; // Import toast for notifications

// Assuming LoginForm is a generic UI component, keep its path for now.
// If it's tightly coupled to old auth logic, it might need to be moved/adapted.
import LoginForm from '@/components/UI/LoginForm';

// Import the new useLogin hook from the refactored API
import { useLogin } from '@/features/Auth/api/authQueries';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const [formError, setFormError] = useState('');

  // Use the new useLogin mutation hook
  const loginMutation = useLogin();

  // Check if user is already authenticated (e.g., from a global AuthContext or token in localStorage)
  // This part might still rely on a global state or context for initial check
  // For now, I'll keep a placeholder for isAuthenticated and loading,
  // but ideally, this would also be managed by react-query for user session.
  // For a full refactor, a useUserSession query would be ideal here.
  const isAuthenticated = false; // Placeholder: This should come from a global state/query
  const loadingAuthContext = false; // Placeholder: This should come from a global state/query

  useEffect(() => {
    // This useEffect should ideally check a react-query for user session
    // For now, keeping the original logic structure for redirection
    if (isAuthenticated && !loadingAuthContext) {
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, loadingAuthContext, navigate, location]);

  const handleSubmit = async (data) => {
    setFormError(''); // Clear previous errors
    try {
      const result = await loginMutation.mutateAsync(data);
      // Assuming the login mutation returns user data on success
      if (result && result.user) {
        // Store token if returned (e.g., localStorage.setItem('token', result.token))
        // This part depends on how your backend returns the token and how it's handled globally.
        // For now, just navigate.
        if (result.user.role === 'waiter') {
          navigate('/waiter', { replace: true });
        } else {
          const from = location.state?.from?.pathname || '/';
          navigate(from, { replace: true });
        }
        toast.success(t('login.success_message')); // Show success toast
      } else {
        // This case might happen if mutation succeeds but result.user is not as expected
        toast.error(t('login.generic_error'));
      }
    } catch (error) {
      // onError in useLogin already handles toast, but we can set formError for specific fields if needed
      // For now, rely on the toast from useLogin's onError
      setFormError(error.response?.data?.msg || t('login.generic_error'));
    }
  };

  // Use loading state from the mutation
  if (loginMutation.isLoading || loadingAuthContext) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>{t('login.loading')}</Typography>
      </Box>
    );
  );
};

export default LoginPage;

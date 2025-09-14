import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Container,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useRegisterCustomer } from '@/features/Auth/api/authService';

const CustomerRegistration = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    birth_date: '',
  });

  const registerCustomerMutation = useRegisterCustomer();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    registerCustomerMutation.mutate(formData, {
      onSuccess: (data) => {
        navigate(`/checkin?customer_id=${data.customer.id}`);
      },
    });
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 5 }}>
      <Paper
        elevation={3}
        sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}
      >
        <Typography variant="h5" component="h1" gutterBottom>
          {t('customer_registration.title')}
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
          {t('customer_registration.subtitle')}
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
          <TextField
            label={t('customer_registration.name_label')}
            name="name"
            value={formData.name}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label={t('customer_registration.phone_label')}
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
            type="tel"
            placeholder="Ex: +5511987654321"
          />
          <TextField
            label={t('customer_registration.birth_date_label')}
            name="birth_date"
            value={formData.birth_date}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
            type="date"
            InputLabelProps={{
              shrink: true,
            }}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 3, mb: 2 }}
            disabled={registerCustomerMutation.isLoading}
          >
            {registerCustomerMutation.isLoading ? (
              <CircularProgress size={24} />
            ) : (
              t('customer_registration.submit_button')
            )}
          </Button>
          {registerCustomerMutation.isError && (
            <Alert severity="error">
              {registerCustomerMutation.error.response?.data?.msg ||
                t('customer_registration.error_message')}
            </Alert>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default CustomerRegistration;

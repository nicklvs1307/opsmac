import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Box,
  TextField,
  Button,
  Typography,
  Link,
  Alert,
  InputAdornment,
  IconButton,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email as EmailIcon,
  Lock as LockIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Business as BusinessIcon,
} from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../contexts/AuthContext';

const Register = () => {
  const navigate = useNavigate();
  const { register: registerUser, isAuthenticated, loading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registerError, setRegisterError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const password = watch('password');

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !loading) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, loading, navigate]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setRegisterError('');

    // Remove confirmPassword from data
    const { confirmPassword, ...userData } = data;

    const result = await registerUser(userData);
    
    if (result.success) {
      navigate('/dashboard', { replace: true });
    } else {
      setRegisterError(result.message);
    }
    
    setIsSubmitting(false);
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleClickShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <Typography>Carregando...</Typography>
      </Box>
    );
  }

  return (
    <Container component="main" maxWidth="md">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          py: 4,
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            borderRadius: 2,
          }}
        >
          {/* Logo/Title */}
          <Box sx={{ mb: 3, textAlign: 'center' }}>
            <Typography
              component="h1"
              variant="h4"
              color="primary"
              fontWeight="bold"
              gutterBottom
            >
              FeedbackPro
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Sistema de Feedback para Restaurantes
            </Typography>
          </Box>

          <Divider sx={{ width: '100%', mb: 3 }} />

          {/* Register Form */}
          <Box
            component="form"
            onSubmit={handleSubmit(onSubmit)}
            sx={{ width: '100%' }}
          >
            <Typography
              component="h2"
              variant="h5"
              align="center"
              gutterBottom
              sx={{ mb: 3 }}
            >
              Criar nova conta
            </Typography>

            {registerError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {registerError}
              </Alert>
            )}

            <Grid container spacing={2}>
              {/* Personal Information */}
              <Grid item xs={12} sm={6}>
                <TextField
                  {...register('name', {
                    required: 'Nome é obrigatório',
                    minLength: {
                      value: 2,
                      message: 'Nome deve ter pelo menos 2 caracteres',
                    },
                  })}
                  fullWidth
                  label="Nome Completo"
                  autoComplete="name"
                  autoFocus
                  error={!!errors.name}
                  helperText={errors.name?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  {...register('email', {
                    required: 'Email é obrigatório',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Email inválido',
                    },
                  })}
                  fullWidth
                  label="Email"
                  type="email"
                  autoComplete="email"
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  {...register('phone', {
                    required: 'Telefone é obrigatório',
                    pattern: {
                      value: /^\(?\d{2}\)?[\s-]?\d{4,5}[\s-]?\d{4}$/,
                      message: 'Telefone inválido',
                    },
                  })}
                  fullWidth
                  label="Telefone"
                  type="tel"
                  autoComplete="tel"
                  error={!!errors.phone}
                  helperText={errors.phone?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={!!errors.role}>
                  <InputLabel>Tipo de Usuário</InputLabel>
                  <Select
                    {...register('role', {
                      required: 'Tipo de usuário é obrigatório',
                    })}
                    label="Tipo de Usuário"
                    defaultValue=""
                  >
                    <MenuItem value="owner">Proprietário</MenuItem>
                    <MenuItem value="manager">Gerente</MenuItem>
                    <MenuItem value="staff">Funcionário</MenuItem>
                  </Select>
                  {errors.role && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                      {errors.role.message}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              {/* Restaurant Information */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Informações do Restaurante
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  {...register('restaurantName', {
                    required: 'Nome do restaurante é obrigatório',
                  })}
                  fullWidth
                  label="Nome do Restaurante"
                  error={!!errors.restaurantName}
                  helperText={errors.restaurantName?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <BusinessIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={!!errors.cuisineType}>
                  <InputLabel>Tipo de Culinária</InputLabel>
                  <Select
                    {...register('cuisineType', {
                      required: 'Tipo de culinária é obrigatório',
                    })}
                    label="Tipo de Culinária"
                    defaultValue=""
                  >
                    <MenuItem value="brasileira">Brasileira</MenuItem>
                    <MenuItem value="italiana">Italiana</MenuItem>
                    <MenuItem value="japonesa">Japonesa</MenuItem>
                    <MenuItem value="mexicana">Mexicana</MenuItem>
                    <MenuItem value="chinesa">Chinesa</MenuItem>
                    <MenuItem value="francesa">Francesa</MenuItem>
                    <MenuItem value="americana">Americana</MenuItem>
                    <MenuItem value="vegetariana">Vegetariana</MenuItem>
                    <MenuItem value="fast-food">Fast Food</MenuItem>
                    <MenuItem value="outros">Outros</MenuItem>
                  </Select>
                  {errors.cuisineType && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                      {errors.cuisineType.message}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              {/* Password Fields */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Senha de Acesso
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  {...register('password', {
                    required: 'Senha é obrigatória',
                    minLength: {
                      value: 6,
                      message: 'Senha deve ter pelo menos 6 caracteres',
                    },
                  })}
                  fullWidth
                  label="Senha"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  error={!!errors.password}
                  helperText={errors.password?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleClickShowPassword}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  {...register('confirmPassword', {
                    required: 'Confirmação de senha é obrigatória',
                    validate: (value) =>
                      value === password || 'Senhas não coincidem',
                  })}
                  fullWidth
                  label="Confirmar Senha"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle confirm password visibility"
                          onClick={handleClickShowConfirmPassword}
                          edge="end"
                        >
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={isSubmitting}
              sx={{ mt: 3, mb: 2, py: 1.5 }}
            >
              {isSubmitting ? 'Criando conta...' : 'Criar Conta'}
            </Button>

            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Já tem uma conta?{' '}
                <Link component={RouterLink} to="/login" variant="body2">
                  Faça login aqui
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Register;
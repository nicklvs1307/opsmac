import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Link,
  Alert,
  InputAdornment,
  IconButton,
  Divider,
  Paper,
  useTheme,
  alpha,
  CircularProgress,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email as EmailIcon,
  Lock as LockIcon,
  Login as LoginIcon,
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

const LoginForm = ({
  onSubmit,
  loading = false,
  error = '',
  showDemoCredentials = true,
  logoComponent,
  appName = 'FeedbackPro',
  appDescription = 'Sistema de Feedback para Restaurantes',
}) => {
  const theme = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const { t } = useTranslation();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 4,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        borderRadius: 3,
        position: 'relative',
        overflow: 'hidden',
        background: theme.palette.mode === 'dark' 
          ? `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.8)} 0%, ${alpha(theme.palette.background.paper, 0.9)} 100%)` 
          : `linear-gradient(135deg, ${alpha('#f8f9fa', 0.8)} 0%, ${alpha('#ffffff', 0.9)} 100%)`,
        backdropFilter: 'blur(10px)',
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        boxShadow: `0 10px 40px ${alpha(theme.palette.common.black, 0.1)}`,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          zIndex: 1,
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `radial-gradient(circle at top right, ${alpha(theme.palette.primary.light, 0.1)}, transparent 70%)`,
          zIndex: 0,
        },
      }}
    >
      {/* Logo/Title */}
      <Box 
        sx={{ 
          mb: 3, 
          textAlign: 'center',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {logoComponent ? (
          logoComponent
        ) : (
          <>
            <Typography
              component="h1"
              variant="h4"
              fontWeight="bold"
              gutterBottom
              sx={{
                background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: `0 2px 10px ${alpha(theme.palette.primary.main, 0.3)}`,
                animation: 'fadeIn 0.8s ease-in-out',
                '@keyframes fadeIn': {
                  '0%': {
                    opacity: 0,
                    transform: 'translateY(-10px)',
                  },
                  '100%': {
                    opacity: 1,
                    transform: 'translateY(0)',
                  },
                },
              }}
            >
              {appName}
            </Typography>
            <Typography 
              variant="body1" 
              color="text.secondary"
              sx={{
                animation: 'fadeIn 0.8s ease-in-out 0.2s both',
                '@keyframes fadeIn': {
                  '0%': {
                    opacity: 0,
                    transform: 'translateY(-10px)',
                  },
                  '100%': {
                    opacity: 1,
                    transform: 'translateY(0)',
                  },
                },
              }}
            >
              {appDescription}
            </Typography>
          </>
        )}
      </Box>

      <Divider 
        sx={{ 
          width: '100%', 
          mb: 3,
          '&::before, &::after': {
            borderColor: alpha(theme.palette.divider, 0.2),
          },
        }} 
      />

      {/* Login Form */}
      <Box
        component="form"
        onSubmit={handleSubmit(onSubmit)}
        sx={{ 
          width: '100%',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Typography
          component="h2"
          variant="h5"
          align="center"
          gutterBottom
          sx={{ 
            mb: 3,
            fontWeight: 600,
            color: theme.palette.text.primary,
            animation: 'fadeIn 0.8s ease-in-out 0.4s both',
            '@keyframes fadeIn': {
              '0%': {
                opacity: 0,
                transform: 'translateY(-10px)',
              },
              '100%': {
                opacity: 1,
                transform: 'translateY(0)',
              },
            },
          }}
        >
          Entrar na sua conta
        </Typography>

        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 2,
              borderRadius: 2,
              animation: 'shake 0.5s cubic-bezier(.36,.07,.19,.97) both',
              '@keyframes shake': {
                '10%, 90%': {
                  transform: 'translate3d(-1px, 0, 0)',
                },
                '20%, 80%': {
                  transform: 'translate3d(2px, 0, 0)',
                },
                '30%, 50%, 70%': {
                  transform: 'translate3d(-4px, 0, 0)',
                },
                '40%, 60%': {
                  transform: 'translate3d(4px, 0, 0)',
                },
              },
            }}
          >
            {error}
          </Alert>
        )}

        <Controller
          name="email"
          control={control}
          rules={{
            required: 'Email é obrigatório',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Email inválido',
            },
          }}
          render={({ field }) => (
            <TextField
              {...field}
              margin="normal"
              fullWidth
              label="Email"
              type="email"
              autoComplete="email"
              autoFocus
              error={!!errors.email}
              helperText={errors.email?.message}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{
                animation: 'fadeIn 0.8s ease-in-out 0.6s both',
                '@keyframes fadeIn': {
                  '0%': {
                    opacity: 0,
                    transform: 'translateY(10px)',
                  },
                  '100%': {
                    opacity: 1,
                    transform: 'translateY(0)',
                  },
                },
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
                  },
                  '&.Mui-focused': {
                    boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.3)}`,
                  },
                },
              }}
            />
          )}
        />

        <Controller
          name="password"
          control={control}
          rules={{
            required: 'Senha é obrigatória',
            minLength: {
              value: 6,
              message: 'Senha deve ter pelo menos 6 caracteres',
            },
          }}
          render={({ field }) => (
            <TextField
              {...field}
              margin="normal"
              fullWidth
              label="Senha"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
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
              sx={{
                animation: 'fadeIn 0.8s ease-in-out 0.8s both',
                '@keyframes fadeIn': {
                  '0%': {
                    opacity: 0,
                    transform: 'translateY(10px)',
                  },
                  '100%': {
                    opacity: 1,
                    transform: 'translateY(0)',
                  },
                },
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
                  },
                  '&.Mui-focused': {
                    boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.3)}`,
                  },
                },
              }}
            />
          )}
        />

        <Button
          type="submit"
          fullWidth
          variant="contained"
          size="large"
          disabled={loading}
          startIcon={loading ? null : <LoginIcon />}
          sx={{
            mt: 3,
            mb: 2,
            py: 1.5,
            borderRadius: 2,
            fontWeight: 600,
            textTransform: 'none',
            fontSize: '1rem',
            boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.4)}`,
            position: 'relative',
            overflow: 'hidden',
            animation: 'fadeIn 0.8s ease-in-out 1s both',
            '@keyframes fadeIn': {
              '0%': {
                opacity: 0,
                transform: 'translateY(10px)',
              },
              '100%': {
                opacity: 1,
                transform: 'translateY(0)',
              },
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: '-100%',
              width: '100%',
              height: '100%',
              background: `linear-gradient(90deg, transparent, ${alpha('#fff', 0.2)}, transparent)`,
              transition: 'all 0.5s ease',
            },
            '&:hover': {
              boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.6)}`,
              transform: 'translateY(-2px)',
              '&::after': {
                left: '100%',
              },
            },
            '&:active': {
              transform: 'translateY(0)',
              boxShadow: `0 3px 10px ${alpha(theme.palette.primary.main, 0.4)}`,
            },
          }}
        >
          {loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            'Entrar'
          )}
        </Button>

        <Box 
          sx={{ 
            textAlign: 'center', 
            mt: 2,
            animation: 'fadeIn 0.8s ease-in-out 1.2s both',
            '@keyframes fadeIn': {
              '0%': {
                opacity: 0,
              },
              '100%': {
                opacity: 1,
              },
            },
          }}
        >
          <Link
            component={RouterLink}
            to="/forgot-password"
            variant="body2"
            sx={{ 
              mb: 2, 
              display: 'block',
              color: theme.palette.primary.main,
              textDecoration: 'none',
              fontWeight: 500,
              transition: 'all 0.2s ease',
              '&:hover': {
                color: theme.palette.primary.dark,
                textDecoration: 'underline',
              },
            }}
          >
            Esqueceu sua senha?
          </Link>
          
          <Typography variant="body2" color="text.secondary">
            Não tem uma conta?{' '}
            <Link 
              component={RouterLink} 
              to="/register" 
              variant="body2"
              sx={{ 
                color: theme.palette.primary.main,
                textDecoration: 'none',
                fontWeight: 500,
                transition: 'all 0.2s ease',
                '&:hover': {
                  color: theme.palette.primary.dark,
                  textDecoration: 'underline',
                },
              }}
            >
              Cadastre-se aqui
            </Link>
          </Typography>
        </Box>
      </Box>

      {/* Demo credentials */}
      {showDemoCredentials && (
        <Box 
          sx={{ 
            mt: 3, 
            p: 2, 
            bgcolor: alpha(theme.palette.background.default, 0.5),
            borderRadius: 2, 
            width: '100%',
            border: `1px dashed ${alpha(theme.palette.divider, 0.3)}`,
            animation: 'fadeIn 0.8s ease-in-out 1.4s both',
            '@keyframes fadeIn': {
              '0%': {
                opacity: 0,
              },
              '100%': {
                opacity: 1,
              },
            },
          }}
        >
          <Typography variant="caption" color="text.secondary" align="center" display="block">
            <strong>{t('login_form.demo_credentials_title')}</strong>
          </Typography>
          <Typography variant="caption" color="text.secondary" align="center" display="block">
            {t('login_form.demo_credentials_text')}
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default LoginForm;
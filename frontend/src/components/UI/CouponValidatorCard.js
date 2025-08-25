import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Chip,
  useTheme,
  alpha,
  Divider,
  Fade,
  Zoom,
  Paper,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  ContentCopy as ContentCopyIcon,
  Refresh as RefreshIcon,
  LocalOffer as LocalOfferIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';

const CouponValidatorCard = ({ onValidate, onReset, onRedeem }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [couponCode, setCouponCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [coupon, setCoupon] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleValidate = async () => {
    if (!couponCode.trim()) {
      setError(t('coupon_validator_card.enter_coupon_code'));
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Se a função onValidate foi fornecida como prop, use-a
      if (onValidate) {
        const result = await onValidate(couponCode);
        setCoupon(result);
      } else {
        // Caso contrário, use um comportamento padrão (pode ser removido se não for necessário)
        setTimeout(() => {
          setCoupon({
            is_valid: Math.random() > 0.3, // Simulação
            code: couponCode,
            reward: { title: t('customer_card.simulated_discount') },
            customer: { name: t('customer_card.test_customer') },
            status: ['active', 'redeemed', 'expired'][Math.floor(Math.random() * 3)],
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          });
          setLoading(false);
        }, 1000);
        return;
      }
    } catch (err) {
      setError(err.message || t('coupon_validator_card.error_validating_coupon'));
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setCouponCode('');
    setCoupon(null);
    setError('');
    if (onReset) onReset();
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(couponCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return theme.palette.success.main;
      case 'redeemed':
        return theme.palette.info.main;
      case 'expired':
        return theme.palette.warning.main;
      default:
        return theme.palette.grey[500];
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'active':
        return t('coupon_validator_card.status_active');
      case 'redeemed':
        return t('coupon_validator_card.status_redeemed');
      case 'expired':
        return t('coupon_validator_card.status_expired');
      default:
        return status;
    }
  };

  const getStatusBgColor = (status) => {
    switch (status) {
      case 'active':
        return alpha(theme.palette.success.main, 0.1);
      case 'redeemed':
        return alpha(theme.palette.info.main, 0.1);
      case 'expired':
        return alpha(theme.palette.warning.main, 0.1);
      default:
        return alpha(theme.palette.grey[500], 0.1);
    }
  };

  return (
    <Card
      elevation={3}
      sx={{
        borderRadius: 3,
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        '&:hover': { boxShadow: 6 },
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box display="flex" alignItems="center" mb={2}>
          <LocalOfferIcon
            sx={{
              mr: 1.5,
              color: theme.palette.primary.main,
              fontSize: 28,
            }}
          />
          <Typography
            variant="h5"
            component="h2"
            sx={{
              fontWeight: 600,
              background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {t('coupon_validator_card.title')}
          </Typography>
        </Box>

        <Divider sx={{ mb: 3, opacity: 0.6 }} />

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            mb: 3,
            position: 'relative',
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              transition: 'all 0.3s ease',
              '&:hover': {
                '& fieldset': {
                  borderColor: theme.palette.primary.main,
                },
              },
              '&.Mui-focused': {
                '& fieldset': {
                  borderWidth: '1px',
                  borderColor: theme.palette.primary.main,
                  boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.2)}`,
                },
              },
            },
          }}
        >
          <TextField
            fullWidth
            label={t('coupon_validator_card.coupon_code_label')}
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleValidate()}
            placeholder={t('coupon_validator_card.coupon_code_placeholder')}
            InputProps={{
              endAdornment: couponCode && (
                <Tooltip
                  title={
                    copied
                      ? t('coupon_validator_card.copied_tooltip')
                      : t('coupon_validator_card.copy_code_tooltip')
                  }
                >
                  <IconButton onClick={handleCopyCode} size="small">
                    <ContentCopyIcon fontSize="small" color={copied ? 'primary' : 'action'} />
                  </IconButton>
                </Tooltip>
              ),
            }}
          />
          <Box sx={{ display: 'flex', ml: 1.5 }}>
            <Button
              variant="contained"
              onClick={handleValidate}
              disabled={loading}
              sx={{
                borderRadius: 2,
                px: 3,
                py: 1.2,
                textTransform: 'none',
                fontWeight: 600,
                boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.4)}`,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.6)}`,
                },
              }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                t('coupon_validator_card.validate_button')
              )}
            </Button>
            {coupon && (
              <Tooltip title={t('coupon_validator_card.clear_and_validate_another')}>
                <IconButton onClick={handleReset} sx={{ ml: 1 }} color="default">
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>

        {error && (
          <Fade in={!!error}>
            <Alert
              severity="error"
              sx={{
                mb: 3,
                borderRadius: 2,
                '& .MuiAlert-icon': {
                  alignItems: 'center',
                },
              }}
              onClose={() => setError('')}
            >
              {error}
            </Alert>
          </Fade>
        )}

        {coupon && (
          <Zoom in={!!coupon} style={{ transitionDelay: '100ms' }}>
            <Paper
              elevation={2}
              sx={{
                p: 3,
                borderRadius: 2,
                background: coupon.is_valid
                  ? `linear-gradient(135deg, ${alpha(theme.palette.success.light, 0.2)} 0%, ${alpha(theme.palette.success.main, 0.05)} 100%)`
                  : `linear-gradient(135deg, ${alpha(theme.palette.error.light, 0.2)} 0%, ${alpha(theme.palette.error.main, 0.05)} 100%)`,
                border: `1px solid ${alpha(coupon.is_valid ? theme.palette.success.main : theme.palette.error.main, 0.2)}`,
                position: 'relative',
                overflow: 'hidden',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  bottom: 0,
                  left: 0,
                  background: `radial-gradient(circle at top right, ${alpha(coupon.is_valid ? theme.palette.success.main : theme.palette.error.main, 0.1)} 0%, transparent 70%)`,
                  zIndex: 0,
                },
              }}
            >
              <Box
                display="flex"
                alignItems="center"
                mb={2}
                sx={{ position: 'relative', zIndex: 1 }}
              >
                {coupon.is_valid ? (
                  <CheckCircleIcon
                    sx={{
                      mr: 1.5,
                      color: theme.palette.success.main,
                      fontSize: 28,
                    }}
                  />
                ) : (
                  <CancelIcon
                    sx={{
                      mr: 1.5,
                      color: theme.palette.error.main,
                      fontSize: 28,
                    }}
                  />
                )}
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    color: coupon.is_valid ? theme.palette.success.main : theme.palette.error.main,
                  }}
                >
                  {coupon.is_valid
                    ? t('coupon_validator_card.coupon_valid')
                    : t('coupon_validator_card.coupon_invalid')}
                </Typography>
              </Box>

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                  gap: 2,
                  position: 'relative',
                  zIndex: 1,
                }}
              >
                <Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 0.5, fontWeight: 500 }}
                  >
                    {t('coupon_validator_card.code_label')}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      fontWeight: 600,
                      fontFamily: 'monospace',
                      letterSpacing: '0.5px',
                      bgcolor: alpha(theme.palette.background.paper, 0.7),
                      p: 1,
                      borderRadius: 1,
                      border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    }}
                  >
                    {coupon.code}
                  </Typography>
                </Box>

                <Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 0.5, fontWeight: 500 }}
                  >
                    {t('coupon_validator_card.reward_label')}
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {coupon.reward?.title || t('coupon_validator_card.not_available')}
                  </Typography>
                </Box>

                <Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 0.5, fontWeight: 500 }}
                  >
                    {t('coupon_validator_card.customer_label')}
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {coupon.customer?.name || t('coupon_validator_card.not_available')}
                  </Typography>
                </Box>

                <Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 0.5, fontWeight: 500 }}
                  >
                    {t('coupon_validator_card.status_label')}
                  </Typography>
                  <Chip
                    label={getStatusLabel(coupon.status)}
                    sx={{
                      fontWeight: 600,
                      color: getStatusColor(coupon.status),
                      bgcolor: getStatusBgColor(coupon.status),
                      borderRadius: '8px',
                    }}
                    size="small"
                  />
                </Box>

                <Box sx={{ gridColumn: { xs: '1', sm: '1 / span 2' } }}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 0.5, fontWeight: 500 }}
                  >
                    {t('coupon_validator_card.expires_in_label')}
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {coupon.expires_at
                      ? format(new Date(coupon.expires_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })
                      : t('coupon_validator_card.does_not_expire')}
                  </Typography>
                </Box>
                {coupon.is_valid && (
                  <Box sx={{ gridColumn: { xs: '1', sm: '1 / span 2' } }}>
                    <Button
                      variant="contained"
                      onClick={() => onRedeem(coupon.id)}
                      disabled={loading}
                      sx={{
                        borderRadius: 2,
                        px: 3,
                        py: 1.2,
                        textTransform: 'none',
                        fontWeight: 600,
                        boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.4)}`,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.6)}`,
                        },
                      }}
                    >
                      {loading ? (
                        <CircularProgress size={24} color="inherit" />
                      ) : (
                        t('coupon_validator_card.use_coupon_button')
                      )}
                    </Button>
                  </Box>
                )}
              </Box>
            </Paper>
          </Zoom>
        )}
      </CardContent>
    </Card>
  );
};

export default CouponValidatorCard;

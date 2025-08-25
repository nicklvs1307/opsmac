import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Grid,
  useTheme,
  alpha,
  Chip,
} from '@mui/material';
import { Star as StarIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

/**
 * CustomerCard - Um componente reutilizável para exibir informações de clientes com visual moderno
 *
 * @param {Object} props - Propriedades do componente
 * @param {Object} props.customer - Dados do cliente
 * @param {string} props.customer.name - Nome do cliente
 * @param {string} props.customer.email - Email do cliente
 * @param {number} props.customer.feedback_count - Quantidade de feedbacks
 * @param {number} props.customer.coupons_redeemed - Quantidade de cupons resgatados
 * @param {number} [props.customer.average_rating] - Avaliação média (opcional)
 * @param {number} props.index - Índice do cliente na lista (para determinar a cor de fundo)
 * @param {boolean} [props.showRanking=true] - Se deve mostrar o indicador de posição
 */
const CustomerCard = ({ customer, index, showRanking = true }) => {
  const theme = useTheme();
  const { t } = useTranslation();

  // Gradientes para os cards baseados no índice
  const gradients = [
    `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
    `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`,
    `linear-gradient(135deg, ${theme.palette.info.main} 0%, ${theme.palette.info.dark} 100%)`,
    `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`,
    `linear-gradient(135deg, ${theme.palette.warning.main} 0%, ${theme.palette.warning.dark} 100%)`,
  ];

  // Seleciona o gradiente com base no índice (com fallback para o primeiro gradiente)
  const cardBackground = gradients[index % gradients.length] || gradients[0];

  return (
    <Card
      sx={{
        borderRadius: 2,
        boxShadow: `0 8px 24px ${alpha(theme.palette.common.black, 0.12)}`,
        border: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
        transition: 'all 0.3s ease',
        position: 'relative',
        overflow: 'hidden',
        height: '100%',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: `0 12px 28px ${alpha(theme.palette.common.black, 0.18)}`,
        },
        background: cardBackground,
        color: theme.palette.common.white,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: `radial-gradient(circle at top right, ${alpha(theme.palette.common.white, 0.1)}, transparent 70%)`,
          zIndex: 1,
        },
      }}
    >
      {showRanking && (
        <Box
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            width: 28,
            height: 28,
            borderRadius: '50%',
            backgroundColor: alpha(theme.palette.common.white, 0.2),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            fontSize: '0.875rem',
            color: theme.palette.common.white,
            boxShadow: `0 2px 8px ${alpha(theme.palette.common.black, 0.2)}`,
            zIndex: 2,
          }}
        >
          {index + 1}
        </Box>
      )}

      <CardContent sx={{ p: 2, position: 'relative', zIndex: 2 }}>
        <Box display="flex" alignItems="center" mb={1.5}>
          <Avatar
            sx={{
              bgcolor: alpha(theme.palette.common.white, 0.2),
              width: 40,
              height: 40,
              mr: 1.5,
              fontSize: '1rem',
              fontWeight: 'bold',
              boxShadow: `0 4px 8px ${alpha(theme.palette.common.black, 0.15)}`,
              border: `2px solid ${alpha(theme.palette.common.white, 0.3)}`,
              animation: 'pulse 2s infinite',
              '@keyframes pulse': {
                '0%': { boxShadow: `0 0 0 0 ${alpha(theme.palette.common.white, 0.4)}` },
                '70%': { boxShadow: `0 0 0 6px ${alpha(theme.palette.common.white, 0)}` },
                '100%': { boxShadow: `0 0 0 0 ${alpha(theme.palette.common.white, 0)}` },
              },
            }}
          >
            {customer.name.charAt(0).toUpperCase()}
          </Avatar>
          <Box flex={1}>
            <Typography
              variant="subtitle1"
              component="div"
              sx={{
                fontWeight: 600,
                fontSize: '1rem',
                mb: 0.25,
                lineHeight: 1.2,
                textShadow: '0 1px 2px rgba(0,0,0,0.2)',
              }}
            >
              {customer.name}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: alpha(theme.palette.common.white, 0.8),
                fontSize: '0.8rem',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {customer.email}
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            bgcolor: alpha(theme.palette.common.black, 0.1),
            borderRadius: 1.5,
            p: 1.5,
            backdropFilter: 'blur(4px)',
            animation: 'fadeIn 0.5s ease-in-out',
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
          }}
        >
          <Grid container spacing={1}>
            <Grid item xs={6}>
              <Box textAlign="center">
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 'bold',
                    mb: 0.25,
                    fontSize: '1.1rem',
                    textShadow: '0 1px 2px rgba(0,0,0,0.2)',
                  }}
                >
                  {customer.feedback_count}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: alpha(theme.palette.common.white, 0.8),
                    fontSize: '0.7rem',
                  }}
                >
                  {t('customer_card.feedbacks')}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box textAlign="center">
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 'bold',
                    mb: 0.25,
                    fontSize: '1.1rem',
                    textShadow: '0 1px 2px rgba(0,0,0,0.2)',
                  }}
                >
                  {customer.coupons_redeemed || 0}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: alpha(theme.palette.common.white, 0.8),
                    fontSize: '0.7rem',
                  }}
                >
                  {t('customer_card.coupons')}
                </Typography>
              </Box>
            </Grid>
          </Grid>

          {customer.average_rating && (
            <Box
              sx={{
                mt: 1.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                pt: 1,
                borderTop: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
              }}
            >
              <Chip
                icon={
                  <StarIcon
                    sx={{
                      color: `${theme.palette.warning.light} !important`,
                      fontSize: '0.875rem',
                    }}
                  />
                }
                label={t('customer_card.stars', { rating: customer.average_rating.toFixed(1) })}
                size="small"
                sx={{
                  bgcolor: alpha(theme.palette.common.white, 0.15),
                  color: theme.palette.common.white,
                  fontWeight: 500,
                  '& .MuiChip-label': { px: 1 },
                  backdropFilter: 'blur(4px)',
                }}
              />
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default CustomerCard;

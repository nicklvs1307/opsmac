import React from 'react';
import { Box, Card, CardContent, Typography, Avatar, useTheme, alpha } from '@mui/material';
import { styled } from '@mui/material/styles';
import { TrendingUp, TrendingDown } from '@mui/icons-material';

import { useTranslation } from 'react-i18next';

// Define keyframes as constants
const countUpKeyframes = `
  0% {
    opacity: 0;
    transform: translateY(10px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
`;

const pulseIconKeyframes = `
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
`;

const fadeInKeyframes = `
  0% {
    opacity: 0;
    transform: translateY(5px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
`;

// Styled Card component for the main container
const StyledCard = styled(Card)(({ theme, bgColor, defaultBgColor }) => ({
  height: '100%',
  background: bgColor || defaultBgColor,
  color: 'white',
  position: 'relative',
  overflow: 'visible',
  borderRadius: 3,
  transition: 'all 0.3s ease',
  boxShadow: `0 10px 20px ${alpha(theme.palette.common.black, 0.1)}`,
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: `0 15px 30px ${alpha(theme.palette.common.black, 0.15)}`,
  },
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
}));

/**
 * MetricCard - Um componente reutilizável para exibir métricas com visual moderno
 *
 * @param {Object} props - Propriedades do componente
 * @param {string} props.title - Título da métrica
 * @param {string|number} props.value - Valor principal da métrica
 * @param {string} [props.subtitle] - Texto secundário opcional
 * @param {React.ReactNode} props.icon - Ícone a ser exibido
 * @param {number} [props.trend] - Valor da tendência (positivo ou negativo)
 * @param {string} [props.bgColor] - Cor de fundo personalizada (gradiente)
 * @param {string} [props.iconColor] - Cor do fundo do ícone
 * @param {string} [props.trendLabel] - Texto personalizado para a tendência
 * @param {string} [props.valuePrefix] - Prefixo para o valor (ex: "$", "€")
 * @param {string} [props.valueSuffix] - Sufixo para o valor (ex: "%", "pts")
 */
const MetricCard = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  bgColor,
  iconColor,
  trendLabel,
  valuePrefix = '',
  valueSuffix = '',
}) => {
  const theme = useTheme();
  const { t } = useTranslation();

  // Cores padrão se não forem fornecidas
  const defaultBgColor =
    theme.palette.mode === 'light'
      ? `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`
      : `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.8)} 0%, ${alpha(theme.palette.primary.dark, 0.9)} 100%)`;

  const defaultIconColor =
    theme.palette.mode === 'light'
      ? alpha(theme.palette.common.white, 0.2)
      : alpha(theme.palette.common.white, 0.1);

  // Determinar o texto da tendência
  const trendText =
    trendLabel ||
    (trend ? t('metric_card.trend_text', { trend: `${trend > 0 ? '+' : ''}${trend}` }) : '');

  return (
    <StyledCard elevation={0} bgColor={bgColor} defaultBgColor={defaultBgColor}>
      <CardContent sx={{ pb: 2, position: 'relative', zIndex: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography
              variant="body2"
              sx={{
                color: alpha(theme.palette.common.white, 0.8),
                fontSize: '0.875rem',
                fontWeight: 500,
                mb: 1,
                textShadow: '0 1px 2px rgba(0,0,0,0.1)',
              }}
            >
              {title}
            </Typography>
            <Typography
              variant="h3"
              component="div"
              sx={{
                color: theme.palette.common.white,
                fontWeight: 'bold',
                fontSize: '2.5rem',
                lineHeight: 1,
                textShadow: '0 2px 4px rgba(0,0,0,0.2)',
                animation: `countUp 1s ease-out`,
                '@keyframes countUp': countUpKeyframes,
              }}
            >
              {valuePrefix}
              {value}
              {valueSuffix}
            </Typography>
            {subtitle && (
              <Typography
                variant="body2"
                sx={{
                  color: alpha(theme.palette.common.white, 0.7),
                  fontSize: '0.75rem',
                  mt: 0.5,
                  fontStyle: 'italic',
                }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>
          <Avatar
            sx={{
              bgcolor: iconColor || defaultIconColor,
              width: 48,
              height: 48,
              boxShadow: `0 4px 8px ${alpha(theme.palette.common.black, 0.2)}`,
              animation: `pulseIcon 2s infinite`,
              '@keyframes pulseIcon': pulseIconKeyframes,
            }}
          >
            {icon}
          </Avatar>
        </Box>
        {trend !== undefined && (
          <Box
            display="flex"
            alignItems="center"
            mt={2}
            sx={{
              background: alpha(theme.palette.common.black, 0.1),
              borderRadius: 10,
              px: 1.5,
              py: 0.75,
              width: 'fit-content',
              animation: `fadeIn 0.5s ease-in-out`,
              '@keyframes fadeIn': fadeInKeyframes,
            }}
          >
            {trend > 0 ? (
              <TrendingUp
                sx={{ color: alpha(theme.palette.common.white, 0.9), mr: 0.5, fontSize: '1rem' }}
              />
            ) : (
              <TrendingDown
                sx={{ color: alpha(theme.palette.common.white, 0.9), mr: 0.5, fontSize: '1rem' }}
              />
            )}
            <Typography
              variant="body2"
              sx={{
                color: alpha(theme.palette.common.white, 0.9),
                fontSize: '0.75rem',
                fontWeight: 500,
              }}
            >
              {trendText}
            </Typography>
          </Box>
        )}
      </CardContent>
    </StyledCard>
  );
};

export default MetricCard;
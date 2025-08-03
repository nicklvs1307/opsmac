import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Fade,
  Zoom,
  Grid,
  Chip,
  Avatar,
  Divider,
  useTheme,
  alpha,
  Paper,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Star as StarIcon,
  Restaurant as RestaurantIcon,
  Share as ShareIcon,
  Home as HomeIcon,
  CardGiftcard as GiftIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';

const ThankYouCard = ({
  customerName,
  restaurant,
  rating,
  reward,
  onShare,
  onHome,
  showNextSteps = true,
  showFooter = true,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [showContent, setShowContent] = useState(false);
  const [showReward, setShowReward] = useState(false);

  useEffect(() => {
    // Animate content appearance
    const timer1 = setTimeout(() => setShowContent(true), 300);
    const timer2 = setTimeout(() => setShowReward(true), 1500);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  const getRatingMessage = (rating) => {
    if (rating >= 4) {
      return {
        title: 'Que ótimo!',
        message: 'Ficamos muito felizes que você tenha tido uma experiência excelente!',
        color: theme.palette.success.main,
      };
    } else if (rating >= 3) {
      return {
        title: 'Obrigado!',
        message: 'Sua opinião nos ajuda a melhorar cada vez mais.',
        color: theme.palette.warning.main,
      };
    } else {
      return {
        title: 'Obrigado pelo feedback',
        message: 'Vamos trabalhar para melhorar sua experiência na próxima visita.',
        color: theme.palette.error.main,
      };
    }
  };

  const handleShare = () => {
    if (onShare) {
      onShare();
      return;
    }

    if (navigator.share) {
      navigator.share({
        title: `Avaliei o ${restaurant}`,
        text: `Acabei de avaliar minha experiência no ${restaurant} com ${rating} estrelas!`,
        url: window.location.origin,
      });
    } else {
      // Fallback for browsers that don't support Web Share API
      const text = `Acabei de avaliar minha experiência no ${restaurant} com ${rating} estrelas!`;
      const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
      window.open(url, '_blank');
    }
  };

  const handleHome = () => {
    if (onHome) {
      onHome();
    }
  };

  const ratingInfo = rating ? getRatingMessage(rating) : null;

  return (
    <Paper 
      elevation={0}
      sx={{
        borderRadius: 4,
        overflow: 'hidden',
        background: theme.palette.mode === 'dark' 
          ? `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.8)} 0%, ${alpha(theme.palette.background.paper, 0.9)} 100%)` 
          : `linear-gradient(135deg, ${alpha('#f8f9fa', 0.8)} 0%, ${alpha('#ffffff', 0.9)} 100%)`,
        backdropFilter: 'blur(10px)',
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        boxShadow: `0 10px 40px ${alpha(theme.palette.common.black, 0.1)}`,
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
          zIndex: 1,
        }
      }}
    >
      <Box py={6} px={4} textAlign="center">
        {/* Success Icon */}
        <Zoom in={showContent}>
          <CheckCircleIcon 
            sx={{ 
              fontSize: 120, 
              color: ratingInfo?.color || theme.palette.success.main, 
              mb: 3,
              filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))',
              animation: 'pulse 2s infinite',
              '@keyframes pulse': {
                '0%': {
                  transform: 'scale(1)',
                  opacity: 1,
                },
                '50%': {
                  transform: 'scale(1.05)',
                  opacity: 0.8,
                },
                '100%': {
                  transform: 'scale(1)',
                  opacity: 1,
                },
              },
            }} 
          />
        </Zoom>

        {/* Main Message */}
        <Fade in={showContent} timeout={800}>
          <Box mb={4}>
            <Typography 
              variant="h3" 
              gutterBottom 
              sx={{ 
                fontWeight: 'bold',
                background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 1,
              }}
            >
              {ratingInfo?.title || 'Obrigado!'}
            </Typography>
            
            {customerName && (
              <Typography 
                variant="h5" 
                gutterBottom 
                sx={{
                  color: theme.palette.text.secondary,
                  fontWeight: 500,
                  mb: 2,
                }}
              >
                {customerName}
              </Typography>
            )}
            
            <Typography 
              variant="h6" 
              sx={{ 
                maxWidth: 600, 
                mx: 'auto',
                color: theme.palette.text.secondary,
                lineHeight: 1.5,
              }}
            >
              {ratingInfo?.message || 'Seu feedback foi enviado com sucesso!'}
            </Typography>
          </Box>
        </Fade>

        {/* Restaurant Info */}
        {restaurant && (
          <Fade in={showContent} timeout={1000}>
            <Card 
              sx={{ 
                mb: 4, 
                maxWidth: 500, 
                mx: 'auto',
                borderRadius: 3,
                boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.08)}`,
                background: theme.palette.mode === 'dark'
                  ? `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.6)} 0%, ${alpha(theme.palette.background.paper, 0.8)} 100%)`
                  : `linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)`,
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                transition: 'transform 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-5px)',
                },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" alignItems="center" justifyContent="center" gap={2} mb={2}>
                  <Avatar 
                    sx={{ 
                      bgcolor: theme.palette.primary.main,
                      width: 48,
                      height: 48,
                      boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.4)}`,
                    }}
                  >
                    <RestaurantIcon />
                  </Avatar>
                  <Typography 
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                    }}
                  >
                    {restaurant}
                  </Typography>
                </Box>
                
                {rating && (
                  <Box 
                    display="flex" 
                    alignItems="center" 
                    justifyContent="center" 
                    gap={1}
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: alpha(theme.palette.background.default, 0.5),
                    }}
                  >
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>Sua avaliação:</Typography>
                    <Box display="flex" alignItems="center" gap={0.5}>
                      {[...Array(5)].map((_, index) => (
                        <StarIcon
                          key={index}
                          sx={{
                            color: index < rating ? ratingInfo?.color : alpha(theme.palette.text.disabled, 0.3),
                            fontSize: 24,
                            transition: 'all 0.3s ease',
                            animation: index < rating ? 'star-pulse 1.5s infinite' : 'none',
                            animationDelay: `${index * 0.2}s`,
                            '@keyframes star-pulse': {
                              '0%': {
                                transform: 'scale(1)',
                              },
                              '50%': {
                                transform: 'scale(1.2)',
                              },
                              '100%': {
                                transform: 'scale(1)',
                              },
                            },
                          }}
                        />
                      ))}
                    </Box>
                    <Chip 
                      label={`${rating}/5`} 
                      size="small" 
                      sx={{ 
                        bgcolor: ratingInfo?.color,
                        color: 'white',
                        fontWeight: 'bold',
                        ml: 1,
                      }} 
                    />
                  </Box>
                )}
                
                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  sx={{ 
                    mt: 2,
                    fontStyle: 'italic',
                  }}
                >
                  Enviado em {format(new Date(), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                </Typography>
              </CardContent>
            </Card>
          </Fade>
        )}

        {/* Reward Section */}
        {showReward && reward && (
          <Zoom in={showReward}>
            <Card 
              sx={{ 
                mb: 4, 
                maxWidth: 500, 
                mx: 'auto',
                borderRadius: 3,
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                color: 'white',
                boxShadow: `0 10px 30px ${alpha(theme.palette.primary.main, 0.4)}`,
                position: 'relative',
                overflow: 'hidden',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  top: '-50%',
                  right: '-50%',
                  width: '200%',
                  height: '200%',
                  background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)',
                  transform: 'rotate(30deg)',
                },
                transition: 'transform 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-5px)',
                },
              }}
            >
              <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
                <Box display="flex" alignItems="center" justifyContent="center" gap={2} mb={2}>
                  <GiftIcon 
                    sx={{ 
                      fontSize: 40,
                      animation: 'gift-bounce 2s infinite',
                      '@keyframes gift-bounce': {
                        '0%, 100%': {
                          transform: 'translateY(0)',
                        },
                        '50%': {
                          transform: 'translateY(-10px)',
                        },
                      },
                    }} 
                  />
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>Parabéns!</Typography>
                </Box>
                
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 500 }}>
                  Você ganhou uma recompensa!
                </Typography>
                
                <Typography variant="body1" sx={{ opacity: 0.9, mb: 2 }}>
                  {reward.description}
                </Typography>
                
                {reward.code && (
                  <Box mt={2}>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      Código do cupom:
                    </Typography>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontFamily: 'monospace',
                        bgcolor: 'rgba(255,255,255,0.2)',
                        p: 1.5,
                        borderRadius: 2,
                        mt: 1,
                        letterSpacing: '1px',
                        fontWeight: 600,
                        border: '1px dashed rgba(255,255,255,0.3)',
                      }}
                    >
                      {reward.code}
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Zoom>
        )}

        {/* Next Steps */}
        {showNextSteps && (
          <Fade in={showContent} timeout={1200}>
            <Box>
              <Typography 
                variant="h6" 
                gutterBottom 
                sx={{ 
                  color: theme.palette.text.secondary,
                  mb: 2,
                  fontWeight: 600,
                }}
              >
                O que acontece agora?
              </Typography>
              
              <Grid container spacing={2} sx={{ maxWidth: 600, mx: 'auto', mb: 4 }}>
                <Grid item xs={12} md={4}>
                  <Card 
                    variant="outlined" 
                    sx={{ 
                      p: 2, 
                      height: '100%',
                      borderRadius: 2,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        boxShadow: 3,
                        transform: 'translateY(-5px)',
                        borderColor: theme.palette.primary.main,
                      },
                    }}
                  >
                    <Typography 
                      variant="h6" 
                      gutterBottom 
                      sx={{ 
                        color: theme.palette.primary.main,
                        fontWeight: 600,
                      }}
                    >
                      📧 Resposta
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Nossa equipe pode entrar em contato para agradecer ou esclarecer dúvidas
                    </Typography>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Card 
                    variant="outlined" 
                    sx={{ 
                      p: 2, 
                      height: '100%',
                      borderRadius: 2,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        boxShadow: 3,
                        transform: 'translateY(-5px)',
                        borderColor: theme.palette.primary.main,
                      },
                    }}
                  >
                    <Typography 
                      variant="h6" 
                      gutterBottom 
                      sx={{ 
                        color: theme.palette.primary.main,
                        fontWeight: 600,
                      }}
                    >
                      📊 Melhoria
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Usamos seu feedback para melhorar nossos serviços continuamente
                    </Typography>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Card 
                    variant="outlined" 
                    sx={{ 
                      p: 2, 
                      height: '100%',
                      borderRadius: 2,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        boxShadow: 3,
                        transform: 'translateY(-5px)',
                        borderColor: theme.palette.primary.main,
                      },
                    }}
                  >
                    <Typography 
                      variant="h6" 
                      gutterBottom 
                      sx={{ 
                        color: theme.palette.primary.main,
                        fontWeight: 600,
                      }}
                    >
                      🎁 Recompensas
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Continue avaliando e ganhe pontos e recompensas especiais
                    </Typography>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          </Fade>
        )}

        {/* Action Buttons */}
        <Fade in={showContent} timeout={1400}>
          <Box 
            display="flex" 
            gap={2} 
            justifyContent="center" 
            flexWrap="wrap"
            sx={{ mb: 2 }}
          >
            <Button
              variant="outlined"
              startIcon={<ShareIcon />}
              onClick={handleShare}
              size="large"
              sx={{
                borderRadius: 2,
                px: 3,
                py: 1,
                textTransform: 'none',
                fontWeight: 600,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: 2,
                },
              }}
            >
              Compartilhar
            </Button>
          </Box>
        </Fade>

        {/* Footer */}
        {showFooter && (
          <Box mt={4}>
            <Divider sx={{ mb: 2, opacity: 0.6 }} />
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ mb: 0.5 }}
            >
              Obrigado por escolher nosso restaurante!
            </Typography>
            <Typography 
              variant="caption" 
              color="text.secondary"
              sx={{ 
                opacity: 0.7,
                fontStyle: 'italic',
              }}
            >
              {t('thank_you_card.powered_by')}
            </Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default ThankYouCard;
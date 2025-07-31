import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import { Casino as CasinoIcon } from '@mui/icons-material';

const SpinTheWheel = ({ wheelConfig, onSpinComplete, winningItem }) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState(null);

  

  const handleSpin = () => {
    setIsSpinning(true);
    setResult(null);
    setTimeout(() => {
      setResult(winningItem);
      setIsSpinning(false);
      if (onSpinComplete) {
        onSpinComplete(winningItem);
      }
    }, 1500); // Tempo para a animação de giro
  };

  return (
    <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3, boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}>
      <Typography variant="h5" gutterBottom>
        Gire a Roleta!
      </Typography>
      <Box // .roleta-container
        sx={{
          position: 'relative',
          margin: '20px auto',
          width: 300,
          height: 300,
          filter: 'drop-shadow(0 0 20px rgba(255, 215, 0, 0.3))',
        }}
      >
        <Box // #roleta
          sx={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            border: '12px solid #FFD700',
            boxShadow: '0 0 30px rgba(255, 215, 0, 0.3), inset 0 0 20px rgba(0, 0, 0, 0.5)',
            background: '#F1FAEE',
            cursor: 'pointer',
            userSelect: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
            transition: 'transform 1.5s ease-out',
            transform: isSpinning ? 'rotate(720deg)' : 'rotate(0deg)', // Animação simples
          }}
        >
          <CasinoIcon sx={{ fontSize: 80, color: '#d32f2f' }} />
        </Box>
        <Box // .seta
          sx={{
            position: 'absolute',
            top: -25,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 0,
            height: 0,
            borderLeft: '18px solid transparent',
            borderRight: '18px solid transparent',
            borderTop: '30px solid #FFD700',
            zIndex: 10,
            filter: 'drop-shadow(0 0 5px #FFD700)',
            '&::after': { // Pseudo-elemento para o círculo da seta
              content: '""',
              position: 'absolute',
              top: -33,
              left: -10,
              width: 20,
              height: 20,
              background: '#FFD700',
              borderRadius: '50%',
              zIndex: -1,
              boxShadow: '0 0 10px #FFD700',
            }
          }}
        />
      </Box>

      <Button
          variant="contained"
          onClick={handleSpin}
          disabled={isSpinning || result}
          startIcon={<CasinoIcon />}
          sx={{
            background: 'linear-gradient(135deg, #FFD700, #FFAA00)',
            color: '#000',
            fontWeight: 600,
            fontSize: '16px',
            padding: '12px 25px',
            borderRadius: '50px',
            border: 'none',
            marginTop: '15px',
            userSelect: 'none',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 15px rgba(255, 215, 0, 0.4)',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            position: 'relative',
            overflow: 'hidden',
            '&:hover:not(:disabled)': {
              transform: 'translateY(-3px)',
              boxShadow: '0 6px 20px rgba(255, 215, 0, 0.6)',
              background: 'linear-gradient(135deg, #FFD700, #FFAA00)', // Manter o gradiente no hover
            },
            '&:active:not(:disabled)': {
              transform: 'translateY(1px)',
            },
            '&:disabled': {
              opacity: 0.7,
              cursor: 'not-allowed',
              transform: 'none !important',
            },
          }}
        >
          {isSpinning ? 'Girando...' : 'GIRAR ROLETA'}
        </Button>

      {result && (
        <Box
          sx={{
            margin: '20px auto 0',
            fontSize: '18px',
            fontWeight: 600,
            color: '#FFD700',
            minHeight: '40px',
            textShadow: '0 0 8px rgba(255, 215, 0, 0.5)',
            padding: '15px',
            background: 'rgba(0, 0, 0, 0.4)',
            borderRadius: '10px',
            border: '1px solid rgba(255, 215, 0, 0.2)',
            backdropFilter: 'blur(5px)',
            boxShadow: '0 5px 15px rgba(0, 0, 0, 0.2)',
            transition: 'all 0.5s ease',
            maxWidth: '90%',
            wordWrap: 'break-word',
            animation: 'pulse 2s infinite', // Adicionar animação pulse
            '@keyframes pulse': { // Definir keyframes para a animação
              '0%': { transform: 'scale(1)', opacity: 1 },
              '50%': { transform: 'scale(1.05)', opacity: 0.8 },
              '100%': { transform: 'scale(1)', opacity: 1 },
            },
          }}
        >
          <Typography variant="inherit" component="span">
            Parabéns! Você ganhou:{" "}
            <Typography variant="inherit" component="strong" sx={{ color: '#fff', fontWeight: 700 }}>
              {result.title}
            </Typography>
          </Typography>
          {result.coupon_code && (
            <Typography variant="body1" sx={{ mt: 1, color: 'text.secondary' }}>
              Cupom: {result.coupon_code}
            </Typography>
          )}
          {result.description && (
            <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
              {result.description}
            </Typography>
          )}
        </Box>

      <Box sx={{ mt: 3, textAlign: 'left', color: 'rgba(255, 255, 255, 0.8)' }}>
        <Typography variant="subtitle2" sx={{ color: 'inherit' }}>Itens da Roleta:</Typography>
        <List dense>
          {wheelConfig?.items?.map((item, index) => (
            <ListItem key={index} disablePadding>
              <ListItemText primary={`${item.title} (${item.probability}%)`} sx={{ color: 'inherit' }} />
            </ListItem>
          ))}
        </List>
      </Box>
    </Paper>
  </>
  );
};

export default SpinTheWheel;

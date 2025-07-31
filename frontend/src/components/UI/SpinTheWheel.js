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
      <Box
        sx={{
          width: 200,
          height: 200,
          borderRadius: '50%',
          bgcolor: '#ffeb3b',
          border: '5px solid #fbc02d',
          margin: '20px auto',
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

      {!winningItem && (
        <Button
          variant="contained"
          color="primary"
          onClick={handleSpin}
          disabled={isSpinning}
          startIcon={<CasinoIcon />}
          sx={{ mt: 2 }}
        >
          {isSpinning ? 'Girando...' : 'Girar Roleta'}
        </Button>
      )}

      {result && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" color="success.main">
            Parabéns! Você ganhou:
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 1 }}>
            {result.title}
          </Typography>
          {result.coupon_code && (
            <Typography variant="h6" color="text.secondary">
              Cupom: {result.coupon_code}
            </Typography>
          )}
          {result.description && (
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
              {result.description}
            </Typography>
          )}
        </Box>
      )}

      <Box sx={{ mt: 3, textAlign: 'left' }}>
        <Typography variant="subtitle2" color="text.secondary">Itens da Roleta:</Typography>
        <List dense>
          {wheelConfig?.items?.map((item, index) => (
            <ListItem key={index} disablePadding>
              <ListItemText primary={`${item.title} (${item.probability}%)`} />
            </ListItem>
          ))}
        </List>
      </Box>
    </Paper>
  );
};

export default SpinTheWheel;

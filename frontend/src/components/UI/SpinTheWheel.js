import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import { Casino as CasinoIcon } from '@mui/icons-material'; // Keep for button icon

const SpinTheWheel = ({ wheelConfig, onSpinComplete, winningItem }) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [rotation, setRotation] = useState(0); // Current rotation of the wheel
  const wheelRef = useRef(null); // Ref for the wheel element

  // Function to generate a random color for segments
  const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  // Calculate conic gradient and segment data
  const getWheelSegments = () => {
    if (!wheelConfig || !wheelConfig.items || wheelConfig.items.length === 0) {
      return { gradient: '', segments: [] };
    }

    let totalProbability = wheelConfig.items.reduce((sum, item) => sum + item.probability, 0);
    if (totalProbability === 0) totalProbability = 1; // Avoid division by zero

    let currentAngle = 0;
    const gradientParts = [];
    const segmentsData = [];
    const colors = wheelConfig.items.map(() => getRandomColor()); // Assign a color to each item

    wheelConfig.items.forEach((item, index) => {
      const segmentAngle = (item.probability / totalProbability) * 360;
      const startAngle = currentAngle;
      const endAngle = currentAngle + segmentAngle;

      gradientParts.push(`${colors[index]} ${startAngle}deg ${endAngle}deg`);
      segmentsData.push({
        ...item,
        color: colors[index],
        startAngle,
        endAngle,
        midAngle: startAngle + segmentAngle / 2, // For positioning text
      });
      currentAngle = endAngle;
    });

    return {
      gradient: `conic-gradient(from 0deg, ${gradientParts.join(', ')})`,
      segments: segmentsData,
    };
  };

  const { gradient, segments } = getWheelSegments();

  useEffect(() => {
    if (result && winningItem) {
      // Calculate target rotation to land on the winning item
      const winningSegment = segments.find(s => s.title === winningItem.title); // Assuming title is unique
      if (winningSegment) {
        // We want the pointer (at 0 degrees, top) to point to the middle of the winning segment.
        // The wheel rotates clockwise.
        // If midAngle is 90, we need to rotate the wheel -90 degrees to bring it to the top.
        // Add multiple full rotations to make it spin visibly.
        const baseRotation = 360 * 5; // 5 full spins
        const targetAngle = baseRotation - winningSegment.midAngle; // Rotate counter-clockwise to bring mid-angle to top

        // Adjust for the pointer being at the top (0 degrees)
        // If the segment is from 0 to 90, mid is 45. We want to rotate -45.
        // If the segment is from 90 to 180, mid is 135. We want to rotate -135.
        // This seems correct.

        setRotation(targetAngle);
      }
    }
  }, [result, winningItem, segments]);


  const handleSpin = () => {
    setIsSpinning(true);
    setResult(null);
    // The actual spin logic will be handled by the backend, which provides winningItem.
    // We just need to trigger the spin and wait for the winningItem to be set.
    // The useEffect above will then set the rotation.
    // For now, simulate the backend response after a delay.
    // If winningItem is not provided, we can't animate to a specific spot.
    setTimeout(() => {
      if (winningItem) {
        setResult(winningItem);
        setIsSpinning(false);
        if (onSpinComplete) {
          onSpinComplete(winningItem);
        }
      } else {
        console.warn("winningItem not provided, cannot animate spin.");
        setIsSpinning(false);
      }
    }, 2000); // Simulate API call delay + spin animation time
  };

  return (
    <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3, boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}>
      <Box>
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
          <Box // #roleta - The actual wheel
            ref={wheelRef}
            sx={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              border: '12px solid #FFD700',
              boxShadow: '0 0 30px rgba(255, 215, 0, 0.3), inset 0 0 20px rgba(0, 0, 0, 0.5)',
              background: gradient, // Use conic gradient for segments
              cursor: 'pointer',
              userSelect: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              overflow: 'hidden',
              transition: 'transform 4s ease-out', // Longer transition for spin animation
              transform: `rotate(${rotation}deg)`, // Apply dynamic rotation
            }}
          >
            {/* Render text labels for segments */}
            {segments.map((segment, index) => (
              <Box
                key={index}
                sx={{
                  position: 'absolute',
                  width: '50%', // Half the wheel radius
                  height: '50%',
                  top: '0%',
                  left: '50%',
                  transformOrigin: '0% 100%', // Rotate around the center of the wheel
                  transform: `rotate(${segment.midAngle}deg) translateY(-50%) translateX(-50%) rotate(90deg)`, // Position and rotate text
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white', // Text color
                  fontWeight: 'bold',
                  fontSize: '12px',
                  textShadow: '1px 1px 2px rgba(0,0,0,0.7)',
                  zIndex: 1,
                  // Clip text to segment boundaries (optional, but good for overlapping text)
                  // clipPath: `polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)`, // This is complex with arbitrary angles
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    transform: `rotate(-${segment.midAngle}deg)`, // Counter-rotate text to keep it upright
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '90%', // Prevent text from going too far
                    color: 'white',
                    textAlign: 'center',
                  }}
                >
                  {segment.title}
                </Typography>
              </Box>
            ))}
          </Box>
          <Box // .seta - Pointer
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
              <strong style={{ color: 'white', fontWeight: 700 }}>
                {result.title}
              </strong>
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
        )}

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
      </Box>
    </Paper>
  );
};

export default SpinTheWheel;

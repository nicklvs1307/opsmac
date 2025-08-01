import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  const canvasRef = useRef(null);
  const rotationRef = useRef(0); // Current rotation in degrees
  const animationFrameId = useRef(null);

  const wheelSize = 300; // px
  const center = wheelSize / 2;
  const radius = center - 15; // Account for border

  const getRandomColor = useCallback(() => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }, []);

  const drawWheel = useCallback((currentRotation = 0) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, wheelSize, wheelSize);

    if (!wheelConfig || !wheelConfig.items || wheelConfig.items.length === 0) {
      // Draw a placeholder if no items
      ctx.beginPath();
      ctx.arc(center, center, radius, 0, 2 * Math.PI);
      ctx.fillStyle = '#F1FAEE';
      ctx.fill();
      ctx.strokeStyle = '#FFD700';
      ctx.lineWidth = 12;
      ctx.stroke();
      ctx.font = '20px Arial';
      ctx.fillStyle = '#333';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Adicione Itens', center, center);
      return;
    }

    let totalProbability = wheelConfig.items.reduce((sum, item) => sum + item.probability, 0);
    if (totalProbability === 0) totalProbability = 1; // Avoid division by zero

    let startAngle = 0;
    const assignedColors = wheelConfig.items.map(item => item.color || getRandomColor());

    // Apply overall rotation to the canvas context
    ctx.save();
    ctx.translate(center, center);
    ctx.rotate((currentRotation * Math.PI) / 180); // Convert degrees to radians
    ctx.translate(-center, -center);

    wheelConfig.items.forEach((item, index) => {
      const segmentAngle = (item.probability / totalProbability) * 2 * Math.PI;
      const endAngle = startAngle + segmentAngle;

      // Draw segment
      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.arc(center, center, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = assignedColors[index];
      ctx.fill();

      // Draw segment border
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Draw text
      ctx.save();
      ctx.translate(center, center);
      const midAngle = startAngle + segmentAngle / 2;
      ctx.rotate(midAngle); // Rotate to the middle of the segment

      ctx.fillStyle = item.colorText || (assignedColors[index] === '#000000' ? '#FFFFFF' : '#000000'); // Dynamic text color
      ctx.font = 'bold 12px Poppins'; // Adjust font size as needed
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const textRadius = radius * 0.65; // Position text further out
      const text = item.title;

      // Handle long text by splitting or adjusting font size
      const maxTextWidth = radius * 0.8; // Max width for text
      const words = text.split(' ');
      let line = '';
      const lines = [];

      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;
        if (testWidth > maxTextWidth && n > 0) {
          lines.push(line);
          line = words[n] + ' ';
        } else {
          line = testLine;
        }
      }
      lines.push(line);

      const lineHeight = 14; // px
      let yOffset = -((lines.length - 1) * lineHeight) / 2;

      lines.forEach((l, i) => {
        ctx.fillText(l.trim(), textRadius, yOffset + i * lineHeight);
      });

      ctx.restore();
      startAngle = endAngle;
    });

    // Draw center circle
    ctx.beginPath();
    ctx.arc(center, center, 20, 0, 2 * Math.PI);
    ctx.fillStyle = '#FFD700';
    ctx.fill();
    ctx.strokeStyle = '#FFF';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.restore(); // Restore canvas context to original state
  }, [wheelConfig, getRandomColor, center, radius, wheelSize]);

  // Redraw wheel whenever wheelConfig changes (for real-time preview)
  useEffect(() => {
    drawWheel(rotationRef.current);
  }, [wheelConfig, drawWheel]);

  // Animation for spinning
  const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);

  const animateSpin = useCallback((targetRotation, duration = 5000) => {
    const start = performance.now();
    const initialRotation = rotationRef.current;

    const animate = (currentTime) => {
      const elapsed = currentTime - start;
      let progress = elapsed / duration;
      if (progress > 1) progress = 1;

      const easedProgress = easeOutQuart(progress);
      rotationRef.current = initialRotation + (targetRotation - initialRotation) * easedProgress;

      drawWheel(rotationRef.current);

      if (progress < 1) {
        animationFrameId.current = requestAnimationFrame(animate);
      } else {
        setIsSpinning(false);
        setResult(winningItem);
        if (onSpinComplete) {
          onSpinComplete(winningItem);
        }
      }
    };
    animationFrameId.current = requestAnimationFrame(animate);
  }, [drawWheel, onSpinComplete, winningItem]);

  useEffect(() => {
    if (result && winningItem && !isSpinning) {
      // Calculate target rotation to land on the winning item
      let totalProbability = wheelConfig.items.reduce((sum, item) => sum + item.probability, 0);
      if (totalProbability === 0) totalProbability = 1;

      let currentAngleDegrees = 0;
      let winningSegment = null;

      for (const item of wheelConfig.items) {
        const segmentAngleDegrees = (item.probability / totalProbability) * 360;
        if (item.title === winningItem.title) {
          winningSegment = {
            start: currentAngleDegrees,
            end: currentAngleDegrees + segmentAngleDegrees,
            mid: currentAngleDegrees + segmentAngleDegrees / 2,
          };
          break;
        }
        currentAngleDegrees += segmentAngleDegrees;
      }

      if (winningSegment) {
        // We want the pointer (at 0 degrees, top) to point to the middle of the winning segment.
        // The wheel rotates clockwise. So, if the mid-angle is 90 degrees, we need to rotate the wheel -90 degrees.
        // Add multiple full rotations to make it spin visibly.
        const baseRotations = 5; // 5 full spins
        const targetRotation = (baseRotations * 360) - winningSegment.mid; // Rotate counter-clockwise

        // Adjust for current rotation to ensure it always spins forward
        const currentFullRotations = Math.floor(rotationRef.current / 360);
        const adjustedTargetRotation = (currentFullRotations + baseRotations) * 360 - winningSegment.mid;

        animateSpin(adjustedTargetRotation);
      }
    }
  }, [result, winningItem, wheelConfig, isSpinning, animateSpin]);

  const handleSpin = () => {
    if (isSpinning || !wheelConfig || !wheelConfig.items || wheelConfig.items.length === 0) return;

    setIsSpinning(true);
    setResult(null);
    // The actual winningItem should come from the backend after an API call.
    // For preview mode, we don't spin, just show the wheel.
    // For actual spin, winningItem will be provided by parent component.
    if (!winningItem) {
      console.warn("No winningItem provided. Wheel will not animate to a specific result.");
      // Simulate a random win for demonstration if no winningItem is provided
      const randomIndex = Math.floor(Math.random() * wheelConfig.items.length);
      const simulatedWinningItem = wheelConfig.items[randomIndex];
      // This part would be replaced by an actual API call that returns the winning item
      setTimeout(() => {
        setResult(simulatedWinningItem);
        setIsSpinning(false);
        if (onSpinComplete) {
          onSpinComplete(simulatedWinningItem);
        }
      }, 2000); // Simulate API call delay
    }
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
            width: wheelSize,
            height: wheelSize,
            filter: 'drop-shadow(0 0 20px rgba(255, 215, 0, 0.3))',
          }}
        >
          <canvas
            ref={canvasRef}
            width={wheelSize}
            height={wheelSize}
            style={{
              borderRadius: '50%',
              border: '12px solid #FFD700',
              boxShadow: '0 0 30px rgba(255, 215, 0, 0.3), inset 0 0 20px rgba(0, 0, 0, 0.5)',
              cursor: 'pointer',
              userSelect: 'none',
              position: 'relative',
              zIndex: 1,
            }}
          />
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
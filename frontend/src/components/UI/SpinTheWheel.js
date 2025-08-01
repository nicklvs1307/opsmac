import React, { useEffect, useRef, useCallback } from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemText } from '@mui/material';

const SpinTheWheel = ({ items, winningItem, onAnimationComplete }) => {
  const canvasRef = useRef(null);
  const rotationRef = useRef(0);
  const animationFrameId = useRef(null);

  const wheelSize = 300;
  const center = wheelSize / 2;
  const radius = center - 15;

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

    if (!items || items.length === 0) {
      return;
    }

    const numItems = items.length;
    const segmentAngle = (2 * Math.PI) / numItems;
    let startAngle = 0;
    const assignedColors = items.map(item => item.color || getRandomColor());

    ctx.save();
    ctx.translate(center, center);
    ctx.rotate((currentRotation * Math.PI) / 180);
    ctx.translate(-center, -center);

    items.forEach((item, index) => {
      const endAngle = startAngle + segmentAngle;
      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.arc(center, center, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = assignedColors[index];
      ctx.fill();

      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(startAngle + segmentAngle / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 14px Arial';
      ctx.fillText(item.name, radius - 10, 10);
      ctx.restore();

      startAngle = endAngle;
    });

    ctx.restore();
  }, [items, getRandomColor, center, radius, wheelSize]);

  useEffect(() => {
    drawWheel();
  }, [drawWheel]);

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
        if (onAnimationComplete) {
          onAnimationComplete();
        }
      }
    };
    animationFrameId.current = requestAnimationFrame(animate);
  }, [drawWheel, onAnimationComplete]);

  useEffect(() => {
    if (winningItem && items && items.length > 0) {
      const numItems = items.length;
      const segmentAngleDegrees = 360 / numItems;
      const winningIndex = items.findIndex(item => item.name === winningItem.name);

      if (winningIndex !== -1) {
        const targetAngle = 360 - (winningIndex * segmentAngleDegrees) - (segmentAngleDegrees / 2);
        const targetRotation = (360 * 5) + targetAngle;
        animateSpin(targetRotation);
      }
    }
  }, [winningItem, items, animateSpin]);

  return (
    <Paper sx={{ p: 4, textAlign: 'center' }}>
      <Box>
        <Typography variant="h5" gutterBottom>Gire a Roleta!</Typography>
        <Box sx={{ position: 'relative', margin: '20px auto', width: wheelSize, height: wheelSize }}>
          <canvas ref={canvasRef} width={wheelSize} height={wheelSize} />
        </Box>
        <Box sx={{ mt: 3, textAlign: 'left' }}>
          <Typography variant="subtitle2">Itens da Roleta:</Typography>
          <List dense>
            {items?.map((item, index) => (
              <ListItem key={index} disablePadding>
                <ListItemText primary={`${item.name} (${item.probability}%)`} />
              </ListItem>
            ))}
          </List>
        </Box>
      </Box>
    </Paper>
  );
};

export default SpinTheWheel;
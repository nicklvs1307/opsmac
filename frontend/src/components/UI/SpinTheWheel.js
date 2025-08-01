import React, { useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';

const SpinTheWheel = ({ items, onSpinFinish, isSpinning }) => {
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

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.save();
      ctx.translate(center, center);
      const midAngle = startAngle + segmentAngle / 2;
      ctx.rotate(midAngle);

      const textRadius = radius * 0.65;
      ctx.translate(textRadius, 0);

      ctx.rotate(-midAngle);

      ctx.fillStyle = item.colorText || (assignedColors[index] === '#000000' ? '#FFFFFF' : '#000000');
      ctx.font = 'bold 12px Poppins';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const text = item.title;
      const maxTextWidth = radius * 0.8;
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

      const lineHeight = 14;
      let yOffset = -((lines.length - 1) * lineHeight) / 2;

      lines.forEach((l, i) => {
        ctx.fillText(l.trim(), 0, yOffset + i * lineHeight);
      });

      ctx.restore();
      startAngle = endAngle;
    });

    ctx.beginPath();
    ctx.arc(center, center, 20, 0, 2 * Math.PI);
    ctx.fillStyle = '#FFD700';
    ctx.fill();
    ctx.strokeStyle = '#FFF';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.restore();
  }, [items, getRandomColor, center, radius, wheelSize]);

  useEffect(() => {
    drawWheel(rotationRef.current);
  }, [items, drawWheel]);

  const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);

  const animateSpin = useCallback((winningItem, duration = 5000) => {
    const numItems = items.length;
    if (numItems === 0) return;

    const segmentAngleDegrees = 360 / numItems;
    const winningIndex = items.findIndex(item => item.title === winningItem.title);
    
    if (winningIndex === -1) return;

    const targetAngle = 360 - (winningIndex * segmentAngleDegrees) - (segmentAngleDegrees / 2);
    const targetRotation = (360 * 5) + targetAngle;

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
        if (onSpinFinish) {
          onSpinFinish(winningItem);
        }
      }
    };
    animationFrameId.current = requestAnimationFrame(animate);
  }, [drawWheel, onSpinFinish, items]);

  useEffect(() => {
    if (isSpinning && items && items.length > 0) {
      const winningItem = items[Math.floor(Math.random() * items.length)];
      animateSpin(winningItem);
    }
  }, [isSpinning, items, animateSpin]);

  return (
    <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3, boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}>
      <Box>
        <Typography variant="h5" gutterBottom>
          Gire a Roleta!
        </Typography>
        <Box
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
          <Box
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
              '&::after': {
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

        <Box sx={{ mt: 3, textAlign: 'left', color: 'rgba(255, 255, 255, 0.8)' }}>
          <Typography variant="subtitle2" sx={{ color: 'inherit' }}>Itens da Roleta:</Typography>
          <List dense>
            {items?.map((item, index) => (
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

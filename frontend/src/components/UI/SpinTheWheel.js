import React, { useEffect, useRef, useCallback } from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemText } from '@mui/material';

const SpinTheWheel = ({ items, winningItem, onAnimationComplete }) => {
  const canvasRef = useRef(null);
  const rotationRef = useRef(0);
  const animationFrameId = useRef(null);

  const wheelSize = 300;
  const center = wheelSize / 2;
  const radius = center - 15;

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

    ctx.save();
    ctx.translate(center, center);
    ctx.rotate((currentRotation * Math.PI) / 180);
    ctx.translate(-center, -center);

    items.forEach((item, index) => {
      const endAngle = startAngle + segmentAngle;

      ctx.fillStyle = item.color;
      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.arc(center, center, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.lineTo(center + radius * Math.cos(startAngle), center + radius * Math.sin(startAngle));
      ctx.stroke();

      ctx.save();
      ctx.fillStyle = item.textColor;
      ctx.font = 'bold 11px Poppins'; // Using Poppins as per example.html
      ctx.translate(center, center);
      
      const angMeio = startAngle + segmentAngle / 2;
      ctx.rotate(angMeio);
      
      const textRadius = radius * 0.55;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      const palavras = (item.name || item.title).split(' ');
      if (palavras.length > 2) {
        ctx.font = 'bold 9px Poppins';
        palavras.forEach((palavra, idx) => {
          ctx.fillText(palavra, textRadius, (idx - (palavras.length-1)/2) * 12);
        });
      } else if (palavras.length > 1) {
        ctx.font = 'bold 10px Poppins';
        palavras.forEach((palavra, idx) => {
          ctx.fillText(palavra, textRadius, (idx * 12) - 6);
        });
      } else {
        ctx.font = 'bold 11px Poppins';
        ctx.fillText(item.name || item.title, textRadius, 0);
      }
      
      ctx.restore();

      startAngle = endAngle;
    });

    // Draw center circle
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(center, center, 15, 0, 2 * Math.PI);
    ctx.fill();
    
    ctx.strokeStyle = '#FFF';
    ctx.lineWidth = 3;
    ctx.stroke();
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.beginPath();
    ctx.arc(center, center, 8, 0, 2 * Math.PI);
    ctx.fill();

    ctx.restore();
  }, [items, center, radius, wheelSize]);

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
      const winningIndex = items.findIndex(item => (item.name || item.title) === (winningItem.name || winningItem.title));

      if (winningIndex !== -1) {
        const targetAngle = 360 - (winningIndex * segmentAngleDegrees) - (segmentAngleDegrees / 2);
        const targetRotation = (360 * 5) + targetAngle;
        animateSpin(targetRotation);
      }
    }
  }, [winningItem, items, animateSpin]);

  return (
    <Box
      className="roleta-container" // Class for external styling if needed
      sx={{
        position: 'relative',
        margin: '20px auto',
        width: wheelSize,
        height: wheelSize,
        filter: 'drop-shadow(0 0 20px rgba(255, 215, 0, 0.3))',
      }}
    >
      <canvas
        id="roleta" // ID as in example.html
        ref={canvasRef}
        width={wheelSize}
        height={wheelSize}
        style={{
          borderRadius: '50%',
          border: '12px solid #FFD700', // var(--gold)
          boxShadow: '0 0 30px rgba(255, 215, 0, 0.3), inset 0 0 20px rgba(0, 0, 0, 0.5)',
          cursor: 'pointer',
          userSelect: 'none',
          background: '#F1FAEE', // var(--cream)
          transition: 'transform 0.1s',
          position: 'relative',
          zIndex: 1,
        }}
      />
      <Box
        className="seta" // Class for external styling if needed
        sx={{
          position: 'absolute',
          top: -25,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 0,
          height: 0,
          borderLeft: '18px solid transparent',
          borderRight: '18px solid transparent',
          borderTop: '30px solid #FFD700', // var(--gold)
          zIndex: 10,
          filter: 'drop-shadow(0 0 5px #FFD700)', // var(--gold)
          '&::after': { // Pseudo-element for the dot on the arrow
            content: '""',
            position: 'absolute',
            top: -33,
            left: -10,
            width: 20,
            height: 20,
            background: '#FFD700', // var(--gold)
            borderRadius: '50%',
            zIndex: -1,
            boxShadow: '0 0 10px #FFD700', // var(--gold)
          }
        }}
      />
    </Box>
  );
};

export default SpinTheWheel;

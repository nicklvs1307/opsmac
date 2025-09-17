import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  Chip,
} from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import SpinTheWheel from '@/components/UI/SpinTheWheel';

const RewardCard = ({ reward, onClick, getTypeLabel, getStatusLabel, getTypeColor, getStatusColor }) => {
  return (
    <Card
      sx={{ height: '100%', display: 'flex', flexDirection: 'column', cursor: 'pointer' }}
      onClick={() => onClick(reward)}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Avatar sx={{ bgcolor: 'primary.main' }}>
            <EmojiEventsIcon />
          </Avatar>
        </Box>

        <Typography variant="h6" gutterBottom noWrap>
          {reward.title}
        </Typography>

        <Typography variant="body2" color="text.secondary" paragraph>
          {reward.description}
        </Typography>

        {reward.reward_type === 'spin_the_wheel' &&
          reward.wheel_config?.items?.length > 0 && (
            <Box sx={{ my: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Itens da Roleta:
              </Typography>
              <SpinTheWheel items={reward.wheel_config.items} />
            </Box>
          )}

        <Box display="flex" gap={1} mb={2}>
          <Chip
            label={getTypeLabel(reward.type)}
            color={getTypeColor(reward.type)}
            size="small"
          />
          <Chip
            label={getStatusLabel(reward.status)}
            color={getStatusColor(reward.status)}
            size="small"
          />
        </Box>

        <Typography variant="body2">
          <strong>Valor:</strong> {reward.value}%
        </Typography>
        <Typography variant="body2">
          <strong>Pontos:</strong> {reward.points_required}
        </Typography>
        {reward.max_uses && (
          <Typography variant="body2">
            <strong>Usos máximos:</strong> {reward.max_uses}
          </Typography>
        )}

        <Typography variant="caption" color="text.secondary" display="block" mt={1}>
          Criado:{' '}
          {reward.created_at && !isNaN(new Date(reward.created_at))
            ? format(new Date(reward.created_at), 'dd/MM/yyyy', { locale: ptBR })
            : 'Data inválida'}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default RewardCard;

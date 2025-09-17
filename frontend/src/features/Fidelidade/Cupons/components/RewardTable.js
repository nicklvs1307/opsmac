import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Typography,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

const RewardTable = ({ rewards, handleOpenEditDialog, deleteRewardMutation }) => {
  const { t } = useTranslation();

  if (!rewards || rewards.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
        {t('reward_management.no_rewards_found')}
      </Typography>
    );
  }

  return (
    <TableContainer component={Paper} elevation={3}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>{t('reward_management.table_header.title')}</TableCell>
            <TableCell>{t('reward_management.table_header.description')}</TableCell>
            <TableCell>{t('reward_management.table_header.value')}</TableCell>
            <TableCell>{t('reward_management.table_header.type')}</TableCell>
            <TableCell>{t('reward_management.table_header.active')}</TableCell>
            <TableCell align="right">{t('reward_management.table_header.actions')}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rewards.map((reward) => (
            <TableRow key={reward.id}>
              <TableCell>{reward.title}</TableCell>
              <TableCell>{reward.description}</TableCell>
              <TableCell>{reward.value}</TableCell>
              <TableCell>{reward.reward_type}</TableCell>
              <TableCell>{reward.is_active ? t('common.yes') : t('common.no')}</TableCell>
              <TableCell align="right">
                <IconButton onClick={() => handleOpenEditDialog(reward)}>
                  <EditIcon />
                </IconButton>
                <IconButton
                  onClick={() => deleteRewardMutation.mutate({ rewardId: reward.id })}
                >
                  <DeleteIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default RewardTable;

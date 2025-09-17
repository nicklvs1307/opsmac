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
  Box,
  LinearProgress,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';

const GoalTable = ({ goals, handleOpenEditDialog, deleteGoalMutation, updateProgressMutation, token }) => {
  const { t } = useTranslation();

  if (!goals || goals.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
        {t('goals.no_goals_found')}
      </Typography>
    );
  }

  return (
    <TableContainer component={Paper} elevation={3}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>{t('goals.table_header.name')}</TableCell>
            <TableCell>{t('goals.table_header.metric')}</TableCell>
            <TableCell>{t('goals.table_header.target_value')}</TableCell>
            <TableCell>{t('goals.table_header.current_value')}</TableCell>
            <TableCell>{t('goals.table_header.progress')}</TableCell>
            <TableCell>{t('goals.table_header.period')}</TableCell>
            <TableCell>{t('goals.table_header.status')}</TableCell>
            <TableCell align="right">{t('goals.table_header.actions')}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {goals.map((goal) => (
            <TableRow key={goal.id}>
              <TableCell>{goal.name}</TableCell>
              <TableCell>{t(`goals.metric_type.${goal.metric}`)}</TableCell>
              <TableCell>{goal.targetValue}</TableCell>
              <TableCell>{goal.currentValue}</TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ width: '100%', mr: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={(goal.currentValue / goal.targetValue) * 100}
                    />
                  </Box>
                  <Box sx={{ minWidth: 35 }}>
                    <Typography variant="body2" color="text.secondary">{`${Math.round(
                      (goal.currentValue / goal.targetValue) * 100
                    )}%`}</Typography>
                  </Box>
                </Box>
              </TableCell>
              <TableCell>{`${format(new Date(goal.startDate), 'dd/MM/yyyy')} - ${format(new Date(goal.endDate), 'dd/MM/yyyy')}`}</TableCell>
              <TableCell>{t(`goals.status_type.${goal.status}`)}</TableCell>
              <TableCell align="right">
                <IconButton
                  onClick={() => updateProgressMutation.mutate({ goalId: goal.id, token })}
                >
                  <RefreshIcon />
                </IconButton>
                <IconButton onClick={() => handleOpenEditDialog(goal)}>
                  <EditIcon />
                </IconButton>
                <IconButton
                  onClick={() => deleteGoalMutation.mutate({ goalId: goal.id, token })}
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

export default GoalTable;

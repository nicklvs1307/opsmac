import React from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { useAuth } from '@/app/providers/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

import { useCurrentStockPosition } from '../api/financialReportsQueries';

const CurrentStockPositionReport = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const restaurantId = user?.restaurants?.[0]?.id;

  const {
    data: stockPositions,
    isLoading,
    isError,
  } = useCurrentStockPosition(restaurantId, {
    onError: (error) => {
      toast.error(
        t('reports.error_loading_stock_position', {
          message: error.response?.data?.msg || error.message,
        })
      );
    },
  });

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Alert severity="error">{t('reports.error_loading_report')}</Alert>
      </Box>
    );
  }

  if (!restaurantId) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Alert severity="warning">{t('reports.no_restaurant_associated')}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {t('reports.current_stock_position_title')}
      </Typography>

      {stockPositions && stockPositions.length > 0 ? (
        <TableContainer component={Paper} elevation={2}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>{t('reports.item_name')}</TableCell>
                <TableCell>{t('reports.item_type')}</TableCell>
                <TableCell align="right">{t('reports.quantity')}</TableCell>
                <TableCell>{t('reports.unit_of_measure')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {stockPositions.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.type}</TableCell>
                  <TableCell align="right">{item.quantity}</TableCell>
                  <TableCell>{item.unit_of_measure || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Alert severity="info">{t('reports.no_stock_found')}</Alert>
      )}
    </Box>
  );
};

export default CurrentStockPositionReport;

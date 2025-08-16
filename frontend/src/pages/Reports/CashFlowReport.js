import React, { useState } from 'react';
import { Box, Typography, CircularProgress, Alert, Button, TextField, Paper } from '@mui/material';
import { useQuery } from 'react-query';
import axiosInstance from '../api/axiosInstance';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { Refresh as RefreshIcon } from '@mui/icons-material';

const fetchCashFlowReport = async ({ queryKey }) => {
  const [, restaurantId, filters] = queryKey;
  const { start_date, end_date } = filters;
  if (!start_date || !end_date) {
    return null; // Don't fetch if dates are not set
  }
  const { data } = await axiosInstance.get(`/api/financial/reports/cash-flow?restaurant_id=${restaurantId}&start_date=${start_date}&end_date=${end_date}`);
  return data;
};

const CashFlowReport = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const restaurantId = user?.restaurants?.[0]?.id;

  const [filters, setFilters] = useState({
    start_date: '',
    end_date: '',
  });

  const { data: reportData, isLoading, isError, refetch } = useQuery(
    ['cashFlowReport', restaurantId, filters],
    fetchCashFlowReport,
    {
      enabled: !!restaurantId && !!filters.start_date && !!filters.end_date,
      onError: (error) => {
        toast.error(t('reports.error_loading_cash_flow', { message: error.response?.data?.msg || error.message }));
      },
    }
  );

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleGenerateReport = () => {
    if (!filters.start_date || !filters.end_date) {
      toast.error(t('reports.select_date_range'));
      return;
    }
    refetch();
  };

  if (!restaurantId) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Alert severity="warning">{t('reports.no_restaurant_associated')}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>{t('reports.cash_flow_title')}</Typography>

      <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end' }}>
          <TextField
            name="start_date"
            label={t('reports.start_date')}
            type="date"
            value={filters.start_date}
            onChange={handleFilterChange}
            InputLabelProps={{
              shrink: true,
            }}
            fullWidth
          />
          <TextField
            name="end_date"
            label={t('reports.end_date')}
            type="date"
            value={filters.end_date}
            onChange={handleFilterChange}
            InputLabelProps={{
              shrink: true,
            }}
            fullWidth
          />
          <Button variant="contained" startIcon={<RefreshIcon />} onClick={handleGenerateReport} disabled={isLoading}>
            {t('reports.generate_report')}
          </Button>
        </Box>
      </Paper>

      {isLoading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      ) : isError ? (
        <Alert severity="error">{t('reports.error_loading_report')}</Alert>
      ) : reportData ? (
        <Paper elevation={2} sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>{t('reports.summary')}</Typography>
          <Typography variant="body1">{t('reports.total_income')}: R$ {Number(reportData.totalIncome).toFixed(2).replace('.', ',')}</Typography>
          <Typography variant="body1">{t('reports.total_reinforcement')}: R$ {Number(reportData.totalReinforcement).toFixed(2).replace('.', ',')}</Typography>
          <Typography variant="body1">{t('reports.total_expense')}: R$ {Number(reportData.totalExpense).toFixed(2).replace('.', ',')}</Typography>
          <Typography variant="body1">{t('reports.total_withdrawal')}: R$ {Number(reportData.totalWithdrawal).toFixed(2).replace('.', ',')}</Typography>
          <Typography variant="h6" sx={{ mt: 2, fontWeight: 'bold' }}>{t('reports.net_cash_flow')}: R$ {Number(reportData.netCashFlow).toFixed(2).replace('.', ',')}</Typography>
        </Paper>
      ) : (
        <Alert severity="info">{t('reports.no_data_for_period')}</Alert>
      )}
    </Box>
  );
};

export default CashFlowReport;
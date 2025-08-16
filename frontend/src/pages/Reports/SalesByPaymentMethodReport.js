import React, { useState } from 'react';
import { Box, Typography, CircularProgress, Alert, Button, TextField, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { useQuery } from 'react-query';
import axiosInstance from 'api/axiosInstance';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { Refresh as RefreshIcon } from '@mui/icons-material';

const fetchSalesByPaymentMethodReport = async ({ queryKey }) => {
  const [, restaurantId, filters] = queryKey;
  const { start_date, end_date } = filters;
  if (!start_date || !end_date) {
    return null; // Don't fetch if dates are not set
  }
  const { data } = await axiosInstance.get(`/api/financial/reports/sales-by-payment-method?restaurant_id=${restaurantId}&start_date=${start_date}&end_date=${end_date}`);
  return data;
};

const SalesByPaymentMethodReport = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const restaurantId = user?.restaurants?.[0]?.id;

  const [filters, setFilters] = useState({
    start_date: '',
    end_date: '',
  });

  const { data: reportData, isLoading, isError, refetch } = useQuery(
    ['salesByPaymentMethodReport', restaurantId, filters],
    fetchSalesByPaymentMethodReport,
    {
      enabled: !!restaurantId && !!filters.start_date && !!filters.end_date,
      onError: (error) => {
        toast.error(t('reports.error_loading_sales_by_payment_method', { message: error.response?.data?.msg || error.message }));
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
      <Typography variant="h4" gutterBottom>{t('reports.sales_by_payment_method_title')}</Typography>

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
      ) : reportData && reportData.length > 0 ? (
        <Paper elevation={2} sx={{ p: 3 }}>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>{t('reports.payment_method')}</TableCell>
                  <TableCell align="right">{t('reports.total_sales')}</TableCell>
                  <TableCell align="right">{t('reports.total_orders')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reportData.map((row) => (
                  <TableRow key={row.payment_method}>
                    <TableCell>{t(`payment_methods.type_${row.payment_method}`) || row.payment_method}</TableCell>
                    <TableCell align="right">R$ {Number(row.total_sales).toFixed(2).replace('.', ',')}</TableCell>
                    <TableCell align="right">{row.total_orders}</TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>{t('reports.grand_total')}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                    R$ {Number(reportData.reduce((sum, row) => sum + Number(row.total_sales), 0)).toFixed(2).replace('.', ',')}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                    {reportData.reduce((sum, row) => sum + Number(row.total_orders), 0)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      ) : (
        <Alert severity="info">{t('reports.no_data_for_period')}</Alert>
      )}
    </Box>
  );
};

export default SalesByPaymentMethodReport;
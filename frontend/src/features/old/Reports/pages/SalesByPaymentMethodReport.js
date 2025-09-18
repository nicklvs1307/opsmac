import React, { useState } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Button,
  TextField,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { useAuth } from '@/app/providers/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import toast from 'react-hot-toast';

import { useSalesByPaymentMethodReport } from '@/features/Reports/api/financialReportsQueries';

const SalesByPaymentMethodReport = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const restaurantId = user?.restaurants?.[0]?.id;

  const [filters, setFilters] = useState({
    start_date: '',
    end_date: '',
  });

  const {
    data: reportData,
    isLoading,
    isError,
    refetch,
  } = useSalesByPaymentMethodReport(restaurantId, filters, {
    onError: (error) => {
      toast.error(
        t('reports.error_loading_sales_by_payment_method', {
          message: error.response?.data?.msg || error.message,
        })
      );
    },
  });

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
        {t('reports.sales_by_payment_method_title')}
      </Typography>

      <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end' }}>
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>{t('reports.status')}</InputLabel>
            <Select
              name="status"
              value={filters.status}
              label={t('reports.status')}
              onChange={handleFilterChange}
            >
              <MenuItem value="">{t('reports.all')}</MenuItem>
              <MenuItem value="active">{t('reports.active')}</MenuItem>
              <MenuItem value="redeemed">{t('reports.redeemed')}</MenuItem>
              <MenuItem value="expired">{t('reports.expired')}</MenuItem>
            </Select>
          </FormControl>
          <TextField
            name="search"
            label={t('reports.search_code')}
            value={filters.search}
            onChange={handleFilterChange}
            fullWidth
          />
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={handleGenerateReport}
            disabled={isLoading}
          >
            {t('reports.generate_report')}
          </Button>
        </Box>
      </Paper>

      {reportData && reportData.length > 0 ? (
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
                    <TableCell>
                      {t(`payment_methods.type_${row.payment_method}`) || row.payment_method}
                    </TableCell>
                    <TableCell align="right">
                      R$ {Number(row.total_sales).toFixed(2).replace('.', ',')}
                    </TableCell>
                    <TableCell align="right">{row.total_orders}</TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>{t('reports.grand_total')}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                    R${' '}
                    {Number(reportData.reduce((sum, row) => sum + Number(row.total_sales), 0))
                      .toFixed(2)
                      .replace('.', ',')}
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

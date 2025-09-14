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
  TableRow,
} from '@mui/material';
import { useAuth } from '@/app/providers/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import toast from 'react-hot-toast';

import { useDREReport } from './api/financialReportsService';

const DREReport = () => {
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
  } = useDREReport(restaurantId, filters, {
    onError: (error) => {
      toast.error(
        t('reports.error_loading_dre', { message: error.response?.data?.msg || error.message })
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
        {t('reports.dre_title')}
      </Typography>

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

      {isLoading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      ) : isError ? (
        <Alert severity="error">{t('reports.error_loading_report')}</Alert>
      ) : reportData ? (
        <Paper elevation={2} sx={{ p: 3 }}>
          <TableContainer>
            <Table size="small">
              <TableBody>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>
                    {t('reports.operational_revenue')}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                    R$ {Number(reportData.totalSales).toFixed(2).replace('.', ',')}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>{t('reports.cmv')}</TableCell>
                  <TableCell align="right">
                    R$ {Number(reportData.cmv).toFixed(2).replace('.', ',')}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>{t('reports.gross_profit')}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                    R$ {Number(reportData.grossProfit).toFixed(2).replace('.', ',')}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>{t('reports.operational_expenses')}</TableCell>
                  <TableCell align="right">
                    R$ {Number(reportData.totalOperationalExpenses).toFixed(2).replace('.', ',')}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>{t('reports.operating_profit')}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                    R$ {Number(reportData.operatingProfit).toFixed(2).replace('.', ',')}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>{t('reports.other_income')}</TableCell>
                  <TableCell align="right">
                    R$ {Number(reportData.otherIncome).toFixed(2).replace('.', ',')}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>{t('reports.other_expenses')}</TableCell>
                  <TableCell align="right">
                    R$ {Number(reportData.otherExpenses).toFixed(2).replace('.', ',')}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                    {t('reports.net_profit')}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                    R$ {Number(reportData.netProfit).toFixed(2).replace('.', ',')}
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

export default DREReport;

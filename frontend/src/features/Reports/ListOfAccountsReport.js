import React, { useState } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Button,
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

import { useFinancialCategoriesReport } from './api/financialReportsService';

const ListOfAccountsReport = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const restaurantId = user?.restaurants?.[0]?.id;

  const [filters, setFilters] = useState({
    type: '',
  });

  const {
    data: categories,
    isLoading,
    isError,
    refetch,
  } = useFinancialCategoriesReport(restaurantId, filters, {
    onError: (error) => {
      toast.error(
        t('reports.error_loading_categories', {
          message: error.response?.data?.msg || error.message,
        })
      );
    },
  });

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
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
        {t('reports.list_of_accounts_title')}
      </Typography>

      <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end' }}>
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>{t('reports.type')}</InputLabel>
            <Select
              name="type"
              value={filters.type}
              label={t('reports.type')}
              onChange={handleFilterChange}
            >
              <MenuItem value="">{t('reports.all')}</MenuItem>
              <MenuItem value="income">{t('reports.income')}</MenuItem>
              <MenuItem value="expense">{t('reports.expense')}</MenuItem>
              <MenuItem value="general">{t('reports.general')}</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={refetch}
            disabled={isLoading}
          >
            {t('reports.refresh')}
          </Button>
        </Box>
      </Paper>

      {categories && categories.length > 0 ? (
        <TableContainer component={Paper} elevation={2}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>{t('reports.category_name')}</TableCell>
                <TableCell>{t('reports.category_type')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell>{category.name}</TableCell>
                  <TableCell>{t(`financial.${category.type}`)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Alert severity="info">{t('reports.no_categories_found')}</Alert>
      )}
    </Box>
  );
};

export default ListOfAccountsReport;

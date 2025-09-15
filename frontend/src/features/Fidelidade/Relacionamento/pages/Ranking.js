import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
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
  Avatar,
  Chip,
  Pagination,
} from '@mui/material';
import { useAuth } from '@/app/providers/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { useCustomersList } from '@/features/Customers/api/customerQueries';

const Ranking = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const restaurantId = user?.restaurants?.[0]?.id;

  const [sortBy, setSortBy] = useState('total_visits'); // Default sort by total visits
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10); // Keep limit as 10 for top customers, or make it configurable

  const {
    data: customersData,
    isLoading,
    isError,
    error,
  } = useCustomersList({
    restaurantId,
    sort: sortBy,
    page,
    limit,
  });

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (isError) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error?.message || t('common.error_loading_data')}
      </Alert>
    );
  }

  const customers = customersData?.customers || [];

  const getSegmentColor = (segment) => {
    switch (segment) {
      case 'vip':
        return 'error';
      case 'regular':
        return 'primary';
      case 'new':
        return 'success';
      case 'inactive':
        return 'default';
      default:
        return 'default';
    }
  };

  const getSegmentLabel = (segment) => {
    switch (segment) {
      case 'vip':
        return 'VIP';
      case 'regular':
        return 'Regular';
      case 'new':
        return 'Novo';
      case 'inactive':
        return 'Inativo';
      default:
        return segment;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {t('fidelity_relationship.ranking_title')}
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <FormControl fullWidth>
          <InputLabel>{t('ranking.sort_by')}</InputLabel>
          <Select
            value={sortBy}
            label={t('ranking.sort_by')}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <MenuItem value="total_visits">{t('ranking.total_visits')}</MenuItem>
            <MenuItem value="loyalty_points">{t('ranking.loyalty_points')}</MenuItem>
            <MenuItem value="total_spent">{t('ranking.total_spent')}</MenuItem> {/* New */}
          </Select>
        </FormControl>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t('ranking.position')}</TableCell>
              <TableCell>{t('ranking.customer')}</TableCell>
              <TableCell>{t('ranking.segment')}</TableCell>
              <TableCell>
                {t('ranking.metric_value', {
                  metric:
                    sortBy === 'total_visits'
                      ? t('ranking.visits')
                      : sortBy === 'loyalty_points'
                        ? t('ranking.points')
                        : t('ranking.spent'), // Modified
                })}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {customers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  {t('ranking.no_customers_found')}
                </TableCell>
              </TableRow>
            ) : (
              customers.map((customer, index) => (
                <TableRow key={customer.id}>
                  <TableCell>{(page - 1) * limit + index + 1}</TableCell>{' '}
                  {/* Modified for pagination */}
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        {customer.name?.charAt(0) || 'C'}
                      </Avatar>
                      <Typography variant="body1" fontWeight="medium">
                        {customer.name}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getSegmentLabel(customer.segment)}
                      color={getSegmentColor(customer.segment)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {sortBy === 'total_visits'
                      ? customer.totalVisits
                      : sortBy === 'loyalty_points'
                        ? customer.loyaltyPoints
                        : customer.totalSpent}{' '}
                    {/* Modified */}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
        <Pagination
          count={customersData?.totalPages || 1}
          page={customersData?.currentPage || 1}
          onChange={(event, value) => setPage(value)}
          color="primary"
        />
      </Box>
    </Box>
  );
};

export default Ranking;

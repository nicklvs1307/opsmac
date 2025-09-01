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
} from '@mui/material';
import { useAuth } from '@/app/providers/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { useCustomersList } from '@/features/Customers/api/customerQueries';

const Ranking = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const restaurantId = user?.restaurants?.[0]?.id;

  const [sortBy, setSortBy] = useState('total_visits'); // Default sort by total visits

  const {
    data: customersData,
    isLoading,
    isError,
    error,
  } = useCustomersList({
    restaurantId,
    sort: sortBy,
    limit: 10, // Top 10 customers
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
            {/* Add other sorting options as needed, e.g., total_spent */}
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
                  metric: sortBy === 'total_visits' ? t('ranking.visits') : t('ranking.points'),
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
                  <TableCell>{index + 1}</TableCell>
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
                    {sortBy === 'total_visits' ? customer.totalVisits : customer.loyaltyPoints}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default Ranking;

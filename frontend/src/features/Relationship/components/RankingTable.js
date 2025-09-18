import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Avatar,
  Box,
  Chip,
} from '@mui/material';
import { useTranslation } from 'react-i18next';

const RankingTable = ({ customers, sortBy, page, limit }) => {
  const { t } = useTranslation();

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
                      : t('ranking.spent'),
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
                <TableCell>{(page - 1) * limit + index + 1}</TableCell>
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
                      : customer.totalSpent}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default RankingTable;

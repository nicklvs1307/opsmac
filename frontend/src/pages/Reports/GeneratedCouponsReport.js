import React, { useState } from 'react';
import { Box, Typography, CircularProgress, Alert, Button, TextField, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { useQuery } from 'react-query';
import axiosInstance from 'api/axiosInstance';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { Refresh as RefreshIcon } from '@mui/icons-material';

const fetchGeneratedCoupons = async ({ queryKey }) => {
  const [, restaurantId, filters] = queryKey;
  const { status, search, page, limit } = filters;
  let url = `/api/coupons/restaurant/${restaurantId}?page=${page}&limit=${limit}`;
  if (status) url += `&status=${status}`;
  if (search) url += `&search=${search}`;
  const { data } = await axiosInstance.get(url);
  return data;
};

const GeneratedCouponsReport = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const restaurantId = user?.restaurants?.[0]?.id;

  const [filters, setFilters] = useState({
    status: '',
    search: '',
    page: 1,
    limit: 10,
  });

  const { data: couponsData, isLoading, isError, refetch } = useQuery(
    ['generatedCouponsReport', restaurantId, filters],
    fetchGeneratedCoupons,
    {
      enabled: !!restaurantId,
      onError: (error) => {
        toast.error(t('reports.error_loading_coupons', { message: error.response?.data?.msg || error.message }));
      },
    }
  );

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value, page: 1 }); // Reset page on filter change
  };

  const handlePageChange = (newPage) => {
    setFilters({ ...filters, page: newPage });
  };

  const handleGenerateReport = () => {
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

  const coupons = couponsData?.coupons || [];
  const pagination = couponsData?.pagination || {};

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>{t('reports.generated_coupons_title')}</Typography>

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
          <Button variant="contained" startIcon={<RefreshIcon />} onClick={handleGenerateReport} disabled={isLoading}>
            {t('reports.generate_report')}
          </Button>
        </Box>
      </Paper>

      {coupons.length === 0 ? (
        <Alert severity="info">{t('reports.no_coupons_found')}</Alert>
      ) : (
        <TableContainer component={Paper} elevation={2}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>{t('reports.coupon_code')}</TableCell>
                <TableCell>{t('reports.reward_title')}</TableCell>
                <TableCell>{t('reports.customer_name')}</TableCell>
                <TableCell>{t('reports.status')}</TableCell>
                <TableCell>{t('reports.expires_at')}</TableCell>
                <TableCell>{t('reports.redeemed_at')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {coupons.map((coupon) => (
                <TableRow key={coupon.id}>
                  <TableCell>{coupon.code}</TableCell>
                  <TableCell>{coupon.reward?.title}</TableCell>
                  <TableCell>{coupon.customer?.name}</TableCell>
                  <TableCell>{t(`reports.${coupon.status}`)}</TableCell>
                  <TableCell>{coupon.expires_at ? new Date(coupon.expires_at).toLocaleDateString() : '-'}</TableCell>
                  <TableCell>{coupon.redeemed_at ? new Date(coupon.redeemed_at).toLocaleDateString() : '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, mb: 2 }}>
            <Button disabled={pagination.current_page === 1} onClick={() => handlePageChange(pagination.current_page - 1)}>
              {t('reports.previous')}
            </Button>
            <Typography sx={{ mx: 2 }}>{pagination.current_page} / {pagination.total_pages}</Typography>
            <Button disabled={pagination.current_page === pagination.total_pages} onClick={() => handlePageChange(pagination.current_page + 1)}>
              {t('reports.next')}
            </Button>
          </Box>
        </TableContainer>
      )}
    </Box>
  );
};

export default GeneratedCouponsReport;
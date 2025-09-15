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
  TextField,
  InputAdornment,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { useAuth } from '@/app/providers/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { useQuery } from 'react-query';
import axiosInstance from '@/services/axiosInstance';

// API Functions
const fetchCoupons = async ({ restaurantId, page, limit, search, status, rewardType, token }) => {
  const response = await axiosInstance.get(`/rewards/coupons`, {
    params: { restaurantId, page, limit, search, status, rewardType },
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data; // Assuming the API returns { coupons: [...], pagination: {...} }
};

const GeneratedCouponsPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const restaurantId = user?.restaurants?.[0]?.id;
  const token = user?.token;

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [rewardType, setRewardType] = useState('');

  const {
    data: couponsData,
    isLoading,
    isError,
    error,
  } = useQuery(
    ['coupons', restaurantId, page, limit, search, status, rewardType],
    () => fetchCoupons({ restaurantId, page, limit, search, status, rewardType, token }),
    {
      enabled: !!restaurantId && !!token,
      keepPreviousData: true, // Keep data while fetching new page
    }
  );

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
    setPage(1); // Reset page when search changes
  };

  const handleStatusChange = (event) => {
    setStatus(event.target.value);
    setPage(1);
  };

  const handleRewardTypeChange = (event) => {
    setRewardType(event.target.value);
    setPage(1);
  };

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

  const coupons = couponsData?.coupons || [];
  const pagination = couponsData?.pagination || {};

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {t('generated_coupons.title')}
      </Typography>

      <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
        <Box display="flex" gap={2} flexWrap="wrap">
          <TextField
            label={t('generated_coupons.search_placeholder')}
            variant="outlined"
            size="small"
            value={search}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>{t('generated_coupons.status_filter')}</InputLabel>
            <Select
              value={status}
              label={t('generated_coupons.status_filter')}
              onChange={handleStatusChange}
            >
              <MenuItem value="">{t('common.all')}</MenuItem>
              <MenuItem value="active">{t('generated_coupons.status_active')}</MenuItem>
              <MenuItem value="used">{t('generated_coupons.status_used')}</MenuItem>
              <MenuItem value="expired">{t('generated_coupons.status_expired')}</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>{t('generated_coupons.reward_type_filter')}</InputLabel>
            <Select
              value={rewardType}
              label={t('generated_coupons.reward_type_filter')}
              onChange={handleRewardTypeChange}
            >
              <MenuItem value="">{t('common.all')}</MenuItem>
              <MenuItem value="discount">{t('reward_management.form.type_discount')}</MenuItem>
              <MenuItem value="free_item">{t('reward_management.form.type_free_item')}</MenuItem>
              <MenuItem value="spin_the_wheel">
                {t('reward_management.form.type_spin_the_wheel')}
              </MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      <TableContainer component={Paper} elevation={3}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t('generated_coupons.table_header.code')}</TableCell>
              <TableCell>{t('generated_coupons.table_header.customer')}</TableCell>
              <TableCell>{t('generated_coupons.table_header.reward_title')}</TableCell>
              <TableCell>{t('generated_coupons.table_header.value')}</TableCell>
              <TableCell>{t('generated_coupons.table_header.type')}</TableCell>
              <TableCell>{t('generated_coupons.table_header.status')}</TableCell>
              <TableCell>{t('generated_coupons.table_header.expires_at')}</TableCell>
              <TableCell>{t('generated_coupons.table_header.generated_at')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {coupons.length > 0 ? (
              coupons.map((coupon) => (
                <TableRow key={coupon.id}>
                  <TableCell>
                    <strong>{coupon.code}</strong>
                  </TableCell>
                  <TableCell>
                    {coupon.customer ? coupon.customer.name : t('common.anonymous')}
                  </TableCell>
                  <TableCell>
                    {coupon.reward ? coupon.reward.title : t('generated_coupons.no_reward_title')}
                  </TableCell>
                  <TableCell>{coupon.value}</TableCell>
                  <TableCell>{coupon.reward_type}</TableCell>
                  <TableCell>{t(`generated_coupons.status_${coupon.status}`)}</TableCell>
                  <TableCell>
                    {coupon.expires_at
                      ? new Date(coupon.expires_at).toLocaleDateString()
                      : t('common.never')}
                  </TableCell>
                  <TableCell>{new Date(coupon.createdAt).toLocaleDateString()}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  {t('generated_coupons.no_coupons_found')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
        <Pagination
          count={pagination.total_pages || 1}
          page={pagination.current_page || 1}
          onChange={handlePageChange}
          color="primary"
        />
      </Box>
    </Box>
  );
};

export default GeneratedCouponsPage;

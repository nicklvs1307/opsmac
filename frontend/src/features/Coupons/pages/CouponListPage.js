import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  IconButton,
  Menu,
  MenuItem,
  TablePagination,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  Button,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAuth } from '@/app/providers/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import usePagination from '@/hooks/usePagination';
import useDebounce from '@/hooks/useDebounce'; // Import useDebounce
import { useCoupons, useRedeemCoupon, useExpireCoupon } from '@/features/Coupons/api/couponQueries'; // Import useExpireCoupon
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const CouponListPage = () => {
  const { user } = useAuth();
  const restaurantId = user?.restaurants?.[0]?.id;
  const { t } = useTranslation();
  const navigate = useNavigate(); // Initialize useNavigate

  const [filters, setFilters] = useState({
    search: '',
    status: '',
    type: '',
  });
  const { page, setPage, itemsPerPage, setItemsPerPage, setTotalPages, handlePageChange } =
    usePagination(10);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  const debouncedSearch = useDebounce(filters.search, 500); // Debounce search input

  const queryFilters = useMemo(
    () => ({
      ...filters,
      search: debouncedSearch,
    }),
    [filters, debouncedSearch]
  );

  const {
    data: couponsData,
    isLoading,
    isError,
    error,
    refetch,
  } = useCoupons(restaurantId, queryFilters); // Use queryFilters
  const redeemCouponMutation = useRedeemCoupon();
  const expireCouponMutation = useExpireCoupon(); // Initialize useExpireCoupon

  useEffect(() => {
    if (couponsData) {
      setTotalPages(couponsData.pagination.total_pages);
    }
  }, [couponsData, setTotalPages]);

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
    setPage(1); // Reset page on filter change
  };

  const handleRedeem = async (id) => {
    try {
      await redeemCouponMutation.mutateAsync(id);
      toast.success(t('coupons.redeem_success'));
      handleMenuClose();
      refetch();
    } catch (err) {
      console.error('Error redeeming coupon:', err);
      toast.error(err.response?.data?.message || t('coupons.redeem_error'));
    }
  };

  const handleExpire = async (id) => {
    if (window.confirm(t('coupons.expire_confirm'))) {
      try {
        await expireCouponMutation.mutateAsync(id);
        toast.success(t('coupons.expire_success'));
        handleMenuClose();
        refetch();
      } catch (err) {
        console.error('Error expiring coupon:', err);
        toast.error(err.response?.data?.message || t('coupons.expire_error'));
      }
    }
  };

  const handleEdit = (id) => {
    navigate(`/fidelity/coupons/edit/${id}`); // Navigate to edit page
    handleMenuClose();
  };

  const handleMenuOpen = (event, item) => {
    setAnchorEl(event.currentTarget);
    setSelectedItem(item);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedItem(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'error';
      case 'expired':
        return 'warning';
      case 'used':
        return 'info';
      case 'pending':
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'active':
        return t('coupons.status_active');
      case 'inactive':
        return t('coupons.status_inactive');
      case 'expired':
        return t('coupons.status_expired');
      case 'used':
        return t('coupons.status_used');
      case 'pending':
        return t('coupons.status_pending');
      default:
        return status;
    }
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (isError) {
    console.error('Error fetching coupons:', error);
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error?.message || t('coupons.fetch_error')}
      </Alert>
    );
  }

  const coupons = couponsData?.coupons || [];

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          {t('coupons.title')}
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/fidelity/coupons/rewards-create')} // Navigate to create page
        >
          {t('coupons.create_new_coupon')}
        </Button>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          {t('common.filters')}
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label={t('common.search')}
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />,
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>{t('common.status')}</InputLabel>
              <Select
                value={filters.status}
                label={t('common.status')}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <MenuItem value="">{t('common.all')}</MenuItem>
                <MenuItem value="active">{t('coupons.status_active')}</MenuItem>
                <MenuItem value="redeemed">{t('coupons.status_used')}</MenuItem>
                <MenuItem value="expired">{t('coupons.status_expired')}</MenuItem>
                <MenuItem value="inactive">{t('coupons.status_inactive')}</MenuItem>
                <MenuItem value="pending">{t('coupons.status_pending')}</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          {/* Add type filter if needed */}
        </Grid>
      </Paper>

      {isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error?.message || t('coupons.fetch_error')}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t('coupons.table_header_code')}</TableCell>
              <TableCell>{t('coupons.table_header_customer')}</TableCell>
              <TableCell>{t('coupons.table_header_reward')}</TableCell>
              <TableCell>{t('coupons.table_header_status')}</TableCell>
              <TableCell>{t('coupons.table_header_created')}</TableCell>
              <TableCell>{t('coupons.table_header_expires')}</TableCell>
              <TableCell>{t('coupons.table_header_actions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {coupons.map((coupon) => (
              <TableRow key={coupon.id}>
                <TableCell>
                  <Typography variant="body2" fontFamily="monospace">
                    {coupon.code}
                  </Typography>
                </TableCell>
                <TableCell>{coupon.customer?.name || t('common.na')}</TableCell>
                <TableCell>{coupon.reward?.title || t('common.na')}</TableCell>
                <TableCell>
                  <Chip
                    label={getStatusLabel(coupon.status)}
                    color={getStatusColor(coupon.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {format(new Date(coupon.createdAt), 'dd/MM/yyyy', { locale: ptBR })}
                </TableCell>
                <TableCell>
                  {coupon.expires_at
                    ? format(new Date(coupon.expires_at), 'dd/MM/yyyy', { locale: ptBR })
                    : t('coupons.no_expiration')}
                </TableCell>
                <TableCell>
                  <IconButton size="small" onClick={(e) => handleMenuOpen(e, coupon)}>
                    <MoreVertIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={couponsData?.pagination?.total_items || 0}
        page={page - 1}
        onPageChange={(event, newPage) => handlePageChange(newPage + 1)}
        rowsPerPage={itemsPerPage}
        onRowsPerPageChange={(event) => {
          setItemsPerPage(parseInt(event.target.value, 10));
          setPage(1);
        }}
        rowsPerPageOptions={[5, 10, 25]}
        labelRowsPerPage={t('common.rows_per_page')}
        labelDisplayedRows={({ from, to, count }) =>
          `${from}-${to} ${t('common.of')} ${count !== -1 ? count : `mais de ${to}`}`
        }
      />

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem
          onClick={() => handleRedeem(selectedItem.id)}
          disabled={selectedItem?.status !== 'active'}
        >
          {t('coupons.redeem_coupon_button')}
        </MenuItem>
        <MenuItem
          onClick={() => handleExpire(selectedItem.id)}
          disabled={selectedItem?.status !== 'active'}
        >
          {t('coupons.expire_coupon_button')}
        </MenuItem>
        <MenuItem onClick={() => handleEdit(selectedItem.id)}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          {t('common.edit')}
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default CouponListPage;

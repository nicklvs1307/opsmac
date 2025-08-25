import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import { MoreVert as MoreVertIcon } from '@mui/icons-material';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAuth } from '@/app/providers/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import usePagination from '@/shared/hooks/usePagination';
import { useCoupons, useExpireCoupons } from '@/features/Coupons/api/couponQueries';

const CouponListPage = () => {
  const { user } = useAuth();
  const restaurantId = user?.restaurants?.[0]?.id;
  const { t } = useTranslation();

  const [filters, setFilters] = useState({
    search: '',
    status: '',
    type: '',
  });
  const {
    page,
    setPage,
    itemsPerPage,
    setItemsPerPage,
    totalPages,
    setTotalPages,
    handlePageChange,
  } = usePagination(10);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  const { data: couponsData, isLoading, isError, refetch } = useCoupons(filters);
  const expireCouponMutation = useExpireCoupons();
  const redeemCouponMutation = useRedeemCoupon();

  useEffect(() => {
    // This mutate call seems out of place here, it should probably be triggered by an action
    // expireCouponMutation.mutate();
  }, []);

  useEffect(() => {
    if (couponsData) {
      setTotalPages(couponsData.pagination.total_pages);
    }
  }, [couponsData, setTotalPages]);

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
        {t('coupons.fetch_error')}
      </Alert>
    );
  }

  const coupons = couponsData?.coupons || [];

  return (
    <Box>
      <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
        {t('coupons.title')}
      </Typography>

      {isError && ( // Display error from react-query
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
        <MenuItem onClick={() => handleRedeem(selectedItem.id)}>
          {t('coupons.redeem_coupon_button')}
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>{t('coupons.invalidate_coupon_button')}</MenuItem>
      </Menu>
    </Box>
  );
};

export default CouponListPage;

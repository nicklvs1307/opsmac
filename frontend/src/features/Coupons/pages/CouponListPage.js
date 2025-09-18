import React, { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Menu,
  MenuItem,
  TablePagination,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { useAuth } from '@/app/providers/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import usePagination from '@/hooks/usePagination';
import useDebounce from '@/hooks/useDebounce';
// Updated import path for couponQueries
import { useCoupons, useRedeemCoupon, useExpireCoupon } from '@/features/Coupons/api/couponQueries';
import { useNavigate } from 'react-router-dom';
import { useForm, FormProvider } from 'react-hook-form';
// Assuming these components will be moved to the new components folder
import CouponFilters from '../components/CouponFilters';
import CouponTable from '../components/CouponTable';

const CouponListPage = () => {
  const { user } = useAuth();
  const restaurantId = user?.restaurants?.[0]?.id;
  const { t } = useTranslation();
  const navigate = useNavigate();

  const methods = useForm({
    defaultValues: {
      search: '',
      status: '',
      rewardType: '',
    },
  });
  const { control, watch } = methods;

  const filters = watch();
  const { page, setPage, itemsPerPage, setItemsPerPage, setTotalPages, handlePageChange } =
    usePagination(10);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [expireDialogOpen, setExpireDialogOpen] = useState(false);

  const debouncedSearch = useDebounce(filters.search, 500);

  const queryFilters = useMemo(
    () => ({
      ...filters,
      search: debouncedSearch,
      page,
      limit: itemsPerPage,
    }),
    [filters, debouncedSearch, page, itemsPerPage]
  );

  const { data: couponsData, isLoading, isError, error, refetch } = useCoupons(queryFilters); // Pass queryFilters directly
  const redeemCouponMutation = useRedeemCoupon();
  const expireCouponMutation = useExpireCoupon();

  useEffect(() => {
    if (couponsData?.pagination) {
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

  const handleExpireClick = () => {
    setExpireDialogOpen(true);
    handleMenuClose();
  };

  const confirmExpire = async () => {
    if (selectedItem) {
      try {
        await expireCouponMutation.mutateAsync(selectedItem.id);
        toast.success(t('coupons.expire_success'));
      } catch (err) {
        console.error('Error expiring coupon:', err);
        toast.error(err.response?.data?.message || t('coupons.expire_error'));
      } finally {
        setExpireDialogOpen(false);
      }
    }
  };

  const handleEdit = (id) => {
    navigate(`/fidelity/coupons/edit/${id}`);
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
      case 'active': return 'success';
      case 'inactive': return 'error';
      case 'expired': return 'warning';
      case 'used': return 'info';
      case 'pending': return 'default';
      default: return 'default';
    }
  };

  const getStatusLabel = (status) => {
    return t(`coupons.status_${status}`, status);
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (isError) {
    return <Alert severity="error" sx={{ mb: 2 }}>{error?.message || t('coupons.fetch_error')}</Alert>;
  }

  return (
    <FormProvider {...methods}>
      <Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" component="h1">{t('coupons.title')}</Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/coupons/create')}>
            {t('coupons.create_new_coupon')}
          </Button>
        </Box>

        <CouponFilters control={control} />

        <CouponTable
          coupons={couponsData?.coupons || []}
          onMenuOpen={handleMenuOpen}
          getStatusLabel={getStatusLabel}
          getStatusColor={getStatusColor}
        />

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
          <MenuItem onClick={() => handleRedeem(selectedItem.id)} disabled={selectedItem?.status !== 'active'}>
            {t('coupons.redeem_coupon_button')}
          </MenuItem>
          <MenuItem onClick={handleExpireClick} disabled={selectedItem?.status !== 'active'}>
            {t('coupons.expire_coupon_button')}
          </MenuItem>
          <MenuItem onClick={() => handleEdit(selectedItem.id)}>
            <EditIcon fontSize="small" sx={{ mr: 1 }} />
            {t('common.edit')}
          </MenuItem>
        </Menu>

        <Dialog
          open={expireDialogOpen}
          onClose={() => setExpireDialogOpen(false)}
        >
          <DialogTitle>{t('coupons.expire_confirm_title')}</DialogTitle>
          <DialogContent>
            <DialogContentText>
              {t('coupons.expire_confirm')}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setExpireDialogOpen(false)}>{t('common.cancel')}</Button>
            <Button onClick={confirmExpire} color="error">
              {t('coupons.expire_coupon_button')}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </FormProvider>
  );
};

export default CouponListPage;

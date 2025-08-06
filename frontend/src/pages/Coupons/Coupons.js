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
  Pagination,
  IconButton,
  Menu,
  MenuItem,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Analytics as AnalyticsIcon,
  List as ListIcon,
  CheckCircle as CheckCircleIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import axiosInstance from '../../api/axiosInstance';
import { useAuth } from '../../contexts/AuthContext';
import CouponAnalytics from './CouponAnalytics';
import CouponValidator from './CouponValidator';
import CouponCreateForm from './CouponCreateForm';

const Coupons = () => {
  const { user } = useAuth();
  const restaurantId = user?.restaurants?.[0]?.id;
  const [tabValue, setTabValue] = useState(0);
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    type: '',
  });
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const { t } = useTranslation();

  useEffect(() => {
    if (tabValue === 0) {
      expireCoupons();
      // Reset page to 1 when filters change
      if (page !== 1 && (filters.search || filters.status || filters.type || itemsPerPage !== 10)) {
        setPage(1);
      } else {
        fetchCoupons();
      }
    }
  }, [tabValue, page, itemsPerPage, filters]);

  const expireCoupons = async () => {
    try {
      await axiosInstance.get(`/api/coupons/expire`);
    } catch (err) {
      console.error('Error expiring coupons:', err);
    }
  };

  const handleRedeem = async (id) => {
    try {
      await axiosInstance.post(`/api/coupons/${id}/redeem`);
      fetchCoupons();
      handleMenuClose();
    } catch (err) {
      console.error('Error redeeming coupon:', err);
      setError(t('coupons.redeem_error'));
    }
  };

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      setError('');
      
      const params = {
        page,
        limit: itemsPerPage,
      };

      if (filters.search) params.search = filters.search;
      if (filters.status) params.status = filters.status;
      if (filters.type) params.type = filters.type;
      
      const response = await axiosInstance.get(`/api/coupons/restaurant/${restaurantId}`, { params });
      
      setCoupons(response.data.coupons);
      setTotalPages(response.data.pagination.total_pages);
    } catch (err) {
      console.error('Error fetching coupons:', err);
      setError(t('coupons.fetch_error'));
    } finally {
      setLoading(false);
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
      case 'active': return 'success';
      case 'inactive': return 'error';
      case 'expired': return 'warning';
      case 'used': return 'info';
      case 'pending': return 'default';
      default: return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'active': return t('coupons.status_active');
      case 'inactive': return t('coupons.status_inactive');
      case 'expired': return t('coupons.status_expired');
      case 'used': return t('coupons.status_used');
      case 'pending': return t('coupons.status_pending');
      default: return status;
    }
  };

  const renderCouponsList = () => (
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
                  : t('coupons.no_expiration')
                }
              </TableCell>
              <TableCell>
                <IconButton
                  size="small"
                  onClick={(e) => handleMenuOpen(e, coupon)}
                >
                  <MoreVertIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
        {t('coupons.title')}
      </Typography>

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label={t('coupons.tab_list')} icon={<ListIcon />} />
          <Tab label={t('coupons.tab_analytics')} icon={<AnalyticsIcon />} />
          <Tab label={t('coupons.tab_validator')} icon={<CheckCircleIcon />} />
          <Tab label={t('coupons.tab_create')} icon={<AddIcon />} />
        </Tabs>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {tabValue === 0 && renderCouponsList()}
      {tabValue === 1 && <CouponAnalytics />}
      {tabValue === 2 && <CouponValidator />}
      {tabValue === 3 && <CouponCreateForm onCouponCreated={fetchCoupons} />}

      {totalPages > 1 && (
        <Box display="flex" justifyContent="flex-end" alignItems="center" mt={3} gap={2}>
          <FormControl size="small">
            <InputLabel id="items-per-page-label">{t('coupons.items_per_page_label')}</InputLabel>
            <Select
              labelId="items-per-page-label"
              value={itemsPerPage}
              label={t('coupons.items_per_page_label')}
              onChange={(e) => setItemsPerPage(e.target.value)}
            >
              <MenuItem value={5}>5</MenuItem>
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={25}>25</MenuItem>
              <MenuItem value={50}>50</MenuItem>
            </Select>
          </FormControl>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(e, value) => setPage(value)}
            color="primary"
          />
        </Box>
      )}

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleRedeem(selectedItem.id)}>{t('coupons.redeem_coupon_button')}</MenuItem>
        <MenuItem onClick={handleMenuClose}>{t('coupons.invalidate_coupon_button')}</MenuItem>
      </Menu>
    </Box>
  );
};

export default Coupons;
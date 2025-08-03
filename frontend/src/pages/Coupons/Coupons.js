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
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    type: '',
  });
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    if (tabValue === 0) {
      expireCoupons();
      fetchCoupons();
    }
  }, [tabValue, page, filters]);

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
      setError('Erro ao resgatar cupom');
    }
  };

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      setError('');
      
      const params = {
        page,
        limit: 10,
      };

      if (filters.search) params.search = filters.search;
      if (filters.status) params.status = filters.status;
      if (filters.type) params.type = filters.type;
      
      const response = await axiosInstance.get(`/api/coupons/restaurant/${restaurantId}`, { params });
      
      setCoupons(response.data.coupons);
      setTotalPages(response.data.totalPages);
    } catch (err) {
      console.error('Error fetching coupons:', err);
      setError('Erro ao carregar cupons');
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
      case 'active': return 'Ativo';
      case 'inactive': return 'Inativo';
      case 'expired': return 'Expirado';
      case 'used': return 'Usado';
      case 'pending': return 'Pendente';
      default: return status;
    }
  };

  const renderCouponsList = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Código</TableCell>
            <TableCell>Cliente</TableCell>
            <TableCell>Recompensa</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Criado</TableCell>
            <TableCell>Expira</TableCell>
            <TableCell>Ações</TableCell>
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
              <TableCell>{coupon.customer?.name || 'N/A'}</TableCell>
              <TableCell>{coupon.reward?.title || 'N/A'}</TableCell>
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
                  : 'Sem expiração'
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
        Gerenciamento de Cupons
      </Typography>

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="Lista de Cupons" icon={<ListIcon />} />
          <Tab label="Análise" icon={<AnalyticsIcon />} />
          <Tab label="Validador" icon={<CheckCircleIcon />} />
          <Tab label="Criar Cupom" icon={<AddIcon />} />
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
        <Box display="flex" justifyContent="center" mt={3}>
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
        <MenuItem onClick={() => handleRedeem(selectedItem.id)}>Utilizar Cupom</MenuItem>
        <MenuItem onClick={handleMenuClose}>Invalidar Cupom</MenuItem>
      </Menu>
    </Box>
  );
};

export default Coupons;
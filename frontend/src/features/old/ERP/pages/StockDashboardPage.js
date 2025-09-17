import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  Chip,
  IconButton,
} from '@mui/material';
import {
  Inventory as InventoryIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  WarningAmber as WarningAmberIcon,
  Cancel as CancelIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useAuth } from '@/app/providers/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { useStockDashboardData } from '@/features/ERP/Stock/api/stockDashboardService';

const MetricCard = ({ title, value, icon, bgColor, iconColor }) => (
  <Card
    sx={{
      height: '100%',
      background: bgColor,
      color: 'white',
      position: 'relative',
      overflow: 'visible',
    }}
  >
    <CardContent sx={{ pb: 2 }}>
      <Box display="flex" justifyContent="space-between" alignItems="flex-start">
        <Box>
          <Typography
            variant="body2"
            sx={{
              color: 'rgba(255,255,255,0.8)',
              fontSize: '0.875rem',
              fontWeight: 500,
              mb: 1,
            }}
          >
            {title}
          </Typography>
          <Typography
            variant="h3"
            component="div"
            sx={{
              color: 'white',
              fontWeight: 'bold',
              fontSize: '2.5rem',
              lineHeight: 1,
            }}
          >
            {value}
          </Typography>
        </Box>
        <Box
          sx={{
            bgcolor: iconColor,
            width: 48,
            height: 48,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
          }}
        >
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const StockDashboardPage = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const restaurantId = user?.restaurants?.[0]?.id;

  const { data: dashboardData, isLoading, isError, error } = useStockDashboardData(restaurantId);

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
        {t('stock_dashboard.fetch_error')}: {error.message}
      </Alert>
    );
  }

  const { totalProducts, inStock, lowStock, outOfStock, lowStockProducts } = dashboardData || {};

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
        {t('stock_dashboard.title')}
      </Typography>

      {(lowStock > 0 || outOfStock > 0) && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          {t('stock_dashboard.alert_message', { lowStock, outOfStock })}
        </Alert>
      )}

      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title={t('stock_dashboard.total_products')}
            value={totalProducts || 0}
            icon={<InventoryIcon sx={{ color: 'white' }} />}
            bgColor="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
            iconColor="rgba(255,255,255,0.2)"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title={t('stock_dashboard.in_stock')}
            value={inStock || 0}
            icon={<CheckCircleOutlineIcon sx={{ color: 'white' }} />}
            bgColor="linear-gradient(135deg, #28a745 0%, #218838 100%)"
            iconColor="rgba(255,255,255,0.2)"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title={t('stock_dashboard.low_stock')}
            value={lowStock || 0}
            icon={<WarningAmberIcon sx={{ color: 'white' }} />}
            bgColor="linear-gradient(135deg, #ffc107 0%, #e0a800 100%)"
            iconColor="rgba(255,255,255,0.2)"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title={t('stock_dashboard.out_of_stock')}
            value={outOfStock || 0}
            icon={<CancelIcon sx={{ color: 'white' }} />}
            bgColor="linear-gradient(135deg, #dc3545 0%, #c82333 100%)"
            iconColor="rgba(255,255,255,0.2)"
          />
        </Grid>
      </Grid>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          {t('stock_dashboard.low_stock_products_title')}
        </Typography>
        {lowStockProducts && lowStockProducts.length > 0 ? (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{t('stock_dashboard.table_header_product')}</TableCell>
                  <TableCell>{t('stock_dashboard.table_header_category')}</TableCell>
                  <TableCell>{t('stock_dashboard.table_header_current_stock')}</TableCell>
                  <TableCell>{t('stock_dashboard.table_header_min_stock')}</TableCell>
                  <TableCell>{t('stock_dashboard.table_header_status')}</TableCell>
                  <TableCell>{t('stock_dashboard.table_header_actions')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {lowStockProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>{product.category_name || t('common.na')}</TableCell>
                    <TableCell>{product.current_stock}</TableCell>
                    <TableCell>{product.min_stock}</TableCell>
                    <TableCell>
                      <Chip
                        label={t(
                          product.current_stock <= 0
                            ? 'stock_dashboard.status_out_of_stock'
                            : 'stock_dashboard.status_low_stock'
                        )}
                        color={product.current_stock <= 0 ? 'error' : 'warning'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton color="primary">
                        <EditIcon />
                      </IconButton>
                      <IconButton color="error">
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Typography>{t('stock_dashboard.no_low_stock_products')}</Typography>
        )}
      </Paper>
    </Box>
  );
};

export default StockDashboardPage;

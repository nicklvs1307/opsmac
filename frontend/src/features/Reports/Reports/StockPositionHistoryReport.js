import React, { useState } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Button,
  TextField,
  Paper,
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
} from '@mui/material';
import { useQuery } from 'react-query';
import axiosInstance from '@/shared/lib/axiosInstance';
import toast from 'react-hot-toast';
import { useAuth } from '@/app/providers/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { Refresh as RefreshIcon } from '@mui/icons-material';

const fetchStockPositionHistory = async ({ queryKey }) => {
  const [, restaurantId, filters] = queryKey;
  const { start_date, end_date, item_id, type } = filters;
  let url = `/api/stock/history?restaurant_id=${restaurantId}`;
  if (start_date) url += `&start_date=${start_date}`;
  if (end_date) url += `&end_date=${end_date}`;
  if (item_id) url += `&item_id=${item_id}`;
  if (type) url += `&type=${type}`;
  const { data } = await axiosInstance.get(url);
  return data;
};

const fetchStockItems = async ({ queryKey }) => {
  const [, restaurantId] = queryKey;
  const { data } = await axiosInstance.get(`/api/stock?restaurant_id=${restaurantId}`);
  return data;
};

const StockPositionHistoryReport = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const restaurantId = user?.restaurants?.[0]?.id;

  const [filters, setFilters] = useState({
    start_date: '',
    end_date: '',
    item_id: '',
    type: '',
  });

  const {
    data: historyData,
    isLoading,
    isError,
    refetch,
  } = useQuery(['stockPositionHistory', restaurantId, filters], fetchStockPositionHistory, {
    enabled: !!restaurantId,
    onError: (error) => {
      toast.error(
        t('reports.error_loading_stock_history', {
          message: error.response?.data?.msg || error.message,
        })
      );
    },
  });

  const {
    data: stockItems,
    isLoading: isLoadingStockItems,
    isError: isErrorStockItems,
  } = useQuery(['stockItems', restaurantId], fetchStockItems, {
    enabled: !!restaurantId,
    onError: (error) => {
      toast.error(
        t('reports.error_loading_stock_items', {
          message: error.response?.data?.msg || error.message,
        })
      );
    },
  });

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleGenerateReport = () => {
    refetch();
  };

  if (isLoading || isLoadingStockItems) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (isError || isErrorStockItems) {
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

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {t('reports.stock_position_history_title')}
      </Typography>

      <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end' }}>
          <TextField
            name="start_date"
            label={t('reports.start_date')}
            type="date"
            value={filters.start_date}
            onChange={handleFilterChange}
            InputLabelProps={{
              shrink: true,
            }}
            fullWidth
          />
          <TextField
            name="end_date"
            label={t('reports.end_date')}
            type="date"
            value={filters.end_date}
            onChange={handleFilterChange}
            InputLabelProps={{
              shrink: true,
            }}
            fullWidth
          />
          <FormControl fullWidth>
            <InputLabel>{t('reports.item')}</InputLabel>
            <Select
              name="item_id"
              value={filters.item_id}
              label={t('reports.item')}
              onChange={handleFilterChange}
            >
              <MenuItem value="">{t('reports.all')}</MenuItem>
              {stockItems?.map((item) => (
                <MenuItem key={item.item_id} value={item.item_id}>
                  {item.name} ({item.type})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>{t('reports.movement_type')}</InputLabel>
            <Select
              name="type"
              value={filters.type}
              label={t('reports.movement_type')}
              onChange={handleFilterChange}
            >
              <MenuItem value="">{t('reports.all')}</MenuItem>
              <MenuItem value="in">{t('reports.in')}</MenuItem>
              <MenuItem value="out">{t('reports.out')}</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={handleGenerateReport}
            disabled={isLoading}
          >
            {t('reports.generate_report')}
          </Button>
        </Box>
      </Paper>

      {historyData && historyData.length > 0 ? (
        <TableContainer component={Paper} elevation={2}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>{t('reports.date')}</TableCell>
                <TableCell>{t('reports.item')}</TableCell>
                <TableCell>{t('reports.type')}</TableCell>
                <TableCell align="right">{t('reports.quantity')}</TableCell>
                <TableCell>{t('reports.unit_of_measure')}</TableCell>
                <TableCell>{t('reports.description')}</TableCell>
                <TableCell>{t('reports.user')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {historyData.map((movement) => (
                <TableRow key={movement.id}>
                  <TableCell>{new Date(movement.createdAt).toLocaleString()}</TableCell>
                  <TableCell>{movement.product?.name || movement.ingredient?.name}</TableCell>
                  <TableCell>{t(`reports.${movement.type}`)}</TableCell>
                  <TableCell align="right">{movement.quantity}</TableCell>
                  <TableCell>{movement.ingredient?.unit_of_measure || '-'}</TableCell>
                  <TableCell>{movement.description || '-'}</TableCell>
                  <TableCell>{movement.user?.name || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Alert severity="info">{t('reports.no_data_for_period')}</Alert>
      )}
    </Box>
  );
};

export default StockPositionHistoryReport;

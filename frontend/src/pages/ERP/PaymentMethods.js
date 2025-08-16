import React, { useState } from 'react';
import { Box, Typography, CircularProgress, Alert, Button, TextField, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, FormControl, InputLabel, Select, MenuItem, Switch, FormControlLabel } from '@mui/material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import axiosInstance from 'api/axiosInstance';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';

const fetchPaymentMethods = async ({ queryKey }) => {
  const [, restaurantId] = queryKey;
  const { data } = await axiosInstance.get(`/api/financial/payment-methods?restaurant_id=${restaurantId}`);
  return data;
};

const createPaymentMethod = async (newMethod) => {
  const { data } = await axiosInstance.post('/api/financial/payment-methods', newMethod);
  return data;
};

const updatePaymentMethod = async (updatedMethod) => {
  const { id, ...fields } = updatedMethod;
  const { data } = await axiosInstance.put(`/api/financial/payment-methods/${id}`, fields);
  return data;
};

const deletePaymentMethod = async (id) => {
  await axiosInstance.delete(`/api/financial/payment-methods/${id}`);
};

const PaymentMethods = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const restaurantId = user?.restaurants?.[0]?.id;

  const [newMethodName, setNewMethodName] = useState('');
  const [newMethodType, setNewMethodType] = useState('');
  const [newMethodIsActive, setNewMethodIsActive] = useState(true);
  const [editingMethod, setEditingMethod] = useState(null);

  const { data: paymentMethods, isLoading, isError } = useQuery(
    ['paymentMethods', restaurantId],
    fetchPaymentMethods,
    {
      enabled: !!restaurantId,
      onError: (error) => {
        toast.error(t('payment_methods.error_loading_methods', { message: error.response?.data?.msg || error.message }));
      },
    }
  );

  const createMutation = useMutation(createPaymentMethod, {
    onSuccess: () => {
      toast.success(t('payment_methods.method_added_success'));
      queryClient.invalidateQueries(['paymentMethods', restaurantId]);
      setNewMethodName('');
      setNewMethodType('');
      setNewMethodIsActive(true);
    },
    onError: (error) => {
      toast.error(t('payment_methods.error_adding_method', { message: error.response?.data?.msg || error.message }));
    },
  });

  const updateMutation = useMutation(updatePaymentMethod, {
    onSuccess: () => {
      toast.success(t('payment_methods.method_updated_success'));
      queryClient.invalidateQueries(['paymentMethods', restaurantId]);
      setEditingMethod(null);
    },
    onError: (error) => {
      toast.error(t('payment_methods.error_updating_method', { message: error.response?.data?.msg || error.message }));
    },
  });

  const deleteMutation = useMutation(deletePaymentMethod, {
    onSuccess: () => {
      toast.success(t('payment_methods.method_deleted_success'));
      queryClient.invalidateQueries(['paymentMethods', restaurantId]);
    },
    onError: (error) => {
      toast.error(t('payment_methods.error_deleting_method', { message: error.response?.data?.msg || error.message }));
    },
  });

  const handleCreateMethod = () => {
    if (!newMethodName || !newMethodType) {
      toast.error(t('payment_methods.name_type_required'));
      return;
    }
    createMutation.mutate({ name: newMethodName, type: newMethodType, is_active: newMethodIsActive, restaurant_id: restaurantId });
  };

  const handleEditClick = (method) => {
    setEditingMethod({ ...method });
  };

  const handleSaveEdit = () => {
    if (!editingMethod.name || !editingMethod.type) {
      toast.error(t('payment_methods.name_type_required'));
      return;
    }
    updateMutation.mutate(editingMethod);
  };

  const handleDeleteClick = (id) => {
    if (window.confirm(t('payment_methods.confirm_delete'))) {
      deleteMutation.mutate(id);
    }
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
        <Alert severity="error">{t('reports.error_loading_data')}</Alert>
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
      <Typography variant="h4" gutterBottom>{t('payment_methods.title')}</Typography>

      <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>{t('payment_methods.add_new_method')}</Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end' }}>
          <TextField
            label={t('payment_methods.method_name')}
            value={newMethodName}
            onChange={(e) => setNewMethodName(e.target.value)}
            fullWidth
          />
          <FormControl fullWidth>
            <InputLabel>{t('payment_methods.method_type')}</InputLabel>
            <Select
              value={newMethodType}
              label={t('payment_methods.method_type')}
              onChange={(e) => setNewMethodType(e.target.value)}
            >
              <MenuItem value="cash">{t('payment_methods.type_cash')}</MenuItem>
              <MenuItem value="card">{t('payment_methods.type_card')}</MenuItem>
              <MenuItem value="pix">{t('payment_methods.type_pix')}</MenuItem>
              <MenuItem value="meal_voucher">{t('payment_methods.type_meal_voucher')}</MenuItem>
              <MenuItem value="other">{t('payment_methods.type_other')}</MenuItem>
            </Select>
          </FormControl>
          <FormControlLabel
            control={<Switch checked={newMethodIsActive} onChange={(e) => setNewMethodIsActive(e.target.checked)} />} 
            label={t('payment_methods.is_active')}
          />
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreateMethod} disabled={createMutation.isLoading}>
            {t('payment_methods.add')}
          </Button>
        </Box>
      </Paper>

      <TableContainer component={Paper} elevation={2}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t('payment_methods.table_name')}</TableCell>
              <TableCell>{t('payment_methods.table_type')}</TableCell>
              <TableCell>{t('payment_methods.table_active')}</TableCell>
              <TableCell align="right">{t('payment_methods.table_actions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paymentMethods?.map((method) => (
              <TableRow key={method.id}>
                <TableCell>
                  {editingMethod?.id === method.id ? (
                    <TextField
                      value={editingMethod.name}
                      onChange={(e) => setEditingMethod({ ...editingMethod, name: e.target.value })}
                      fullWidth
                    />
                  ) : (
                    method.name
                  )}
                </TableCell>
                <TableCell>
                  {editingMethod?.id === method.id ? (
                    <FormControl fullWidth size="small">
                      <Select
                        value={editingMethod.type}
                        onChange={(e) => setEditingMethod({ ...editingMethod, type: e.target.value })}
                      >
                        <MenuItem value="cash">{t('payment_methods.type_cash')}</MenuItem>
                        <MenuItem value="card">{t('payment_methods.type_card')}</MenuItem>
                        <MenuItem value="pix">{t('payment_methods.type_pix')}</MenuItem>
                        <MenuItem value="meal_voucher">{t('payment_methods.type_meal_voucher')}</MenuItem>
                        <MenuItem value="other">{t('payment_methods.type_other')}</MenuItem>
                      </Select>
                    </FormControl>
                  ) : (
                    t(`payment_methods.type_${method.type}`)
                  )}
                </TableCell>
                <TableCell>
                  {editingMethod?.id === method.id ? (
                    <Switch
                      checked={editingMethod.is_active}
                      onChange={(e) => setEditingMethod({ ...editingMethod, is_active: e.target.checked })}
                    />
                  ) : (
                    method.is_active ? t('payment_methods.yes') : t('payment_methods.no')
                  )}
                </TableCell>
                <TableCell align="right">
                  {editingMethod?.id === method.id ? (
                    <Button onClick={handleSaveEdit} disabled={updateMutation.isLoading}>
                      {t('payment_methods.save')}
                    </Button>
                  ) : (
                    <IconButton onClick={() => handleEditClick(method)}>
                      <EditIcon />
                    </IconButton>
                  )}
                  <IconButton onClick={() => handleDeleteClick(method.id)} disabled={deleteMutation.isLoading}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default PaymentMethods;
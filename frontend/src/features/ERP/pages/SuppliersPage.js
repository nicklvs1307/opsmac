import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { useAuth } from '@/app/providers/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import {
  useSuppliers,
  useCreateSupplier,
  useUpdateSupplier,
  useDeleteSupplier,
} from '../Stock/api/suppliersService';

const SuppliersPage = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const restaurantId = user?.restaurants?.[0]?.id;

  const [openDialog, setOpenDialog] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);

  const { data: suppliers, isLoading, isError, error } = useSuppliers(restaurantId);

  const { control, handleSubmit, reset, setValue } = useForm();

  const createMutation = useCreateSupplier();
  const updateMutation = useUpdateSupplier();
  const deleteMutation = useDeleteSupplier();

  const handleOpenDialog = (supplier = null) => {
    setEditingSupplier(supplier);
    if (supplier) {
      setValue('name', supplier.name);
      setValue('contact_person', supplier.contact_person);
      setValue('phone', supplier.phone);
      setValue('email', supplier.email);
      setValue('address', supplier.address);
    } else {
      reset();
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingSupplier(null);
    reset();
  };

  const onSubmit = (data) => {
    if (editingSupplier) {
      updateMutation.mutate({
        id: editingSupplier.id,
        updatedSupplier: { ...data, restaurant_id: restaurantId },
      });
    } else {
      createMutation.mutate({ ...data, restaurant_id: restaurantId });
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        {t('suppliers.title')}
      </Typography>

      <Button variant="contained" color="primary" onClick={() => handleOpenDialog()} sx={{ mb: 3 }}>
        {t('suppliers.add_supplier_button')}
      </Button>

      <Paper sx={{ mb: 3 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t('suppliers.table_header_name')}</TableCell>
                <TableCell>{t('suppliers.table_header_contact_person')}</TableCell>
                <TableCell>{t('suppliers.table_header_phone')}</TableCell>
                <TableCell>{t('suppliers.table_header_email')}</TableCell>
                <TableCell>{t('suppliers.table_header_address')}</TableCell>
                <TableCell>{t('suppliers.table_header_actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : isError ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Alert severity="error">
                      {t('suppliers.error_loading_suppliers')}: {error.message}
                    </Alert>
                  </TableCell>
                </TableRow>
              ) : suppliers && suppliers.length > 0 ? (
                suppliers.map((supplier) => (
                  <TableRow key={supplier.id}>
                    <TableCell>{supplier.name}</TableCell>
                    <TableCell>{supplier.contact_person}</TableCell>
                    <TableCell>{supplier.phone}</TableCell>
                    <TableCell>{supplier.email}</TableCell>
                    <TableCell>{supplier.address}</TableCell>
                    <TableCell>
                      <Button size="small" onClick={() => handleOpenDialog(supplier)}>
                        {t('common.edit')}
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        onClick={() => deleteMutation.mutate(supplier.id)}
                        sx={{ ml: 1 }}
                        disabled={deleteMutation.isLoading}
                      >
                        {t('common.delete')}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography>{t('suppliers.no_suppliers_found')}</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>
          {editingSupplier
            ? t('suppliers.edit_supplier_title')
            : t('suppliers.add_new_supplier_title')}
        </DialogTitle>
        <DialogContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Controller
              name="name"
              control={control}
              defaultValue=""
              rules={{ required: t('suppliers.name_required') }}
              render={({ field, fieldState: { error } }) => (
                <TextField
                  {...field}
                  label={t('suppliers.name_label')}
                  fullWidth
                  margin="normal"
                  error={!!error}
                  helperText={error ? error.message : null}
                />
              )}
            />
            <Controller
              name="contact_person"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <TextField
                  {...field}
                  label={t('suppliers.contact_person_label')}
                  fullWidth
                  margin="normal"
                />
              )}
            />
            <Controller
              name="phone"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <TextField
                  {...field}
                  label={t('suppliers.phone_label')}
                  fullWidth
                  margin="normal"
                />
              )}
            />
            <Controller
              name="email"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <TextField
                  {...field}
                  label={t('suppliers.email_label')}
                  fullWidth
                  margin="normal"
                />
              )}
            />
            <Controller
              name="address"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <TextField
                  {...field}
                  label={t('suppliers.address_label')}
                  fullWidth
                  margin="normal"
                  multiline
                  rows={2}
                />
              )}
            />
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>{t('common.cancel')}</Button>
          <Button
            onClick={handleSubmit(onSubmit)}
            variant="contained"
            disabled={createMutation.isLoading || updateMutation.isLoading}
          >
            {editingSupplier ? t('common.save_changes') : t('common.add')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SuppliersPage;

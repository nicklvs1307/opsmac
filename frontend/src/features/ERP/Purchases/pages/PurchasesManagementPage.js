import React from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { useAuth } from '@/app/providers/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { useProductsForPurchases, useSuppliersForPurchases, useCreatePurchase, } from '../api/purchasesQueries';

const PurchasesPage = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const restaurantId = user?.restaurants?.[0]?.id;

  const {
    data: products,
    isLoading: isLoadingProducts,
    isError: isErrorProducts,
  } = useProductsForPurchases(restaurantId);
  const {
    data: suppliers,
    isLoading: isLoadingSuppliers,
    isError: isErrorSuppliers,
  } = useSuppliersForPurchases(restaurantId);

  const { control, handleSubmit } = useForm();

  const createPurchaseMutation = useCreatePurchase();

  const onSubmit = (data) => {
    const movementData = {
      product_id: data.product_id,
      type: 'in',
      quantity: data.quantity,
      description: t('purchases.purchase_description', {
        supplierName: data.supplier_name || t('common.na'),
        notes: data.notes || '',
      }),
    };
    createPurchaseMutation.mutate({ restaurantId, purchaseData: movementData });
  };

  if (isLoadingProducts || isLoadingSuppliers) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (isErrorProducts || isErrorSuppliers) {
    return <Alert severity="error">{t('purchases.error_loading_form_data')}</Alert>;
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        {t('purchases.title')}
      </Typography>

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <FormControl fullWidth margin="normal">
            <InputLabel id="product-select-label">{t('purchases.product_label')}</InputLabel>
            <Controller
              name="product_id"
              control={control}
              defaultValue=""
              rules={{ required: t('purchases.product_required') }}
              render={({ field }) => (
                <Select
                  labelId="product-select-label"
                  id="product-select"
                  label={t('purchases.product_label')}
                  {...field}
                >
                  {products?.map((product) => (
                    <MenuItem key={product.id} value={product.id}>
                      {product.name}
                    </MenuItem>
                  ))}
                </Select>
              )}
            />
          </FormControl>

          <Controller
            name="quantity"
            control={control}
            defaultValue=""
            rules={{
              required: t('purchases.quantity_required'),
              min: { value: 1, message: t('purchases.quantity_min_error') },
            }}
            render={({ field }) => (
              <TextField
                {...field}
                label={t('purchases.quantity_label')}
                type="number"
                fullWidth
                margin="normal"
              />
            )}
          />

          <FormControl fullWidth margin="normal">
            <InputLabel id="supplier-select-label">{t('purchases.supplier_label')}</InputLabel>
            <Controller
              name="supplier_name"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <Select
                  labelId="supplier-select-label"
                  id="supplier-select"
                  label={t('purchases.supplier_label')}
                  {...field}
                >
                  {suppliers?.map((supplier) => (
                    <MenuItem key={supplier.id} value={supplier.name}>
                      {supplier.name}
                    </MenuItem>
                  ))}
                </Select>
              )}
            />
          </FormControl>

          <Controller
            name="notes"
            control={control}
            defaultValue=""
            render={({ field }) => (
              <TextField
                {...field}
                label={t('purchases.notes_label')}
                multiline
                rows={3}
                fullWidth
                margin="normal"
              />
            )}
          />

          <Button
            type="submit"
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
            disabled={createPurchaseMutation.isLoading}
          >
            {createPurchaseMutation.isLoading ? (
              <CircularProgress size={20} />
            ) : (
              t('purchases.register_purchase_button')
            )}
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default PurchasesPage;

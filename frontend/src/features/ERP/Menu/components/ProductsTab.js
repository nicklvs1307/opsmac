import React, { useState } from 'react';
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useAuth } from '@/app/providers/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { 
  useProducts, 
  useCreateProduct, 
  useUpdateProduct, 
  useDeleteProduct, 
  useToggleProductStatus,
  useCategories
} from '../api/menuService';

const ProductsTab = () => {
  const { user } = useAuth();
  const restaurantId = user?.restaurants?.[0]?.id;
  const { t } = useTranslation();

  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', price: '', category_id: '', is_active: true });

  const { data: products, isLoading, isError, error } = useProducts(restaurantId);
  const { data: categories } = useCategories(restaurantId);

  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const deleteMutation = useDeleteProduct();
  const toggleStatusMutation = useToggleProductStatus();

  const handleOpenModal = (item = null) => {
    if (item) {
      setIsEditing(true);
      setCurrentItem(item);
      setFormData({ name: item.name, description: item.description, price: item.price, category_id: item.category_id, is_active: item.is_active });
    } else {
      setIsEditing(false);
      setCurrentItem(null);
      setFormData({ name: '', description: '', price: '', category_id: '', is_active: true });
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setCurrentItem(null);
  };

  const handleSave = () => {
    const dataToSave = { ...formData, price: parseFloat(formData.price), restaurant_id: restaurantId };
    if (isEditing) {
      updateMutation.mutate({ id: currentItem.id, fields: dataToSave }, {
        onSuccess: () => { toast.success(t('menu_management.product_updated_success')); handleCloseModal(); },
        onError: () => { toast.error(t('menu_management.product_updated_error')); }
      });
    } else {
      createMutation.mutate(dataToSave, {
        onSuccess: () => { toast.success(t('menu_management.product_created_success')); handleCloseModal(); },
        onError: () => { toast.error(t('menu_management.product_created_error')); }
      });
    }
  };

  const handleDelete = (id) => {
    if (window.confirm(t('menu_management.confirm_delete_product'))) {
      deleteMutation.mutate(id, {
        onSuccess: () => { toast.success(t('menu_management.product_deleted_success')); },
        onError: () => { toast.error(t('menu_management.product_deleted_error')); }
      });
    }
  };

  const handleToggleStatus = (id) => {
    toggleStatusMutation.mutate(id, {
        onSuccess: () => { toast.success(t('menu_management.product_status_updated')); },
        onError: () => { toast.error(t('menu_management.product_status_update_error')); }
    });
  };

  if (isLoading) return <CircularProgress />;
  if (isError) return <Alert severity="error">{error.message}</Alert>;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenModal()}>
          {t('menu_management.new_product')}
        </Button>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t('menu_management.table.name')}</TableCell>
              <TableCell>{t('menu_management.table.category')}</TableCell>
              <TableCell>{t('menu_management.table.price')}</TableCell>
              <TableCell>{t('menu_management.table.status')}</TableCell>
              <TableCell align="right">{t('menu_management.table.actions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products?.map((product) => (
              <TableRow key={product.id}>
                <TableCell>{product.name}</TableCell>
                <TableCell>{product.category?.name}</TableCell>
                <TableCell>{`R$ ${product.price}`}</TableCell>
                <TableCell>
                  <Switch
                    checked={product.is_active}
                    onChange={() => handleToggleStatus(product.id)}
                    disabled={toggleStatusMutation.isLoading}
                  />
                </TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => handleOpenModal(product)}><EditIcon /></IconButton>
                  <IconButton onClick={() => handleDelete(product.id)}><DeleteIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={modalOpen} onClose={handleCloseModal}>
        <DialogTitle>{isEditing ? t('menu_management.edit_product') : t('menu_management.new_product')}</DialogTitle>
        <DialogContent>
          <TextField autoFocus margin="dense" label={t('menu_management.table.name')} type="text" fullWidth variant="standard" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
          <FormControl fullWidth margin="dense">
            <InputLabel>{t('menu_management.table.category')}</InputLabel>
            <Select label={t('menu_management.table.category')} value={formData.category_id} onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}>
              {categories?.map(cat => <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>)}
            </Select>
          </FormControl>
          <TextField margin="dense" label={t('menu_management.table.description')} type="text" fullWidth multiline rows={3} variant="standard" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
          <TextField margin="dense" label={t('menu_management.table.price')} type="number" fullWidth variant="standard" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} />
          <FormControlLabel control={<Switch checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} />} label={t('menu_management.table.active')} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>{t('common.cancel')}</Button>
          <Button onClick={handleSave} disabled={createMutation.isLoading || updateMutation.isLoading}>{t('common.save')}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProductsTab;

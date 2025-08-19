import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, List, ListItem, ListItemText, IconButton, Typography, Paper, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControl, InputLabel, Select, MenuItem, FormControlLabel, Checkbox } from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Image as ImageIcon } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useTranslation } from 'react-i18next';
import axiosInstance from '../../api/axiosInstance';
import toast from 'react-hot-toast';

const fetchProducts = async () => {
  const { data } = await axiosInstance.get('/api/products');
  return data;
};

const fetchCategories = async () => {
  const { data } = await axiosInstance.get('/api/categories');
  return data;
};

const createProduct = async (newProduct) => {
  const { data } = await axiosInstance.post('/api/products', newProduct);
  return data;
};

const updateProduct = async ({ id, ...updatedProduct }) => {
  const { data } = await axiosInstance.put(`/api/products/${id}`, updatedProduct);
  return data;
};

const deleteProduct = async (id) => {
  await axiosInstance.delete(`/api/products/${id}`);
};

const fetchAddons = async () => {
  const { data } = await axiosInstance.get('/api/addons');
  return data;
};

const ProductManagement = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { data: products, isLoading: isLoadingProducts, isError: isErrorProducts } = useQuery('products', fetchProducts);
  const { data: categories, isLoading: isLoadingCategories, isError: isErrorCategories } = useQuery('categories', fetchCategories);
  const { data: addons, isLoading: isLoadingAddons, isError: isErrorAddons } = useQuery('addons', fetchAddons);

  const [productForm, setProductForm] = useState({
    addons: [],
    name: '',
    description: '',
    price: '',
    sku: '',
    category_id: '',
    is_pizza: false,
    pizza_type: '',
    available_for_delivery: true,
    available_for_dine_in: true,
    available_for_online_order: true,
    available_for_digital_menu: true,
    image_url: '',
  });
  const [editingProduct, setEditingProduct] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  const addProductMutation = useMutation(createProduct, {
    onSuccess: () => {
      queryClient.invalidateQueries('products');
      setProductForm({
        name: '',
        description: '',
        price: '',
        sku: '',
        category_id: '',
        is_pizza: false,
        pizza_type: '',
        available_for_delivery: true,
        available_for_dine_in: true,
        available_for_online_order: true,
        available_for_digital_menu: true,
        image_url: '',
        addons: [],
        variations: [],
      });
      toast.success(t('product_management.add_success'));
    },
    onError: (error) => {
      toast.error(error.response?.data?.msg || t('product_management.add_error'));
    },
  });

  const updateProductMutation = useMutation(updateProduct, {
    onSuccess: () => {
      queryClient.invalidateQueries('products');
      setEditingProduct(null);
      setProductForm({
        name: '',
        description: '',
        price: '',
        sku: '',
        category_id: '',
        is_pizza: false,
        pizza_type: '',
        available_for_delivery: true,
        available_for_dine_in: true,
        available_for_online_order: true,
        available_for_digital_menu: true,
        image_url: '',
        addons: [],
        variations: [],
      });
      toast.success(t('product_management.update_success'));
    },
    onError: (error) => {
      toast.error(error.response?.data?.msg || t('product_management.update_error'));
    },
  });

  const deleteProductMutation = useMutation(deleteProduct, {
    onSuccess: () => {
      queryClient.invalidateQueries('products');
      toast.success(t('product_management.delete_success'));
      setOpenDeleteDialog(false);
      setProductToDelete(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.msg || t('product_management.delete_error'));
    },
  });

  

  const handleRemoveVariation = (index) => {
    const newVariations = [...productForm.variations];
    newVariations.splice(index, 1);
    setProductForm({ ...productForm, variations: newVariations });
  };

  const handleVariationChange = (index, field, value) => {
    const newVariations = [...productForm.variations];
    newVariations[index] = { ...newVariations[index], [field]: value };
    setProductForm({ ...productForm, variations: newVariations });
  };

  const handleAddVariation = () => {
    setProductForm({ ...productForm, variations: [...productForm.variations, { name: '', value: '', additionalPrice: '' }] });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newFormState = {
      ...productForm,
      [name]: type === 'checkbox' ? checked : value,
    };

    if (name === 'is_pizza' && !checked) {
      newFormState.pizza_type = '';
    }

    setProductForm(newFormState);
  };

  const handleAddProduct = () => {
    if (productForm.is_pizza && !productForm.pizza_type) {
      toast.error(t('product_management.select_pizza_type')); // Assuming this translation key exists
      return;
    }
    addProductMutation.mutate(productForm);
  };

  const handleEditClick = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name || '',
      description: product.description || '',
      price: product.price || '',
      sku: product.sku || '',
      category_id: product.category_id || '',
      is_pizza: product.is_pizza || false,
      pizza_type: product.is_pizza ? (product.pizza_type || 'variable_price') : '',
      available_for_delivery: product.available_for_delivery || false,
      available_for_dine_in: product.available_for_dine_in || false,
      available_for_online_order: product.available_for_online_order || false,
      available_for_digital_menu: product.available_for_digital_menu || false,
      image_url: product.image_url || '',
      addons: product.addons || [],
      variations: product.variations || [],
    });
  };

  const handleUpdateProduct = () => {
    if (editingProduct) {
      if (productForm.is_pizza && !productForm.pizza_type) {
        toast.error(t('product_management.select_pizza_type')); // Assuming this translation key exists
        return;
      }
      updateProductMutation.mutate({ id: editingProduct.id, ...productForm });
    }
  };

  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setOpenDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    if (productToDelete) {
      deleteProductMutation.mutate(productToDelete.id);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('productImage', file);

    try {
      const { data } = await axiosInstance.post('/api/products/upload-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setProductForm({ ...productForm, image_url: `${process.env.REACT_APP_API_URL}${data.imageUrl}` });
      toast.success(t('product_management.upload_success'));
    } catch (error) {
      toast.error(error.response?.data?.msg || t('product_management.upload_error'));
    }
  };

  if (isLoadingProducts || isLoadingCategories || isLoadingAddons) return <Typography>{t('common.loading')}</Typography>;
  if (isErrorProducts || isErrorCategories || isErrorAddons) return <Typography>{t('common.error_loading_data')}</Typography>;

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h5" gutterBottom>{t('product_management.title')}</Typography>
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>{editingProduct ? t('product_management.edit_product') : t('product_management.add_new_product')}</Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label={t('product_management.product_name')}
            name="name"
            variant="outlined"
            fullWidth
            value={productForm.name}
            onChange={handleInputChange}
          />
          <TextField
            label={t('product_management.description')}
            name="description"
            variant="outlined"
            fullWidth
            multiline
            rows={3}
            value={productForm.description}
            onChange={handleInputChange}
          />
          <TextField
            label={t('product_management.price')}
            name="price"
            variant="outlined"
            fullWidth
            type="number"
            value={productForm.price}
            onChange={handleInputChange}
          />
          <TextField
            label={t('product_management.sku')}
            name="sku"
            variant="outlined"
            fullWidth
            value={productForm.sku}
            onChange={handleInputChange}
          />
          <FormControl fullWidth variant="outlined">
            <InputLabel>{t('product_management.category')}</InputLabel>
            <Select
              name="category_id"
              value={productForm.category_id}
              onChange={handleInputChange}
              label={t('product_management.category')}
            >
              <MenuItem value="">{t('product_management.select_category')}</MenuItem>
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControlLabel
            control={
              <Checkbox
                checked={productForm.is_pizza}
                onChange={handleInputChange}
                name="is_pizza"
              />
            }
            label={t('product_management.is_pizza')}
          />

          {productForm.is_pizza && (
            <FormControl fullWidth variant="outlined">
              <InputLabel>{t('product_management.pizza_type')}</InputLabel>
              <Select
                name="pizza_type"
                value={productForm.pizza_type}
                onChange={handleInputChange}
                label={t('product_management.pizza_type')}
              >
                <MenuItem value="">{t('product_management.select_pizza_type')}</MenuItem>
                <MenuItem value="variable_price">{t('product_management.variable_price_pizza')}</MenuItem>
                <MenuItem value="fixed_price">{t('product_management.fixed_price_pizza')}</MenuItem>
              </Select>
            </FormControl>
          )}

          <Typography variant="subtitle1" sx={{ mt: 2 }}>{t('product_management.availability')}</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, flexWrap: 'wrap' }}>
            <FormControlLabel
              control={<Checkbox checked={productForm.available_for_delivery} onChange={handleInputChange} name="available_for_delivery" />}
              label={t('product_management.available_for_delivery')}
            />
            <FormControlLabel
              control={<Checkbox checked={productForm.available_for_dine_in} onChange={handleInputChange} name="available_for_dine_in" />}
              label={t('product_management.available_for_dine_in')}
            />
            <FormControlLabel
              control={<Checkbox checked={productForm.available_for_online_order} onChange={handleInputChange} name="available_for_online_order" />}
              label={t('product_management.available_for_online_order')}
            />
            <FormControlLabel
              control={<Checkbox checked={productForm.available_for_digital_menu} onChange={handleInputChange} name="available_for_digital_menu" />}
              label={t('product_management.available_for_digital_menu')}
            />
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              variant="outlined"
              component="label"
              startIcon={<ImageIcon />}
            >
              {t('product_management.upload_image')}
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleImageUpload}
              />
            </Button>
            {productForm.image_url && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2">{t('product_management.image_uploaded')}</Typography>
                <IconButton onClick={() => window.open(productForm.image_url, '_blank')}>
                  <ImageIcon />
                </IconButton>
                <IconButton onClick={() => setProductForm({ ...productForm, image_url: '' })} color="error">
                  <DeleteIcon />
                </IconButton>
              </Box>
            )}
          </Box>

          <Paper elevation={2} className="form-container" sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>{editingProduct ? t('product_management.edit_product') : t('product_management.add_new_product')}</Typography>
        <Box className="form-row">
          <Box className="form-group">
            <TextField
              label={t('product_management.product_name')}
              name="name"
              variant="outlined"
              fullWidth
              value={productForm.name}
              onChange={handleInputChange}
              className="form-control"
            />
          </Box>
          <Box className="form-group">
            <TextField
              label={t('product_management.description')}
              name="description"
              variant="outlined"
              fullWidth
              multiline
              rows={3}
              value={productForm.description}
              onChange={handleInputChange}
              className="form-control"
            />
          </Box>
        </Box>
        <Box className="form-row">
          <Box className="form-group">
            <TextField
              label={t('product_management.price')}
              name="price"
              variant="outlined"
              fullWidth
              type="number"
              value={productForm.price}
              onChange={handleInputChange}
              className="form-control"
            />
          </Box>
          <Box className="form-group">
            <TextField
              label={t('product_management.sku')}
              name="sku"
              variant="outlined"
              fullWidth
              value={productForm.sku}
              onChange={handleInputChange}
              className="form-control"
            />
          </Box>
          <Box className="form-group">
            <FormControl fullWidth variant="outlined">
              <InputLabel>{t('product_management.category')}</InputLabel>
              <Select
                name="category_id"
                value={productForm.category_id}
                onChange={handleInputChange}
                label={t('product_management.category')}
                className="form-control"
              >
                <MenuItem value="">{t('product_management.select_category')}</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Box>

        <Box className="form-group">
          <FormControlLabel
            control={
              <Checkbox
                checked={productForm.is_pizza}
                onChange={handleInputChange}
                name="is_pizza"
              />
            }
            label={t('product_management.is_pizza')}
          />
        </Box>

        {productForm.is_pizza && (
          <Box className="form-group">
            <FormControl fullWidth variant="outlined">
              <InputLabel>{t('product_management.pizza_type')}</InputLabel>
              <Select
                name="pizza_type"
                value={productForm.pizza_type}
                onChange={handleInputChange}
                label={t('product_management.pizza_type')}
                className="form-control"
              >
                <MenuItem value="">{t('product_management.select_pizza_type')}</MenuItem>
                <MenuItem value="variable_price">{t('product_management.variable_price_pizza')}</MenuItem>
                <MenuItem value="fixed_price">{t('product_management.fixed_price_pizza')}</MenuItem>
              </Select>
            </FormControl>
          </Box>
        )}

        <Typography variant="subtitle1" sx={{ mt: 2 }}>{t('product_management.availability')}</Typography>
        <Box className="form-group" sx={{ display: 'flex', flexDirection: 'row', gap: 2, flexWrap: 'wrap' }}>
          <FormControlLabel
            control={<Checkbox checked={productForm.available_for_delivery} onChange={handleInputChange} name="available_for_delivery" />}
            label={t('product_management.available_for_delivery')}
          />
          <FormControlLabel
            control={<Checkbox checked={productForm.available_for_dine_in} onChange={handleInputChange} name="available_for_dine_in" />}
            label={t('product_management.available_for_dine_in')}
          />
          <FormControlLabel
            control={<Checkbox checked={productForm.available_for_online_order} onChange={handleInputChange} name="available_for_online_order" />}
            label={t('product_management.available_for_online_order')}
          />
          <FormControlLabel
            control={<Checkbox checked={productForm.available_for_digital_menu} onChange={handleInputChange} name="available_for_digital_menu" />}
            label={t('product_management.available_for_digital_menu')}
          />
        </Box>

        <Box className="form-group">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              variant="outlined"
              component="label"
              startIcon={<ImageIcon />}
              className="btn btn-secondary"
            >
              {t('product_management.upload_image')}
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleImageUpload}
              />
            </Button>
            {productForm.image_url && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2">{t('product_management.image_uploaded')}</Typography>
                <IconButton onClick={() => window.open(productForm.image_url, '_blank')}>
                  <ImageIcon />
                </IconButton>
                <IconButton onClick={() => setProductForm({ ...productForm, image_url: '' })} color="error">
                  <DeleteIcon />
                </IconButton>
              </Box>
            )}
          </Box>
        </Box>

        <Box className="form-group">
          <FormControl fullWidth variant="outlined">
            <InputLabel>{t('product_management.addons')}</InputLabel>
            <Select
              name="addons"
              multiple
              value={productForm.addons}
              onChange={handleInputChange}
              label={t('product_management.addons')}
              renderValue={(selected) => selected.map(id => addons.find(addon => addon.id === id)?.name).join(', ')}
              className="form-control"
            >
              {addons.map((addon) => (
                <MenuItem key={addon.id} value={addon.id}>
                  {addon.name} (R$ {addon.price})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Box className="form-group">
          <Typography variant="h6" gutterBottom>{t('product_management.variations')}</Typography>
          <Box className="variants-container">
            {productForm.variations.map((variation, index) => (
              <Box key={index} className="variant-item">
                <TextField
                  label={t('product_management.variation_name')}
                  variant="outlined"
                  fullWidth
                  value={variation.name}
                  onChange={(e) => handleVariationChange(index, 'name', e.target.value)}
                  className="form-control"
                />
                <TextField
                  label={t('product_management.variation_value')}
                  variant="outlined"
                  fullWidth
                  value={variation.value}
                  onChange={(e) => handleVariationChange(index, 'value', e.target.value)}
                  className="form-control"
                />
                <TextField
                  label={t('product_management.additional_price')}
                  variant="outlined"
                  fullWidth
                  type="number"
                  value={variation.additionalPrice}
                  onChange={(e) => handleVariationChange(index, 'additionalPrice', e.target.value)}
                  className="form-control"
                />
                <button type="button" className="btn btn-secondary" onClick={() => handleRemoveVariation(index)}><i className="fas fa-trash"></i></button>
              </Box>
            ))}
            <button type="button" className="btn btn-secondary" style={{ marginTop: '10px' }} onClick={handleAddVariation}>
              <i className="fas fa-plus"></i> {t('product_management.add_variation')}
            </button>
          </Box>
        </Box>

        <Box sx={{ marginTop: '30px' }}>
          {editingProduct ? (
            <Button
              variant="contained"
              color="primary"
              startIcon={<EditIcon />}
              onClick={handleUpdateProduct}
              disabled={updateProductMutation.isLoading}
              className="btn btn-primary"
            >
              {t('product_management.update_button')}
            </Button>
          ) : (
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleAddProduct}
              disabled={addProductMutation.isLoading}
              className="btn btn-primary"
            >
              {t('product_management.add_button')}
            </Button>
          )}
          {editingProduct && (
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => {
                setEditingProduct(null);
                setProductForm({
                  name: '',
                  description: '',
                  price: '',
                  sku: '',
                  category_id: '',
                  is_pizza: false,
                  pizza_type: '',
                  available_for_delivery: true,
                  available_for_dine_in: true,
                  available_for_online_order: true,
                  available_for_digital_menu: true,
                  image_url: '',
                  addons: [],
                  variations: [],
                });
              }}
              className="btn btn-secondary"
            >
              {t('common.cancel')}
            </Button>
          )}
        </Box>
      </Paper>

          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>{t('product_management.variations')}</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {productForm.variations.map((variation, index) => (
              <Box key={index} sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <TextField
                  label={t('product_management.variation_name')}
                  variant="outlined"
                  fullWidth
                  value={variation.name}
                  onChange={(e) => handleVariationChange(index, 'name', e.target.value)}
                />
                <TextField
                  label={t('product_management.variation_value')}
                  variant="outlined"
                  fullWidth
                  value={variation.value}
                  onChange={(e) => handleVariationChange(index, 'value', e.target.value)}
                />
                <TextField
                  label={t('product_management.additional_price')}
                  variant="outlined"
                  fullWidth
                  type="number"
                  value={variation.additionalPrice}
                  onChange={(e) => handleVariationChange(index, 'additionalPrice', e.target.value)}
                />
                <IconButton onClick={() => handleRemoveVariation(index)} color="error">
                  <DeleteIcon />
                </IconButton>
              </Box>
            ))}
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={handleAddVariation}
            >
              {t('product_management.add_variation')}
            </Button>
          </Box>

          {editingProduct ? (
            <Button
              variant="contained"
              color="primary"
              startIcon={<EditIcon />}
              onClick={handleUpdateProduct}
              disabled={updateProductMutation.isLoading}
            >
              {t('product_management.update_button')}
            </Button>
          ) : (
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleAddProduct}
              disabled={addProductMutation.isLoading}
            >
              {t('product_management.add_button')}
            </Button>
          )}
          {editingProduct && (
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => {
                setEditingProduct(null);
                setProductForm({
                  name: '',
                  description: '',
                  price: '',
                  sku: '',
                  category_id: '',
                  is_pizza: false,
                  pizza_type: '',
                  available_for_delivery: true,
                  available_for_dine_in: true,
                  available_for_online_order: true,
                  available_for_digital_menu: true,
                  image_url: '',
                });
              }}
            >
              {t('common.cancel')}
            </Button>
          )}
        </Box>
      </Paper>

      <Typography variant="h6" gutterBottom>{t('product_management.existing_products')}</Typography>
      <Box className="table-container">
        <Box className="card-header" style={{ padding: '15px 20px', borderBottom: '1px solid #e0e0e0' }}>
          <span className="card-title">{t('product_management.existing_products')}</span>
          <Box>
            <select className="form-control" style={{ width: 'auto', display: 'inline-block', marginRight: '10px' }}>
              <option>{t('common.all_categories')}</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <button className="btn btn-primary" style={{ padding: '8px 15px' }} onClick={() => { setEditingProduct(null); setProductForm({
              name: '',
              description: '',
              price: '',
              sku: '',
              category_id: '',
              is_pizza: false,
              pizza_type: '',
              available_for_delivery: true,
              available_for_dine_in: true,
              available_for_online_order: true,
              available_for_digital_menu: true,
              image_url: '',
              addons: [],
              variations: [],
            }); }}>
              <i className="fas fa-plus"></i> {t('product_management.add_new_product')}
            </button>
          </Box>
        </Box>
        <table>
          <thead>
            <tr>
              <th style={{ width: '50px' }}>#</th>
              <th>{t('product_management.product_name')}</th>
              <th>{t('product_management.category')}</th>
              <th>{t('product_management.price')}</th>
              <th>{t('common.status')}</th>
              <th>{t('common.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan="6"><Typography>{t('product_management.no_products')}</Typography></td>
              </tr>
            ) : (
              products.map((product, index) => (
                <tr key={product.id}>
                  <td>{index + 1}</td>
                  <td>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {product.image_url && (
                        <img src={product.image_url} style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover', marginRight: '10px' }} alt={product.name} />
                      )}
                      {product.name}
                    </Box>
                  </td>
                  <td>{product.category ? product.category.name : t('common.none')}</td>
                  <td>R$ {product.price}</td>
                  <td><span className={`status ${product.available_for_digital_menu ? 'active' : 'inactive'}`}>{product.available_for_digital_menu ? t('common.active') : t('common.inactive')}</span></td>
                  <td>
                    <button className="action-btn edit-btn" onClick={() => handleEditClick(product)}><i className="fas fa-edit"></i></button>
                    <button className="action-btn delete-btn" onClick={() => handleDeleteClick(product)}><i className="fas fa-trash"></i></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Box>

      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{t('product_management.confirm_delete_title')}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {t('product_management.confirm_delete_message', { productName: productToDelete?.name })}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>{t('common.cancel')}</Button>
          <Button onClick={handleConfirmDelete} color="error" autoFocus>
            {t('common.delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProductManagement;
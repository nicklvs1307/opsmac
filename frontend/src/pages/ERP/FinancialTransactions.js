import React, { useState } from 'react';
import { Box, Typography, CircularProgress, Alert, Button, TextField, MenuItem, Select, FormControl, InputLabel, IconButton, Divider, List, ListItem, ListItemText } from '@mui/material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import axiosInstance from '../../api/axiosInstance';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { Add as AddIcon, FilterList as FilterListIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import FinancialTransactionFormModal from '../../components/FinancialTransactionFormModal';

const fetchFinancialTransactions = async ({ queryKey }) => {
  const [, restaurantId, filters] = queryKey;
  const { type, category_id, start_date, end_date } = filters;
  let url = `/api/financial/transactions?restaurant_id=${restaurantId}`;
  if (type) url += `&type=${type}`;
  if (category_id) url += `&category_id=${category_id}`;
  if (start_date) url += `&start_date=${start_date}`;
  if (end_date) url += `&end_date=${end_date}`;
  const { data } = await axiosInstance.get(url);
  return data;
};

const fetchFinancialCategories = async ({ queryKey }) => {
  const [, restaurantId, type] = queryKey;
  let url = `/api/financial/categories?restaurant_id=${restaurantId}`;
  if (type) url += `&type=${type}`;
  const { data } = await axiosInstance.get(url);
  return data;
};

const FinancialTransactions = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const restaurantId = user?.restaurants?.[0]?.id;

  const [filters, setFilters] = useState({
    type: '',
    category_id: '',
    start_date: '',
    end_date: '',
  });
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);

  const { data: transactions, isLoading: isLoadingTransactions, isError: isErrorTransactions } = useQuery(
    ['financialTransactions', restaurantId, filters],
    fetchFinancialTransactions,
    {
      enabled: !!restaurantId,
      onError: (error) => {
        toast.error(t('financial.error_loading_transactions', { message: error.response?.data?.msg || error.message }));
      },
    }
  );

  const { data: categories, isLoading: isLoadingCategories, isError: isErrorCategories } = useQuery(
    ['financialCategories', restaurantId, filters.type],
    fetchFinancialCategories,
    {
      enabled: !!restaurantId,
      onError: (error) => {
        toast.error(t('financial.error_loading_categories', { message: error.response?.data?.msg || error.message }));
      },
    }
  );

  const createTransactionMutation = useMutation(
    async (newTransaction) => {
      const { data } = await axiosInstance.post('/api/financial/transactions', newTransaction);
      return data;
    },
    {
      onSuccess: () => {
        toast.success(t('financial.transaction_added_success'));
        queryClient.invalidateQueries(['financialTransactions', restaurantId]);
        setFormModalOpen(false);
      },
      onError: (error) => {
        toast.error(t('financial.error_adding_transaction', { message: error.response?.data?.msg || error.message }));
      },
    }
  );

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleOpenFormModal = () => {
    setEditingTransaction(null);
    setFormModalOpen(true);
  };

  const handleSaveTransaction = (transactionData) => {
    createTransactionMutation.mutate(transactionData);
  };

  if (isLoadingTransactions || isLoadingCategories) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (isErrorTransactions || isErrorCategories) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Alert severity="error">{t('financial.error_loading_data')}</Alert>
      </Box>
    );
  }

  if (!restaurantId) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Alert severity="warning">{t('financial.no_restaurant_associated')}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>{t('financial.transactions_title')}</Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'flex-end' }}>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>{t('financial.type')}</InputLabel>
          <Select
            name="type"
            value={filters.type}
            label={t('financial.type')}
            onChange={handleFilterChange}
          >
            <MenuItem value="">{t('financial.all')}</MenuItem>
            <MenuItem value="income">{t('financial.income')}</MenuItem>
            <MenuItem value="expense">{t('financial.expense')}</MenuItem>
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 180 }}>
          <InputLabel>{t('financial.category')}</InputLabel>
          <Select
            name="category_id"
            value={filters.category_id}
            label={t('financial.category')}
            onChange={handleFilterChange}
          >
            <MenuItem value="">{t('financial.all')}</MenuItem>
            {categories?.map(category => (
              <MenuItem key={category.id} value={category.id}>{category.name}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          name="start_date"
          label={t('financial.start_date')}
          type="date"
          value={filters.start_date}
          onChange={handleFilterChange}
          InputLabelProps={{
            shrink: true,
          }}
        />
        <TextField
          name="end_date"
          label={t('financial.end_date')}
          type="date"
          value={filters.end_date}
          onChange={handleFilterChange}
          InputLabelProps={{
            shrink: true,
          }}
        />

        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenFormModal}>
          {t('financial.add_transaction')}
        </Button>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {transactions?.length === 0 ? (
        <Typography>{t('financial.no_transactions_found')}</Typography>
      ) : (
        <List>
          {transactions?.map(transaction => (
            <ListItem key={transaction.id} secondaryAction={
              <Box>
                <IconButton edge="end" aria-label="edit">
                  <EditIcon />
                </IconButton>
                <IconButton edge="end" aria-label="delete">
                  <DeleteIcon />
                </IconButton>
              </Box>
            }>
              <ListItemText
                primary={`R$ ${Number(transaction.amount).toFixed(2).replace('.', ',')} - ${transaction.description || t('financial.no_description')}`}
                secondary={
                  <React.Fragment>
                    <Typography
                      sx={{ display: 'inline' }}
                      component="span"
                      variant="body2"
                      color="text.primary"
                    >
                      {t('financial.type')}: {t(`financial.${transaction.type}`)} - {t('financial.category')}: {transaction.category?.name || t('financial.uncategorized')}
                    </Typography>
                    {` — ${new Date(transaction.transaction_date).toLocaleDateString()}`}
                  </React.Fragment>
                }
              />
            </ListItem>
          ))}
        </List>
      )}

      <FinancialTransactionFormModal
        open={formModalOpen}
        handleClose={() => setFormModalOpen(false)}
        handleSave={handleSaveTransaction}
        restaurantId={restaurantId}
        initialData={editingTransaction}
      />
    </Box>
  );
};

export default FinancialTransactions;
import React, { useState } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Button,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  IconButton,
  Divider,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import { useAuth } from '@/app/providers/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import FinancialTransactionFormModal from '../../../shared/components/FinancialTransactionFormModal';
import {
  useFinancialTransactions,
  useFinancialCategories,
  useCreateFinancialTransaction,
  useUpdateFinancialTransaction,
  useDeleteFinancialTransaction,
} from '../api/erpQueries';

const FinancialTransactions = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const restaurantId = user?.restaurants?.[0]?.id;

  const [filters, setFilters] = useState({
    restaurantId: restaurantId,
    type: '',
    category_id: '',
    start_date: '',
    end_date: '',
  });
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);

  const {
    data: transactions,
    isLoading: isLoadingTransactions,
    isError: isErrorTransactions,
    error: errorTransactions,
  } = useFinancialTransactions(filters);

  const {
    data: categories,
    isLoading: isLoadingCategories,
    isError: isErrorCategories,
    error: errorCategories,
  } = useFinancialCategories(restaurantId);

  const createTransactionMutation = useCreateFinancialTransaction();
  const updateTransactionMutation = useUpdateFinancialTransaction();
  const deleteTransactionMutation = useDeleteFinancialTransaction();

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleOpenFormModal = (transaction = null) => {
    setEditingTransaction(transaction);
    setFormModalOpen(true);
  };

  const handleSaveTransaction = (transactionData) => {
    if (editingTransaction) {
      updateTransactionMutation.mutate({ id: editingTransaction.id, fields: transactionData });
    } else {
      createTransactionMutation.mutate(transactionData);
    }
    setFormModalOpen(false);
  };

  const handleDeleteTransaction = (transactionId) => {
    deleteTransactionMutation.mutate(transactionId);
  };

  if (isLoadingTransactions || isLoadingCategories) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (isErrorTransactions || isErrorCategories) {
    console.error('Error loading financial data:', errorTransactions || errorCategories);
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
      <Typography variant="h4" gutterBottom>
        {t('financial.transactions_title')}
      </Typography>

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
            {categories?.map((category) => (
              <MenuItem key={category.id} value={category.id}>
                {category.name}
              </MenuItem>
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

        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenFormModal()}>
          {t('financial.add_transaction')}
        </Button>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {transactions?.length === 0 ? (
        <Typography>{t('financial.no_transactions_found')}</Typography>
      ) : (
        <List>
          {transactions?.map((transaction) => (
            <ListItem
              key={transaction.id}
              secondaryAction={
                <Box>
                  <IconButton
                    edge="end"
                    aria-label="edit"
                    onClick={() => handleOpenFormModal(transaction)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={() => handleDeleteTransaction(transaction.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              }
            >
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
                      {t('financial.type')}: {t(`financial.${transaction.type}`)} -{' '}
                      {t('financial.category')}:{' '}
                      {transaction.category?.name || t('financial.uncategorized')}
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

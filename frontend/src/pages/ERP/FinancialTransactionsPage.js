import React, { useState } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Button,
  TextField,
  Paper,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
} from '@mui/material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import axiosInstance from '../../api/axiosInstance';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { useAuth } from '@/app/providers/contexts/AuthContext';

const fetchFinancialTransactions = async ({ queryKey }) => {
  const [, restaurantId] = queryKey;
  const { data } = await axiosInstance.get(
    `/api/financial/transactions?restaurant_id=${restaurantId}`
  );
  return data;
};

const fetchFinancialCategories = async ({ queryKey }) => {
  const [, restaurantId] = queryKey;
  const { data } = await axiosInstance.get(
    `/api/financial/categories?restaurant_id=${restaurantId}`
  );
  return data;
};

const createFinancialTransaction = async (newTransaction) => {
  const { data } = await axiosInstance.post('/api/financial/transactions', newTransaction);
  return data;
};

const updateFinancialTransaction = async (updatedTransaction) => {
  const { id, ...fields } = updatedTransaction;
  const { data } = await axiosInstance.put(`/api/financial/transactions/${id}`, fields);
  return data;
};

const deleteFinancialTransaction = async (transactionId) => {
  await axiosInstance.delete(`/api/financial/transactions/${transactionId}`);
};

const FinancialTransactionsPage = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const restaurantId = user?.restaurants?.[0]?.id;

  const [openFormDialog, setOpenFormDialog] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [transactionType, setTransactionType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [transactionDate, setTransactionDate] = useState(new Date().toISOString().split('T')[0]);
  const [categoryId, setCategoryId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [receiptUrl, setReceiptUrl] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringInterval, setRecurringInterval] = useState('');
  const [recurringEndsAt, setRecurringEndsAt] = useState('');

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState(null);

  const {
    data: transactions,
    isLoading,
    isError,
    error,
  } = useQuery(['financialTransactions', restaurantId], fetchFinancialTransactions, {
    enabled: !!restaurantId,
    onError: (err) => {
      toast.error(
        t('financial.error_loading_transactions', {
          message: err.response?.data?.msg || err.message,
        })
      );
    },
  });

  const {
    data: categories,
    isLoading: isLoadingCategories,
    isError: isErrorCategories,
  } = useQuery(['financialCategories', restaurantId], fetchFinancialCategories, {
    enabled: !!restaurantId,
    onError: (err) => {
      toast.error(
        t('financial.error_loading_categories', { message: err.response?.data?.msg || err.message })
      );
    },
  });

  const createMutation = useMutation(createFinancialTransaction, {
    onSuccess: () => {
      toast.success(t('financial.transaction_created_success'));
      setOpenFormDialog(false);
      resetForm();
      queryClient.invalidateQueries('financialTransactions');
    },
    onError: (err) => {
      toast.error(
        t('financial.error_creating_transaction', {
          message: err.response?.data?.msg || err.message,
        })
      );
    },
  });

  const updateMutation = useMutation(updateFinancialTransaction, {
    onSuccess: () => {
      toast.success(t('financial.transaction_updated_success'));
      setOpenFormDialog(false);
      resetForm();
      queryClient.invalidateQueries('financialTransactions');
    },
    onError: (err) => {
      toast.error(
        t('financial.error_updating_transaction', {
          message: err.response?.data?.msg || err.message,
        })
      );
    },
  });

  const deleteMutation = useMutation(deleteFinancialTransaction, {
    onSuccess: () => {
      toast.success(t('financial.transaction_deleted_success'));
      setOpenDeleteDialog(false);
      setTransactionToDelete(null);
      queryClient.invalidateQueries('financialTransactions');
    },
    onError: (err) => {
      toast.error(
        t('financial.error_deleting_transaction', {
          message: err.response?.data?.msg || err.message,
        })
      );
    },
  });

  const resetForm = () => {
    setEditingTransaction(null);
    setTransactionType('expense');
    setAmount('');
    setDescription('');
    setTransactionDate(new Date().toISOString().split('T')[0]);
    setCategoryId('');
    setPaymentMethod('');
    setReceiptUrl('');
    setIsRecurring(false);
    setRecurringInterval('');
    setRecurringEndsAt('');
  };

  const handleOpenFormDialog = (transaction = null) => {
    if (transaction) {
      setEditingTransaction(transaction);
      setTransactionType(transaction.type);
      setAmount(transaction.amount);
      setDescription(transaction.description);
      setTransactionDate(transaction.transaction_date.split('T')[0]); // Format date for input
      setCategoryId(transaction.category_id || '');
      setPaymentMethod(transaction.payment_method || '');
      setIsRecurring(transaction.is_recurring);
      setRecurringInterval(transaction.recurring_interval || '');
      setRecurringEndsAt(
        transaction.recurring_ends_at ? transaction.recurring_ends_at.split('T')[0] : ''
      );
      setReceiptUrl(transaction.receipt_url || '');
    }
    setOpenFormDialog(true);
  };

  const handleCloseFormDialog = () => {
    setOpenFormDialog(false);
    resetForm();
  };

  const handleSubmit = () => {
    const transactionData = {
      restaurant_id: restaurantId,
      type: transactionType,
      amount: parseFloat(amount),
      description,
      transaction_date: transactionDate,
      category_id: categoryId || null,
      payment_method: paymentMethod || null,
      receipt_url: receiptUrl || null,
      is_recurring: isRecurring,
      recurring_interval: isRecurring ? recurringInterval : null,
      recurring_ends_at: isRecurring && recurringEndsAt ? recurringEndsAt : null,
    };

    if (editingTransaction) {
      updateMutation.mutate({ id: editingTransaction.id, ...transactionData });
    } else {
      createMutation.mutate(transactionData);
    }
  };

  const handleDeleteClick = (transaction) => {
    setTransactionToDelete(transaction);
    setOpenDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    if (transactionToDelete) {
      deleteMutation.mutate(transactionToDelete.id);
    }
  };

  if (isLoading || isLoadingCategories) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (isError || isErrorCategories) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <Alert severity="error">
          {t('financial.error_loading_transactions', {
            message: error?.message || 'Unknown error',
          })}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {t('financial.manage_transactions')}
      </Typography>

      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={() => handleOpenFormDialog()}
        sx={{ mb: 3 }}
      >
        {t('financial.add_new_transaction')}
      </Button>

      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          {t('financial.existing_transactions')}
        </Typography>
        {transactions.length === 0 ? (
          <Typography variant="body1" color="text.secondary">
            {t('financial.no_transactions_found')}
          </Typography>
        ) : (
          <List>
            {transactions.map((transaction) => (
              <ListItem
                key={transaction.id}
                secondaryAction={
                  <>
                    <IconButton
                      edge="end"
                      aria-label="view"
                      onClick={() => handleOpenFormDialog(transaction)}
                    >
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton
                      edge="end"
                      aria-label="edit"
                      onClick={() => handleOpenFormDialog(transaction)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() => handleDeleteClick(transaction)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </>
                }
              >
                <ListItemText
                  primary={
                    <>
                      <Typography
                        component="span"
                        variant="subtitle1"
                        color={transaction.type === 'income' ? 'success.main' : 'error.main'}
                      >
                        {transaction.type === 'income' ? '+' : '-'} R${' '}
                        {parseFloat(transaction.amount).toFixed(2).replace('.', ',')}
                      </Typography>
                      <Typography
                        component="span"
                        variant="body2"
                        color="text.secondary"
                        sx={{ ml: 1 }}
                      >
                        ({transaction.description || t('financial.no_description')})
                      </Typography>
                    </>
                  }
                  secondary={
                    <>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(transaction.transaction_date).toLocaleDateString()}
                        {transaction.category && ` - ${transaction.category.name}`}
                        {transaction.payment_method && ` - ${transaction.payment_method}`}
                      </Typography>
                      {transaction.is_recurring && (
                        <Typography variant="body2" color="text.secondary">
                          {t('financial.recurring')} (
                          {t(`financial.recurring_interval_${transaction.recurring_interval}`)})
                          {transaction.recurring_ends_at &&
                            ` ${t('financial.until')} ${new Date(transaction.recurring_ends_at).toLocaleDateString()}`}
                        </Typography>
                      )}
                    </>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
      </Paper>

      <Dialog open={openFormDialog} onClose={handleCloseFormDialog} fullWidth maxWidth="sm">
        <DialogTitle>
          {editingTransaction
            ? t('financial.edit_transaction')
            : t('financial.add_new_transaction')}
        </DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>{t('financial.transaction_type')}</InputLabel>
            <Select
              value={transactionType}
              label={t('financial.transaction_type')}
              onChange={(e) => setTransactionType(e.target.value)}
            >
              <MenuItem value="expense">{t('financial.expense')}</MenuItem>
              <MenuItem value="income">{t('financial.income')}</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label={t('financial.amount')}
            type="number"
            fullWidth
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            label={t('financial.description')}
            fullWidth
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            label={t('financial.transaction_date')}
            type="date"
            fullWidth
            value={transactionDate}
            onChange={(e) => setTransactionDate(e.target.value)}
            InputLabelProps={{
              shrink: true,
            }}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>{t('financial.category')}</InputLabel>
            <Select
              value={categoryId}
              label={t('financial.category')}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              <MenuItem value="">{t('financial.select_category')}</MenuItem>
              {categories?.map((cat) => (
                <MenuItem key={cat.id} value={cat.id}>
                  {cat.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label={t('financial.payment_method')}
            fullWidth
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            label={t('financial.receipt_url')}
            fullWidth
            value={receiptUrl}
            onChange={(e) => setReceiptUrl(e.target.value)}
            sx={{ mb: 2 }}
          />
          <FormControlLabel
            control={
              <Switch checked={isRecurring} onChange={(e) => setIsRecurring(e.target.checked)} />
            }
            label={t('financial.is_recurring')}
            sx={{ mb: 2 }}
          />
          {isRecurring && (
            <>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>{t('financial.recurring_interval')}</InputLabel>
                <Select
                  value={recurringInterval}
                  label={t('financial.recurring_interval')}
                  onChange={(e) => setRecurringInterval(e.target.value)}
                >
                  <MenuItem value="daily">{t('financial.recurring_interval_daily')}</MenuItem>
                  <MenuItem value="weekly">{t('financial.recurring_interval_weekly')}</MenuItem>
                  <MenuItem value="monthly">{t('financial.recurring_interval_monthly')}</MenuItem>
                  <MenuItem value="yearly">{t('financial.recurring_interval_yearly')}</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label={t('financial.recurring_ends_at')}
                type="date"
                fullWidth
                value={recurringEndsAt}
                onChange={(e) => setRecurringEndsAt(e.target.value)}
                InputLabelProps={{
                  shrink: true,
                }}
                sx={{ mb: 2 }}
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseFormDialog}>{t('financial.cancel')}</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={createMutation.isLoading || updateMutation.isLoading}
          >
            {editingTransaction
              ? t('financial.update_transaction')
              : t('financial.add_transaction')}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {t('financial.confirm_delete_transaction_title')}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {t('financial.confirm_delete_transaction_message', {
              transactionId: transactionToDelete?.id,
            })}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>{t('financial.cancel')}</Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            autoFocus
            disabled={deleteMutation.isLoading}
          >
            {t('financial.delete_transaction')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FinancialTransactionsPage;

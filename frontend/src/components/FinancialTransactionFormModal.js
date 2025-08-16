import React, { useState, useEffect } from 'react';
import { Modal, Box, Typography, TextField, Button, IconButton, FormControl, InputLabel, Select, MenuItem, Switch, FormControlLabel } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useQuery } from 'react-query';
import axiosInstance from '../../api/axiosInstance';
import toast from 'react-hot-toast';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 500,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

const fetchFinancialCategories = async ({ queryKey }) => {
  const [, restaurantId, type] = queryKey;
  let url = `/api/financial/categories?restaurant_id=${restaurantId}`;
  if (type) url += `&type=${type}`;
  const { data } = await axiosInstance.get(url);
  return data;
};

const FinancialTransactionFormModal = ({ open, handleClose, handleSave, restaurantId, initialData }) => {
  const { t } = useTranslation();
  const [type, setType] = useState(initialData?.type || '');
  const [amount, setAmount] = useState(initialData?.amount || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [transactionDate, setTransactionDate] = useState(initialData?.transaction_date ? new Date(initialData.transaction_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
  const [categoryId, setCategoryId] = useState(initialData?.category_id || '');
  const [paymentMethod, setPaymentMethod] = useState(initialData?.payment_method || '');
  const [receiptUrl, setReceiptUrl] = useState(initialData?.receipt_url || '');
  const [isRecurring, setIsRecurring] = useState(initialData?.is_recurring || false);
  const [recurringInterval, setRecurringInterval] = useState(initialData?.recurring_interval || '');
  const [recurringEndsAt, setRecurringEndsAt] = useState(initialData?.recurring_ends_at ? new Date(initialData.recurring_ends_at).toISOString().split('T')[0] : '');

  const { data: categories, isLoading: isLoadingCategories, isError: isErrorCategories } = useQuery(
    ['financialCategories', restaurantId, type],
    fetchFinancialCategories,
    {
      enabled: !!restaurantId,
      onError: (error) => {
        toast.error(t('financial.error_loading_categories', { message: error.response?.data?.msg || error.message }));
      },
    }
  );

  useEffect(() => {
    if (initialData) {
      setType(initialData.type || '');
      setAmount(initialData.amount || '');
      setDescription(initialData.description || '');
      setTransactionDate(initialData.transaction_date ? new Date(initialData.transaction_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
      setCategoryId(initialData.category_id || '');
      setPaymentMethod(initialData.payment_method || '');
      setReceiptUrl(initialData.receipt_url || '');
      setIsRecurring(initialData.is_recurring || false);
      setRecurringInterval(initialData.recurring_interval || '');
      setRecurringEndsAt(initialData.recurring_ends_at ? new Date(initialData.recurring_ends_at).toISOString().split('T')[0] : '');
    }
  }, [initialData]);

  const onSave = () => {
    if (!type || !amount || parseFloat(amount) <= 0 || !transactionDate) {
      toast.error(t('financial.required_fields_error'));
      return;
    }

    handleSave({
      type,
      amount: parseFloat(amount),
      description,
      transaction_date: transactionDate,
      category_id: categoryId || null,
      payment_method: paymentMethod || null,
      receipt_url: receiptUrl || null,
      is_recurring: isRecurring,
      recurring_interval: isRecurring ? recurringInterval || null : null,
      recurring_ends_at: isRecurring ? recurringEndsAt || null : null,
    });
    // Reset form after save if not editing
    if (!initialData) {
      setType('');
      setAmount('');
      setDescription('');
      setTransactionDate(new Date().toISOString().split('T')[0]);
      setCategoryId('');
      setPaymentMethod('');
      setReceiptUrl('');
      setIsRecurring(false);
      setRecurringInterval('');
      setRecurringEndsAt('');
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="transaction-form-modal-title"
      aria-describedby="transaction-form-modal-description"
    >
      <Box sx={style}>
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
        <Typography id="transaction-form-modal-title" variant="h6" component="h2" gutterBottom>
          {initialData ? t('financial.edit_transaction_title') : t('financial.add_transaction_title')}
        </Typography>

        <FormControl fullWidth margin="dense">
          <InputLabel>{t('financial.type')}</InputLabel>
          <Select value={type} label={t('financial.type')} onChange={(e) => setType(e.target.value)}>
            <MenuItem value="income">{t('financial.income')}</MenuItem>
            <MenuItem value="expense">{t('financial.expense')}</MenuItem>
          </Select>
        </FormControl>

        <TextField
          margin="dense"
          label={t('financial.amount')}
          type="number"
          fullWidth
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        <TextField
          margin="dense"
          label={t('financial.description')}
          type="text"
          fullWidth
          multiline
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <TextField
          margin="dense"
          label={t('financial.transaction_date')}
          type="date"
          fullWidth
          value={transactionDate}
          onChange={(e) => setTransactionDate(e.target.value)}
          InputLabelProps={{
            shrink: true,
          }}
        />

        <FormControl fullWidth margin="dense">
          <InputLabel>{t('financial.category')}</InputLabel>
          <Select value={categoryId} label={t('financial.category')} onChange={(e) => setCategoryId(e.target.value)}>
            <MenuItem value="">{t('financial.select_category')}</MenuItem>
            {isLoadingCategories ? (
              <MenuItem disabled>{t('financial.loading_categories')}</MenuItem>
            ) : isErrorCategories ? (
              <MenuItem disabled>{t('financial.error_loading_categories')}</MenuItem>
            ) : (
              categories?.map(cat => (
                <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
              ))
            )}
          </Select>
        </FormControl>

        <FormControl fullWidth margin="dense">
          <InputLabel>{t('financial.payment_method')}</InputLabel>
          <Select value={paymentMethod} label={t('financial.payment_method')} onChange={(e) => setPaymentMethod(e.target.value)}>
            <MenuItem value="">{t('financial.select_payment_method')}</MenuItem>
            <MenuItem value="cash">{t('financial.cash')}</MenuItem>
            <MenuItem value="credit_card">{t('financial.credit_card')}</MenuItem>
            <MenuItem value="debit_card">{t('financial.debit_card')}</MenuItem>
            <MenuItem value="pix">{t('financial.pix')}</MenuItem>
            <MenuItem value="bank_transfer">{t('financial.bank_transfer')}</MenuItem>
            <MenuItem value="other">{t('financial.other')}</MenuItem>
          </Select>
        </FormControl>

        <TextField
          margin="dense"
          label={t('financial.receipt_url')}
          type="url"
          fullWidth
          value={receiptUrl}
          onChange={(e) => setReceiptUrl(e.target.value)}
        />

        <FormControlLabel
          control={<Switch checked={isRecurring} onChange={(e) => setIsRecurring(e.target.checked)} />}
          label={t('financial.is_recurring')}
          sx={{ mt: 2 }}
        />

        {isRecurring && (
          <React.Fragment>
            <FormControl fullWidth margin="dense">
              <InputLabel>{t('financial.recurring_interval')}</InputLabel>
              <Select value={recurringInterval} label={t('financial.recurring_interval')} onChange={(e) => setRecurringInterval(e.target.value)}>
                <MenuItem value="daily">{t('financial.daily')}</MenuItem>
                <MenuItem value="weekly">{t('financial.weekly')}</MenuItem>
                <MenuItem value="monthly">{t('financial.monthly')}</MenuItem>
                <MenuItem value="yearly">{t('financial.yearly')}</MenuItem>
              </Select>
            </FormControl>
            <TextField
              margin="dense"
              label={t('financial.recurring_ends_at')}
              type="date"
              fullWidth
              value={recurringEndsAt}
              onChange={(e) => setRecurringEndsAt(e.target.value)}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </React.Fragment>
        )}

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          <Button variant="outlined" onClick={handleClose}>
            {t('financial.cancel')}
          </Button>
          <Button variant="contained" onClick={onSave}>
            {initialData ? t('financial.save_changes') : t('financial.add')}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default FinancialTransactionFormModal;
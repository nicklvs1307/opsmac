import React, { useState } from 'react';
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useQuery } from 'react-query';
import axiosInstance from '../api/axiosInstance';
import toast from 'react-hot-toast';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

const fetchWithdrawalCategories = async () => {
  const { data } = await axiosInstance.get('/api/cash-register/categories?type=withdrawal');
  return data;
};

const WithdrawalModal = ({ open, handleClose, handleSave, currentSessionId }) => {
  const { t } = useTranslation();
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [observations, setObservations] = useState('');

  const {
    data: categories,
    isLoading: isLoadingCategories,
    isError: isErrorCategories,
  } = useQuery('withdrawalCategories', fetchWithdrawalCategories, {
    onError: (error) => {
      toast.error(
        t('pdv.error_loading_categories', { message: error.response?.data?.msg || error.message })
      );
    },
  });

  const onSave = () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error(t('pdv.amount_required'));
      return;
    }
    if (!categoryId) {
      toast.error(t('pdv.category_required'));
      return;
    }
    handleSave({
      session_id: currentSessionId,
      amount: parseFloat(amount),
      category_id: categoryId,
      observations,
    });
    setAmount('');
    setCategoryId('');
    setObservations('');
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="withdrawal-modal-title"
      aria-describedby="withdrawal-modal-description"
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
        <Typography id="withdrawal-modal-title" variant="h6" component="h2">
          {t('pdv.withdrawal_title')}
        </Typography>
        <TextField
          autoFocus
          margin="dense"
          id="amount"
          label={t('pdv.amount')}
          type="number"
          fullWidth
          variant="outlined"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          sx={{ mt: 2 }}
        />
        <FormControl fullWidth margin="dense" sx={{ mt: 2 }}>
          <InputLabel id="category-label">{t('pdv.category')}</InputLabel>
          <Select
            labelId="category-label"
            id="category"
            value={categoryId}
            label={t('pdv.category')}
            onChange={(e) => setCategoryId(e.target.value)}
          >
            {isLoadingCategories ? (
              <MenuItem disabled>{t('pdv.loading_categories')}</MenuItem>
            ) : isErrorCategories ? (
              <MenuItem disabled>{t('pdv.error_loading_categories')}</MenuItem>
            ) : (
              categories?.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))
            )}
          </Select>
        </FormControl>
        <TextField
          margin="dense"
          id="observations"
          label={t('pdv.observations')}
          type="text"
          fullWidth
          multiline
          rows={3}
          variant="outlined"
          value={observations}
          onChange={(e) => setObservations(e.target.value)}
          sx={{ mt: 2 }}
        />
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          <Button variant="outlined" onClick={handleClose}>
            {t('pdv.cancel')}
          </Button>
          <Button variant="contained" onClick={onSave}>
            {t('pdv.save')}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default WithdrawalModal;

import React from 'react';
import { Modal, Box, Typography, Button, IconButton, Divider, List, ListItem, ListItemText } from '@mui/material';
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
  width: 600,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

const fetchCashRegisterMovements = async ({ queryKey }) => {
  const [, sessionId] = queryKey;
  const { data } = await axiosInstance.get('/api/cash-register/movements?session_id=' + sessionId);
  return data;
};

const PartialSummaryModal = ({ open, handleClose, currentSession, cashOrders }) => {
  const { t } = useTranslation();

  const { data: movements, isLoading: isLoadingMovements, isError: isErrorMovements } = useQuery(
    ['cashRegisterMovements', currentSession?.id],
    fetchCashRegisterMovements,
    {
      enabled: !!currentSession?.id,
      onError: (error) => {
        toast.error(t('pdv.error_loading_movements', { message: error.response?.data?.msg || error.message }));
      },
    }
  );

  const calculateCurrentCash = () => {
    if (!currentSession) return 0;

    let totalCash = Number(currentSession.opening_cash);

    movements?.forEach(movement => {
      if (movement.type === 'reinforcement') {
        totalCash += Number(movement.amount);
      } else if (movement.type === 'withdrawal') {
        totalCash -= Number(movement.amount);
      }
    });

    cashOrders?.forEach(order => { // Add cash orders
      totalCash += Number(order.total_amount);
    });

    return totalCash;
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="partial-summary-modal-title"
      aria-describedby="partial-summary-modal-description"
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
        <Typography id="partial-summary-modal-title" variant="h6" component="h2" gutterBottom>
          {t('pdv.partial_summary_title')}
        </Typography>

        {currentSession && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body1">
              {t('pdv.session_id')}: {currentSession.id}
            </Typography>
            <Typography variant="body1">
              {t('pdv.opened_by')}: {currentSession.user?.name || t('pdv.unknown_user')}
            </Typography>
            <Typography variant="body1">
              {t('pdv.opening_time')}: {new Date(currentSession.opening_time).toLocaleString()}
            </Typography>
            <Typography variant="body1">
              {t('pdv.opening_cash')}: R$ {Number(currentSession.opening_cash).toFixed(2).replace('.', ',')}
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>{t('pdv.movements')}</Typography>
            {isLoadingMovements ? (
              <Typography>{t('pdv.loading_movements')}</Typography>
            ) : isErrorMovements ? (
              <Typography color="error">{t('pdv.error_loading_movements')}</Typography>
            ) : movements?.length === 0 ? (
              <Typography>{t('pdv.no_movements')}</Typography>
            ) : (
              <List dense>
                {movements?.map((movement) => (
                  <ListItem key={movement.id}>
                    <ListItemText
                      primary={`${movement.type === 'reinforcement' ? '+' : '-'} R$ ${Number(movement.amount).toFixed(2).replace('.', ',')} - ${movement.category?.name || movement.type}`}
                      secondary={movement.observations ? `(${movement.observations})` : ''}
                    />
                    <Typography variant="caption">{new Date(movement.createdAt).toLocaleTimeString()}</Typography>
                  </ListItem>
                ))}
              </List>
            )}
            <Divider sx={{ my: 2 }} />
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
              {t('pdv.current_cash_balance')}: R$ {calculateCurrentCash().toFixed(2).replace('.', ',')}
            </Typography>
          </Box>
        )}

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          <Button variant="contained" onClick={handleClose}>
            {t('pdv.close')}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default PartialSummaryModal;
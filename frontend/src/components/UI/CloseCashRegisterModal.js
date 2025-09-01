import React, { useState } from 'react';
import { Modal, Box, Typography, TextField, Button, IconButton } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
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

const CloseCashRegisterModal = ({
  open,
  handleClose,
  handleSave,
  currentSession,
  movements,
  cashOrders,
}) => {
  const { t } = useTranslation();
  const [closingCash, setClosingCash] = useState('');
  const [observations, setObservations] = useState('');

  const calculateCurrentCash = (session, movements, orders) => {
    if (!session) return 0;

    let totalCash = Number(session.opening_cash);

    movements?.forEach((movement) => {
      if (movement.type === 'reinforcement') {
        totalCash += Number(movement.amount);
      } else if (movement.type === 'withdrawal') {
        totalCash -= Number(movement.amount);
      }
    });

    orders?.forEach((order) => {
      totalCash += Number(order.total_amount);
    });

    return totalCash;
  };

  const onSave = () => {
    if (!closingCash || parseFloat(closingCash) < 0) {
      toast.error(t('pdv.closing_cash_required'));
      return;
    }
    handleSave({
      session_id: currentSession.id,
      closing_cash: parseFloat(closingCash),
      closing_observations: observations,
    });
    setClosingCash('');
    setObservations('');
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="close-cash-register-modal-title"
      aria-describedby="close-cash-register-modal-description"
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
        <Typography id="close-cash-register-modal-title" variant="h6" component="h2">
          {t('pdv.close_cash_register_title')}
        </Typography>
        {currentSession && (
          <Box sx={{ mt: 2, mb: 2 }}>
            <Typography variant="body1">
              {t('pdv.opening_cash')}: R${' '}
              {Number(currentSession.opening_cash).toFixed(2).replace('.', ',')}
            </Typography>
            {/* TODO: Add calculated current cash balance here */}
            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
              {t('pdv.expected_cash')}: R${' '}
              {calculateCurrentCash(currentSession, movements, cashOrders)
                .toFixed(2)
                .replace('.', ',')}
            </Typography>
          </Box>
        )}
        <TextField
          autoFocus
          margin="dense"
          id="closingCash"
          label={t('pdv.closing_cash')}
          type="number"
          fullWidth
          variant="outlined"
          value={closingCash}
          onChange={(e) => setClosingCash(e.target.value)}
        />
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
        />
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          <Button variant="outlined" onClick={handleClose}>
            {t('pdv.cancel')}
          </Button>
          <Button variant="contained" color="error" onClick={onSave}>
            {t('pdv.close_cash_register')}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default CloseCashRegisterModal;

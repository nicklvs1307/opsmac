import React, { useState } from 'react';
import { Modal, Box, Typography, TextField, Button, IconButton } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

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

const CashRegisterModal = ({ open, handleClose, handleSave }) => {
  const { t } = useTranslation();
  const [initialCash, setInitialCash] = useState('');
  const [observations, setObservations] = useState('');

  const onSave = () => {
    handleSave(initialCash, observations);
    setInitialCash('');
    setObservations('');
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="cash-register-modal-title"
      aria-describedby="cash-register-modal-description"
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
        <Typography id="cash-register-modal-title" variant="h6" component="h2">
          {t('pdv.open_cash_register_title')}
        </Typography>
        <TextField
          autoFocus
          margin="dense"
          id="initialCash"
          label={t('pdv.initial_cash')}
          type="number"
          fullWidth
          variant="outlined"
          value={initialCash}
          onChange={(e) => setInitialCash(e.target.value)}
          sx={{ mt: 2 }}
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

export default CashRegisterModal;
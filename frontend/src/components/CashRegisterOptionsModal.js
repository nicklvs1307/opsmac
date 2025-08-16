import React from 'react';
import { Modal, Box, Typography, Button, IconButton, Divider } from '@mui/material';
import { Close as CloseIcon, Remove as RemoveIcon, Add as AddIcon, Summarize as SummarizeIcon, Lock as LockIcon } from '@mui/icons-material';
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

const CashRegisterOptionsModal = ({ open, handleClose, currentSession, setWithdrawalModalOpen, setReinforcementModalOpen, setPartialSummaryModalOpen, setCloseCashRegisterModalOpen }) => {
  const { t } = useTranslation();

  // Helper to format time elapsed (can be passed as prop or duplicated if needed)
  const formatTimeElapsed = (startTime) => {
    const now = new Date();
    const start = new Date(startTime);
    const diffMs = now - start;

    const diffSeconds = Math.floor(diffMs / 1000);
    const hours = Math.floor((diffSeconds % 3600) / 60);
    const minutes = Math.floor((diffSeconds % 3600) / 60);
    const seconds = diffSeconds % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="cash-register-options-modal-title"
      aria-describedby="cash-register-options-modal-description"
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
        <Typography id="cash-register-options-modal-title" variant="h6" component="h2" gutterBottom>
          {t('pdv.cash_register_options_title')}
        </Typography>

        {currentSession && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body1">
              {t('pdv.time_open')}: {formatTimeElapsed(currentSession.opening_time)}
            </Typography>
            <Typography variant="body1">
              {t('pdv.initial_cash')}: R$ {Number(currentSession.opening_cash).toFixed(2).replace('.', ',')}
            </Typography>
            {/* TODO: Add current cash total (initial + cash orders) */}
            <Divider sx={{ my: 1 }} />
          </Box>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Button variant="outlined" startIcon={<RemoveIcon />} fullWidth onClick={() => { handleClose(); setWithdrawalModalOpen(true); }}>
            {t('pdv.withdrawal')}
          </Button>
          <Button variant="outlined" startIcon={<AddIcon />} fullWidth onClick={() => { handleClose(); setReinforcementModalOpen(true); }}>
            {t('pdv.reinforcement')}
          </Button>
          <Button variant="outlined" startIcon={<SummarizeIcon />} fullWidth onClick={() => { handleClose(); setPartialSummaryModalOpen(true); }}>
            {t('pdv.partial_summary')}
          </Button>
          <Button variant="contained" color="error" startIcon={<LockIcon />} fullWidth onClick={() => { handleClose(); setCloseCashRegisterModalOpen(true); }}>
            {t('pdv.close_cash_register')}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default CashRegisterOptionsModal;
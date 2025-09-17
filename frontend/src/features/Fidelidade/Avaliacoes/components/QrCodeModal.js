import React from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Modal,
} from '@mui/material';
import QRCode from 'qrcode.react';
import { useTranslation } from 'react-i18next';

const QrCodeModal = ({ isOpen, onClose, qrCodeValue }) => {
  const { t } = useTranslation();

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      aria-labelledby="qr-code-modal-title"
      aria-describedby="qr-code-modal-description"
    >
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <Typography variant="h6" id="qr-code-modal-title">
          {t('survey_list.qr_code_modal_title')}
        </Typography>
        {qrCodeValue && <QRCode value={qrCodeValue} size={256} />}
        <Button variant="contained" onClick={onClose}>
          {t('common.close')}
        </Button>
      </Box>
    </Modal>
  );
};

export default QrCodeModal;

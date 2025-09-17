import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Typography,
} from '@mui/material';
import { ExitToApp as ExitToAppIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

const CheckinsTable = ({ checkins, handleCheckout, isLoadingCheckout }) => {
  const { t } = useTranslation();

  if (!checkins || checkins.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        {t('checkin_dashboard.no_active_checkins')}
      </Typography>
    );
  }

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>{t('checkin_dashboard.table_header_customer')}</TableCell>
            <TableCell>{t('checkin_dashboard.table_header_phone')}</TableCell>
            <TableCell>{t('checkin_dashboard.table_header_email')}</TableCell>
            <TableCell>{t('checkin_dashboard.table_header_checkin_time')}</TableCell>
            <TableCell>{t('checkin_dashboard.table_header_actions')}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {checkins.map((checkin) => (
            <TableRow key={checkin.id}>
              <TableCell>{checkin.customer?.name || t('common.na')}</TableCell>
              <TableCell>{checkin.customer?.phone || t('common.na')}</TableCell>
              <TableCell>{checkin.customer?.email || t('common.na')}</TableCell>
              <TableCell>{new Date(checkin.checkin_time).toLocaleString()}</TableCell>
              <TableCell>
                <Button
                  variant="contained"
                  color="secondary"
                  size="small"
                  startIcon={<ExitToAppIcon />}
                  onClick={() => handleCheckout(checkin.id)}
                  disabled={isLoadingCheckout}
                >
                  {t('checkin_dashboard.checkout_button')}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default CheckinsTable;

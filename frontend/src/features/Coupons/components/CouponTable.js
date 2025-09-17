import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  IconButton,
  Chip,
} from '@mui/material';
import { MoreVert as MoreVertIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const CouponTable = ({ coupons, onMenuOpen, getStatusLabel, getStatusColor }) => {
  const { t } = useTranslation();

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>{t('coupons.table_header_code')}</TableCell>
            <TableCell>{t('coupons.table_header_customer')}</TableCell>
            <TableCell>{t('coupons.table_header_reward')}</TableCell>
            <TableCell>{t('coupons.table_header_status')}</TableCell>
            <TableCell>{t('coupons.table_header_created')}</TableCell>
            <TableCell>{t('coupons.table_header_expires')}</TableCell>
            <TableCell>{t('coupons.table_header_actions')}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {coupons.map((coupon) => (
            <TableRow key={coupon.id}>
              <TableCell>
                <Typography variant="body2" fontFamily="monospace">
                  {coupon.code}
                </Typography>
              </TableCell>
              <TableCell>{coupon.customer?.name || t('common.na')}</TableCell>
              <TableCell>{coupon.reward?.title || t('common.na')}</TableCell>
              <TableCell>
                <Chip
                  label={getStatusLabel(coupon.status)}
                  color={getStatusColor(coupon.status)}
                  size="small"
                />
              </TableCell>
              <TableCell>
                {format(new Date(coupon.createdAt), 'dd/MM/yyyy', { locale: ptBR })}
              </TableCell>
              <TableCell>
                {coupon.expires_at
                  ? format(new Date(coupon.expires_at), 'dd/MM/yyyy', { locale: ptBR })
                  : t('coupons.no_expiration')}
              </TableCell>
              <TableCell>
                <IconButton size="small" onClick={(e) => onMenuOpen(e, coupon)}>
                  <MoreVertIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default CouponTable;

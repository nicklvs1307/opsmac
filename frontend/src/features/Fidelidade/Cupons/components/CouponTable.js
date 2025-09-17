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
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';

const CouponTable = ({ coupons }) => {
  const { t } = useTranslation();

  return (
    <TableContainer component={Paper} elevation={3}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>{t('generated_coupons.table_header.code')}</TableCell>
            <TableCell>{t('generated_coupons.table_header.customer')}</TableCell>
            <TableCell>{t('generated_coupons.table_header.reward_title')}</TableCell>
            <TableCell>{t('generated_coupons.table_header.value')}</TableCell>
            <TableCell>{t('generated_coupons.table_header.type')}</TableCell>
            <TableCell>{t('generated_coupons.table_header.status')}</TableCell>
            <TableCell>{t('generated_coupons.table_header.expires_at')}</TableCell>
            <TableCell>{t('generated_coupons.table_header.generated_at')}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {coupons.length > 0 ? (
            coupons.map((coupon) => (
              <TableRow key={coupon.id}>
                <TableCell>
                  <strong>{coupon.code}</strong>
                </TableCell>
                <TableCell>
                  {coupon.customer ? coupon.customer.name : t('common.anonymous')}
                </TableCell>
                <TableCell>
                  {coupon.reward ? coupon.reward.title : t('generated_coupons.no_reward_title')}
                </TableCell>
                <TableCell>{coupon.value}</TableCell>
                <TableCell>{coupon.reward_type}</TableCell>
                <TableCell>{t(`generated_coupons.status_${coupon.status}`)}</TableCell>
                <TableCell>
                  {coupon.expires_at
                    ? new Date(coupon.expires_at).toLocaleDateString()
                    : t('common.never')}
                </TableCell>
                <TableCell>{new Date(coupon.createdAt).toLocaleDateString()}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={8} align="center">
                {t('generated_coupons.no_coupons_found')}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default CouponTable;

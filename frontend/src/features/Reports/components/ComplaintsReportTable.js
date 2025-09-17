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

const ComplaintsReportTable = ({ reportData }) => {
  const { t } = useTranslation();

  if (!reportData || reportData.length === 0) {
    return <Typography>{t('reports.no_data_found')}</Typography>;
  }

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>{t('reports.table_header.date')}</TableCell>
            <TableCell>{t('reports.table_header.customer_name')}</TableCell>
            <TableCell>{t('reports.table_header.rating')}</TableCell>
            <TableCell>{t('reports.table_header.comment')}</TableCell>
            <TableCell>{t('reports.table_header.status')}</TableCell>
            <TableCell>{t('reports.table_header.priority')}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {reportData.map((row, index) => (
            <TableRow key={index}>
              <TableCell>{format(new Date(row.createdAt), 'dd/MM/yyyy')}</TableCell>
              <TableCell>{row.customer?.name || t('common.anonymous')}</TableCell>
              <TableCell>{row.rating}</TableCell>
              <TableCell>{row.comment}</TableCell>
              <TableCell>{row.status}</TableCell>
              <TableCell>{row.priority}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ComplaintsReportTable;

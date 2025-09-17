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

const SatisfactionReportTable = ({ reportData }) => {
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
            <TableCell>{t('reports.table_header.total_feedbacks')}</TableCell>
            <TableCell>{t('reports.table_header.avg_rating')}</TableCell>
            <TableCell>{t('reports.table_header.excellent')}</TableCell>
            <TableCell>{t('reports.table_header.good')}</TableCell>
            <TableCell>{t('reports.table_header.average')}</TableCell>
            <TableCell>{t('reports.table_header.poor')}</TableCell>
            <TableCell>{t('reports.table_header.terrible')}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {reportData.map((row, index) => (
            <TableRow key={index}>
              <TableCell>{format(new Date(row.date), 'dd/MM/yyyy')}</TableCell>
              <TableCell>{row.totalFeedbacks}</TableCell>
              <TableCell>{row.avgRating?.toFixed(2)}</TableCell>
              <TableCell>{row.excellent}</TableCell>
              <TableCell>{row.good}</TableCell>
              <TableCell>{row.average}</TableCell>
              <TableCell>{row.poor}</TableCell>
              <TableCell>{row.terrible}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default SatisfactionReportTable;

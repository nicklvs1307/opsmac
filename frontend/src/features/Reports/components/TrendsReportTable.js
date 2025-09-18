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

const TrendsReportTable = ({ reportData }) => {
  const { t } = useTranslation();

  if (!reportData || reportData.length === 0) {
    return <Typography>{t('reports.no_data_found')}</Typography>;
  }

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>{t('reports.table_header.week')}</TableCell>
            <TableCell>{t('reports.table_header.total_feedbacks')}</TableCell>
            <TableCell>{t('reports.table_header.avg_rating')}</TableCell>
            <TableCell>{t('reports.table_header.positive_feedbacks')}</TableCell>
            <TableCell>{t('reports.table_header.negative_feedbacks')}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {reportData.map((row, index) => (
            <TableRow key={index}>
              <TableCell>{format(new Date(row.week), 'dd/MM/yyyy')}</TableCell>
              <TableCell>{row.totalFeedbacks}</TableCell>
              <TableCell>{row.avgRating?.toFixed(2)}</TableCell>
              <TableCell>{row.positiveFeedbacks}</TableCell>
              <TableCell>{row.negativeFeedbacks}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default TrendsReportTable;

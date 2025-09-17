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

const CustomersReportTable = ({ reportData }) => {
  const { t } = useTranslation();

  if (!reportData || reportData.length === 0) {
    return <Typography>{t('reports.no_data_found')}</Typography>;
  }

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>{t('reports.table_header.customer_name')}</TableCell>
            <TableCell>{t('reports.table_header.email')}</TableCell>
            <TableCell>{t('reports.table_header.segment')}</TableCell>
            <TableCell>{t('reports.table_header.total_visits')}</TableCell>
            <TableCell>{t('reports.table_header.loyalty_points')}</TableCell>
            <TableCell>{t('reports.table_header.feedback_count')}</TableCell>
            <TableCell>{t('reports.table_header.avg_feedback_rating')}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {reportData.map((row, index) => (
            <TableRow key={index}>
              <TableCell>{row.name}</TableCell>
              <TableCell>{row.email}</TableCell>
              <TableCell>{row.customerSegment}</TableCell>
              <TableCell>{row.totalVisits}</TableCell>
              <TableCell>{row.loyaltyPoints}</TableCell>
              <TableCell>{row.feedbackCount}</TableCell>
              <TableCell>{row.avgFeedbackRating?.toFixed(2)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default CustomersReportTable;

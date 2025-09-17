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

const FeedbackTable = ({ feedbacks }) => {
  const { t } = useTranslation();

  if (!feedbacks || feedbacks.length === 0) {
    return <Typography>{t('satisfaction_analytics.no_feedbacks_found')}</Typography>;
  }

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>{t('satisfaction_analytics.table_header.date')}</TableCell>
            <TableCell>{t('satisfaction_analytics.table_header.customer')}</TableCell>
            <TableCell>{t('satisfaction_analytics.table_header.rating')}</TableCell>
            <TableCell>{t('satisfaction_analytics.table_header.comment')}</TableCell>
            <TableCell>{t('satisfaction_analytics.table_header.survey')}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {feedbacks.map((feedback) => (
            <TableRow key={feedback.id}>
              <TableCell>{format(new Date(feedback.createdAt), 'dd/MM/yyyy HH:mm')}</TableCell>
              <TableCell>{feedback.customer?.name || t('common.anonymous')}</TableCell>
              <TableCell>{feedback.rating}</TableCell>
              <TableCell>{feedback.comment}</TableCell>
              <TableCell>{feedback.survey?.title || t('common.unknown')}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default FeedbackTable;

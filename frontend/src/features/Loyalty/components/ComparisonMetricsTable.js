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

const ComparisonMetricsTable = ({ comparisonData }) => {
  const { t } = useTranslation();

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        {t('surveys_comparison.metrics_table')}
      </Typography>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t('surveys_comparison.survey_title')}</TableCell>
              <TableCell>{t('surveys_comparison.total_responses')}</TableCell>
              <TableCell>{t('surveys_comparison.average_nps')}</TableCell>
              <TableCell>{t('surveys_comparison.average_csat')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {comparisonData.map((data) => (
              <TableRow key={data.surveyId}>
                <TableCell>{data.title}</TableCell>
                <TableCell>{data.totalResponses}</TableCell>
                <TableCell>{data.averageNps?.toFixed(1) || 'N/A'}</TableCell>
                <TableCell>{data.averageCsat?.toFixed(1) || 'N/A'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default ComparisonMetricsTable;

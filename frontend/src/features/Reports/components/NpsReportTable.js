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

const NpsReportTable = ({ reportData }) => {
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
            <TableCell>{t('reports.table_header.total_responses')}</TableCell>
            <TableCell>{t('reports.table_header.promoters')}</TableCell>
            <TableCell>{t('reports.table_header.passives')}</TableCell>
            <TableCell>{t('reports.table_header.detractors')}</TableCell>
            <TableCell>{t('reports.table_header.nps_score')}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {reportData.map((row, index) => (
            <TableRow key={index}>
              <TableCell>{format(new Date(row.date), 'dd/MM/yyyy')}</TableCell>
              <TableCell>{row.totalResponses}</TableCell>
              <TableCell>{row.promoters}</TableCell>
              <TableCell>{row.passives}</TableCell>
              <TableCell>{row.detractors}</TableCell>
              <TableCell>{row.npsScore?.toFixed(0)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default NpsReportTable;

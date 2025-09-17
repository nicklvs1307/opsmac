import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Typography,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

const SegmentTable = ({ segments, handleOpenEditDialog, deleteSegmentMutation, token }) => {
  const { t } = useTranslation();

  if (!segments || segments.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
        {t('segmentation.no_segments_found')}
      </Typography>
    );
  }

  return (
    <TableContainer component={Paper} elevation={3}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>{t('segmentation.table_header.name')}</TableCell>
            <TableCell>{t('segmentation.table_header.description')}</TableCell>
            <TableCell>{t('segmentation.table_header.rules')}</TableCell>
            <TableCell align="right">{t('segmentation.table_header.actions')}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {segments.map((segment) => (
            <TableRow key={segment.id}>
              <TableCell>{segment.name}</TableCell>
              <TableCell>{segment.description}</TableCell>
              <TableCell>{JSON.stringify(segment.rules)}</TableCell> {/* Display rules as JSON */}
              <TableCell align="right">
                <IconButton onClick={() => handleOpenEditDialog(segment)}>
                  <EditIcon />
                </IconButton>
                <IconButton
                  onClick={() => deleteSegmentMutation.mutate({ segmentId: segment.id, token })}
                >
                  <DeleteIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default SegmentTable;

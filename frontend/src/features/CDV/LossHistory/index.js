import React from 'react';
import { useQuery } from 'react-query'; // Import useQuery
import axiosInstance from '@/services/axiosInstance';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Typography,
} from '@mui/material';

const fetchLossHistory = async () => {
  const response = await axiosInstance.get('/labels/loss-history');
  return response.data;
};

const LossHistory = () => {
  const { data: history, isLoading, isError, error } = useQuery('lossHistory', fetchLossHistory);

  if (isLoading) {
    return <CircularProgress />;
  }

  if (isError) {
    return <Alert severity="error">Failed to fetch loss history: {error.message}</Alert>;
  }

  return (
    <>
      <Typography variant="h5" gutterBottom>
        Loss History
      </Typography>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="loss history table">
          <TableHead>
            <TableRow>
              <TableCell>Item Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Registered By</TableCell>
              <TableCell>Loss Date</TableCell>
              <TableCell align="right">Quantity</TableCell>
              <TableCell>Reason</TableCell>
              <TableCell>Notes</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {history.map((record) => (
              <TableRow key={record.id}>
                <TableCell>{record.product?.name || record.ingredient?.name || 'N/A'}</TableCell>
                <TableCell>{record.stockable_type}</TableCell>
                <TableCell>{record.user?.name || 'N/A'}</TableCell>
                <TableCell>{new Date(record.loss_date).toLocaleString()}</TableCell>
                <TableCell align="right">{record.quantity}</TableCell>
                <TableCell>{record.reason}</TableCell>
                <TableCell>{record.notes || '-'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default LossHistory;

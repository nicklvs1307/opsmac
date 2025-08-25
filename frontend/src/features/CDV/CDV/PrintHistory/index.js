import React from 'react';
import { useQuery } from 'react-query'; // Import useQuery
import apiClient from '../../../api/axiosInstance';
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
import toast from 'react-hot-toast'; // Import toast for notifications

const fetchPrintHistory = async () => {
  const response = await apiClient.get('/labels/history');
  return response.data;
};

const PrintHistory = () => {
  const {
    data: history,
    isLoading,
    isError,
    error,
  } = useQuery('printHistory', fetchPrintHistory, {
    onError: (err) => {
      toast.error('Failed to fetch print history.');
      console.error(err);
    },
  });

  if (isLoading) {
    return <CircularProgress />;
  }

  if (isError) {
    return <Alert severity="error">Error: {error.message}</Alert>;
  }

  return (
    <>
      <Typography variant="h5" gutterBottom>
        Print History
      </Typography>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="print history table">
          <TableHead>
            <TableRow>
              <TableCell>Item Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Printed By</TableCell>
              <TableCell>Print Date</TableCell>
              <TableCell>Expiration Date</TableCell>
              <TableCell align="right">Quantity</TableCell>
              <TableCell>Lot Number</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {history.map((record) => (
              <TableRow key={record.id}>
                <TableCell>{record.product?.name || record.ingredient?.name || 'N/A'}</TableCell>
                <TableCell>{record.labelable_type}</TableCell>
                <TableCell>{record.user?.name || 'N/A'}</TableCell>
                <TableCell>{new Date(record.print_date).toLocaleString()}</TableCell>
                <TableCell>{new Date(record.expiration_date).toLocaleString()}</TableCell>
                <TableCell align="right">{record.quantity_printed}</TableCell>
                <TableCell>{record.lot_number || '-'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default PrintHistory;

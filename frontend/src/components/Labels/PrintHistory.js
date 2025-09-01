import React, { useState, useEffect } from 'react';
import apiClient from '@/services/axiosInstance';
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

const PrintHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await apiClient.get('/labels/history');
        setHistory(response.data);
      } catch (err) {
        setError('Failed to fetch print history.');
        console.error(err);
      }
      setLoading(false);
    };

    fetchHistory();
  }, []);

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
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

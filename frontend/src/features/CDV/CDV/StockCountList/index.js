import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query'; // Import useQuery, useMutation, useQueryClient
import apiClient from '@/shared/lib/axiosInstance';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  CircularProgress,
  Alert,
  Typography,
  Box,
} from '@mui/material';
import toast from 'react-hot-toast'; // Import toast for notifications

// Query function for fetching stock counts
const fetchStockCounts = async () => {
  const response = await apiClient.get('/labels/stock-counts');
  return response.data;
};

// Mutation function for starting a new count
const startNewStockCount = async () => {
  const response = await apiClient.post('/labels/stock-counts');
  return response.data;
};

const StockCountList = () => {
  const queryClient = useQueryClient(); // Initialize queryClient

  // Use useQuery for fetching stock counts
  const {
    data: counts,
    isLoading,
    isError,
    error,
  } = useQuery('stockCounts', fetchStockCounts, {
    onError: (err) => {
      toast.error('Failed to fetch stock counts.');
      console.error(err);
    },
  });

  // Use useMutation for starting a new count
  const startNewCountMutation = useMutation(startNewStockCount, {
    onSuccess: () => {
      toast.success('New stock count started successfully!');
      queryClient.invalidateQueries('stockCounts'); // Invalidate and refetch stock counts
    },
    onError: (err) => {
      toast.error('Failed to start a new count.');
      console.error(err);
    },
  });

  const handleStartNewCount = () => {
    startNewCountMutation.mutate(); // Trigger the mutation
  };

  if (isLoading) {
    return <CircularProgress />;
  }

  if (isError) {
    return <Alert severity="error">Error: {error.message}</Alert>;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" gutterBottom>
          Stock Counts
        </Typography>
        <Button
          variant="contained"
          onClick={handleStartNewCount}
          disabled={startNewCountMutation.isLoading}
        >
          {startNewCountMutation.isLoading ? <CircularProgress size={24} /> : 'Start New Count'}
        </Button>
      </Box>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="stock counts table">
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Counted By</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Notes</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {counts.map((count) => (
              <TableRow key={count.id}>
                <TableCell>{new Date(count.count_date).toLocaleString()}</TableCell>
                <TableCell>{count.user?.name || 'N/A'}</TableCell>
                <TableCell>{count.status}</TableCell>
                <TableCell>{count.notes || '-'}</TableCell>
                <TableCell align="center">
                  <Button
                    component={RouterLink}
                    to={`/labels/stock-counts/${count.id}`}
                    variant="outlined"
                    size="small"
                  >
                    View Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default StockCountList;

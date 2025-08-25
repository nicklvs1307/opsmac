import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  TextField,
} from '@mui/material';
import toast from 'react-hot-toast'; // Import toast for notifications

// Query function for fetching stock count details
const fetchStockCountDetails = async (id) => {
  const response = await apiClient.get(`/labels/stock-counts/${id}`);
  return response.data;
};

// Mutation function for saving changes
const saveStockCountChanges = async ({ id, items }) => {
  const response = await apiClient.put(`/labels/stock-counts/${id}`, { items });
  return response.data;
};

// Mutation function for completing the count
const completeStockCount = async (id) => {
  const response = await apiClient.post(`/labels/stock-counts/${id}/complete`);
  return response.data;
};

const StockCountDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient(); // Initialize queryClient

  const [items, setItems] = useState([]);

  // Use useQuery for fetching stock count details
  const {
    data: count,
    isLoading,
    isError,
    error,
  } = useQuery(['stockCountDetails', id], () => fetchStockCountDetails(id), {
    onSuccess: (data) => {
      setItems(data.items || []); // Initialize items state with fetched data
    },
    onError: (err) => {
      toast.error('Failed to fetch stock count details.');
      console.error(err);
    },
  });

  // Use useMutation for saving changes
  const saveChangesMutation = useMutation(saveStockCountChanges, {
    onSuccess: () => {
      toast.success('Changes saved!');
      queryClient.invalidateQueries(['stockCountDetails', id]); // Invalidate to refetch latest data
    },
    onError: (err) => {
      toast.error('Failed to save changes.');
      console.error(err);
    },
  });

  // Use useMutation for completing the count
  const completeCountMutation = useMutation(completeStockCount, {
    onSuccess: () => {
      toast.success('Stock count completed and stock adjusted!');
      queryClient.invalidateQueries('stockCounts'); // Invalidate list of stock counts
      navigate('/labels/stock-counts');
    },
    onError: (err) => {
      toast.error('Failed to complete count.');
      console.error(err);
    },
  });

  const handleQuantityChange = (itemId, newQuantity) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId ? { ...item, counted_quantity: parseInt(newQuantity, 10) || 0 } : item
      )
    );
  };

  const handleSaveChanges = () => {
    saveChangesMutation.mutate({ id, items }); // Trigger the mutation
  };

  const handleCompleteCount = () => {
    completeCountMutation.mutate(id); // Trigger the mutation
  };

  if (isLoading) {
    return <CircularProgress />;
  }

  if (isError) {
    return <Alert severity="error">Error: {error.message}</Alert>;
  }

  if (!count) {
    return <Alert severity="info">Stock count not found.</Alert>;
  }

  const isCompleted = count.status === 'completed';

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Stock Count Details - {new Date(count.count_date).toLocaleDateString()}
      </Typography>
      <Typography variant="body1">Status: {count.status}</Typography>
      <Typography variant="body1" gutterBottom>
        Counted by: {count.user?.name}
      </Typography>

      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Item Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell align="right">System Quantity</TableCell>
              <TableCell align="right">Counted Quantity</TableCell>
              <TableCell align="right">Discrepancy</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.product?.name || item.ingredient?.name}</TableCell>
                <TableCell>{item.stockable_type}</TableCell>
                <TableCell align="right">{item.system_quantity}</TableCell>
                <TableCell align="right">
                  {isCompleted ? (
                    item.counted_quantity
                  ) : (
                    <TextField
                      type="number"
                      size="small"
                      variant="outlined"
                      value={item.counted_quantity ?? ''}
                      onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                      sx={{ width: '100px' }}
                    />
                  )}
                </TableCell>
                <TableCell align="right">
                  {(item.counted_quantity ?? 0) - item.system_quantity}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {!isCompleted && (
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          <Button
            variant="outlined"
            onClick={handleSaveChanges}
            disabled={saveChangesMutation.isLoading}
          >
            {saveChangesMutation.isLoading ? <CircularProgress size={24} /> : 'Save Progress'}
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleCompleteCount}
            disabled={completeCountMutation.isLoading}
          >
            {completeCountMutation.isLoading ? (
              <CircularProgress size={24} />
            ) : (
              'Complete and Adjust Stock'
            )}
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default StockCountDetail;

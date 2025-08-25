import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query'; // Import useQuery, useMutation, useQueryClient
import apiClient from '@/shared/lib/axiosInstance';
import {
  Box,
  Button,
  CircularProgress,
  Alert,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import toast from 'react-hot-toast'; // Import toast for notifications

// Query function for fetching items
const fetchStockableItems = async () => {
  const response = await apiClient.get('/labels/items');
  return response.data;
};

// Mutation function for creating production record
const createProductionRecord = async (payload) => {
  const response = await apiClient.post('/labels/productions', payload);
  return response.data;
};

const ProductionCreate = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient(); // Initialize queryClient

  const [producedItemId, setProducedItemId] = useState('');
  const [producedItemType, setProducedItemType] = useState('');
  const [producedQuantity, setProducedQuantity] = useState(0);
  const [inputs, setInputs] = useState([]); // Array of { stockable_id, stockable_type, quantity }
  const [notes, setNotes] = useState('');

  // Use useQuery for fetching stockable items
  const {
    data: items,
    isLoading: loadingItems,
    isError: errorItems,
    error: itemsError,
  } = useQuery('stockableItems', fetchStockableItems, {
    onError: (err) => {
      toast.error('Failed to load items.');
      console.error(err);
    },
  });

  // Use useMutation for creating production record
  const createProductionMutation = useMutation(createProductionRecord, {
    onSuccess: () => {
      toast.success('Production record created successfully!');
      queryClient.invalidateQueries('productionRecords'); // Invalidate and refetch production records
      navigate('/labels/productions');
    },
    onError: (err) => {
      toast.error('Failed to create production record.');
      console.error(err);
    },
  });

  const handleAddInput = () => {
    setInputs([...inputs, { stockable_id: '', stockable_type: '', quantity: 0 }]);
  };

  const handleInputChange = (index, field, value) => {
    const newInputs = [...inputs];
    if (field === 'stockable_id') {
      const selectedItem = items.find((item) => item.id === value);
      newInputs[index] = {
        ...newInputs[index],
        stockable_id: value,
        stockable_type: selectedItem ? selectedItem.type : '',
      };
    } else {
      newInputs[index] = { ...newInputs[index], [field]: value };
    }
    setInputs(newInputs);
  };

  const handleRemoveInput = (index) => {
    const newInputs = inputs.filter((_, i) => i !== index);
    setInputs(newInputs);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      produced_item_id: producedItemId,
      produced_item_type: producedItemType,
      produced_quantity: parseFloat(producedQuantity),
      inputs: inputs.map((input) => ({ ...input, quantity: parseFloat(input.quantity) })),
      notes,
    };
    createProductionMutation.mutate(payload); // Trigger the mutation
  };

  if (loadingItems) {
    return <CircularProgress />;
  }

  if (errorItems) {
    return <Alert severity="error">Error: {itemsError.message}</Alert>;
  }

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Create New Production Record
      </Typography>

      {createProductionMutation.isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {createProductionMutation.error.message}
        </Alert>
      )}

      <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Produced Item (Output)
        </Typography>
        <FormControl fullWidth margin="normal">
          <InputLabel>Produced Item</InputLabel>
          <Select
            value={producedItemId}
            label="Produced Item"
            onChange={(e) => {
              const selectedItem = items.find((item) => item.id === e.target.value);
              setProducedItemId(e.target.value);
              setProducedItemType(selectedItem ? selectedItem.type : '');
            }}
            required
          >
            {items.map((item) => (
              <MenuItem key={item.id} value={item.id}>
                {item.name} ({item.type})
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          label="Produced Quantity"
          type="number"
          fullWidth
          margin="normal"
          value={producedQuantity}
          onChange={(e) => setProducedQuantity(e.target.value)}
          required
          inputProps={{ step: '0.001' }}
        />
      </Paper>

      <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Input Items (Consumed)
        </Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Item</TableCell>
              <TableCell>Quantity</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {inputs.map((input, index) => (
              <TableRow key={index}>
                <TableCell>
                  <FormControl fullWidth size="small">
                    <Select
                      value={input.stockable_id}
                      onChange={(e) => handleInputChange(index, 'stockable_id', e.target.value)}
                      required
                    >
                      {items.map((item) => (
                        <MenuItem key={item.id} value={item.id}>
                          {item.name} ({item.type})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </TableCell>
                <TableCell>
                  <TextField
                    type="number"
                    size="small"
                    value={input.quantity}
                    onChange={(e) => handleInputChange(index, 'quantity', e.target.value)}
                    required
                    inputProps={{ step: '0.001' }}
                  />
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleRemoveInput(index)} color="error">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Button startIcon={<AddIcon />} onClick={handleAddInput} sx={{ mt: 2 }}>
          Add Input Item
        </Button>
      </Paper>

      <TextField
        label="Notes"
        multiline
        rows={3}
        fullWidth
        margin="normal"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button type="submit" variant="contained" disabled={createProductionMutation.isLoading}>
          {createProductionMutation.isLoading ? (
            <CircularProgress size={24} />
          ) : (
            'Create Production Record'
          )}
        </Button>
      </Box>
    </Box>
  );
};

export default ProductionCreate;

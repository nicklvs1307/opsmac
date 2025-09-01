import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query'; // Import useQuery, useMutation, useQueryClient
import apiClient from '@/services/axiosInstance';
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
} from '@mui/material';
import EditLabelItemModal from './components/EditLabelItemModal';
import toast from 'react-hot-toast'; // Import toast for notifications

// Query function for fetching items
const fetchLabelItems = async () => {
  const response = await apiClient.get('/labels/items');
  return response.data;
};

// Mutation function for updating items
const updateLabelItem = async (updatedItem) => {
  const response = await apiClient.patch(
    `/labels/items/${updatedItem.type}/${updatedItem.id}`,
    updatedItem
  );
  return response.data;
};

const ManageLabelItems = () => {
  const queryClient = useQueryClient(); // Initialize queryClient
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Use useQuery for fetching items
  const {
    data: items,
    isLoading,
    isError,
    error,
  } = useQuery('labelItems', fetchLabelItems, {
    onError: (err) => {
      toast.error('Failed to fetch items.');
      console.error(err);
    },
  });

  // Use useMutation for updating items
  const updateItemMutation = useMutation(updateLabelItem, {
    onSuccess: () => {
      toast.success('Item updated successfully!');
      queryClient.invalidateQueries('labelItems'); // Invalidate and refetch items after successful update
      handleCloseModal();
    },
    onError: (err) => {
      toast.error('Failed to update item.');
      console.error('Failed to update item', err);
    },
  });

  const handleOpenModal = (item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
  };

  const handleSave = (updatedItem) => {
    updateItemMutation.mutate(updatedItem); // Trigger the mutation
  };

  if (isLoading) {
    return <CircularProgress />;
  }

  if (isError) {
    return <Alert severity="error">Error: {error.message}</Alert>;
  }

  return (
    <>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell align="right">Default Expiration (Days)</TableCell>
              <TableCell>Default Status</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item) => (
              <TableRow key={`${item.type}-${item.id}`}>
                <TableCell component="th" scope="row">
                  {item.name}
                </TableCell>
                <TableCell>{item.type}</TableCell>
                <TableCell align="right">{item.default_expiration_days || 'Not set'}</TableCell>
                <TableCell>{item.default_label_status || 'Not set'}</TableCell>
                <TableCell align="center">
                  <Button variant="contained" size="small" onClick={() => handleOpenModal(item)}>
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <EditLabelItemModal
        open={isModalOpen}
        onClose={handleCloseModal}
        item={selectedItem}
        onSave={handleSave}
      />
    </>
  );
};

export default ManageLabelItems;

import React, { useState, useEffect } from 'react';
import apiClient from '../../api/axiosInstance';
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
import EditLabelItemModal from './EditLabelItemModal';

const ManageLabelItems = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const fetchItems = async () => {
    try {
      const response = await apiClient.get('/labels/items');
      setItems(response.data);
    } catch (err) {
      setError('Failed to fetch items.');
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleOpenModal = (item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
  };

  const handleSave = async (updatedItem) => {
    try {
      const response = await apiClient.patch(
        `/labels/items/${updatedItem.type}/${updatedItem.id}`,
        updatedItem
      );
      // Update the item in the local state
      setItems(
        items.map((item) =>
          item.id === updatedItem.id && item.type === updatedItem.type ? response.data : item
        )
      );
      handleCloseModal();
    } catch (err) {
      console.error('Failed to update item', err);
      // You could set an error state for the modal here
    }
  };

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
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

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/axiosInstance';
import {
    Box, Button, CircularProgress, Alert, Typography, TextField, FormControl, InputLabel, Select, MenuItem, IconButton, Paper, Table, TableHead, TableRow, TableCell, TableBody
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';

const ProductionCreate = () => {
    const navigate = useNavigate();
    const [items, setItems] = useState([]); // All stockable items (products/ingredients)
    const [loadingItems, setLoadingItems] = useState(true);
    const [errorItems, setErrorItems] = useState(null);

    const [producedItemId, setProducedItemId] = useState('');
    const [producedItemType, setProducedItemType] = useState('');
    const [producedQuantity, setProducedQuantity] = useState(0);
    const [inputs, setInputs] = useState([]); // Array of { stockable_id, stockable_type, quantity }
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState(null);

    useEffect(() => {
        const fetchItems = async () => {
            try {
                const response = await apiClient.get('/labels/items');
                setItems(response.data);
            } catch (err) {
                setErrorItems('Failed to load items.');
                console.error(err);
            }
            setLoadingItems(false);
        };
        fetchItems();
    }, []);

    const handleAddInput = () => {
        setInputs([...inputs, { stockable_id: '', stockable_type: '', quantity: 0 }]);
    };

    const handleInputChange = (index, field, value) => {
        const newInputs = [...inputs];
        if (field === 'stockable_id') {
            const selectedItem = items.find(item => item.id === value);
            newInputs[index] = { ...newInputs[index], stockable_id: value, stockable_type: selectedItem ? selectedItem.type : '' };
        } else {
            newInputs[index] = { ...newInputs[index], [field]: value };
        }
        setInputs(newInputs);
    };

    const handleRemoveInput = (index) => {
        const newInputs = inputs.filter((_, i) => i !== index);
        setInputs(newInputs);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitError(null);

        try {
            const payload = {
                produced_item_id: producedItemId,
                produced_item_type: producedItemType,
                produced_quantity: parseFloat(producedQuantity),
                inputs: inputs.map(input => ({ ...input, quantity: parseFloat(input.quantity) })),
                notes,
            };
            await apiClient.post('/labels/productions', payload);
            alert('Production record created successfully!'); // Replace with toast
            navigate('/labels/productions');
        } catch (err) {
            setSubmitError('Failed to create production record.');
            console.error(err);
        }
        setIsSubmitting(false);
    };

    if (loadingItems) {
        return <CircularProgress />;
    }

    if (errorItems) {
        return <Alert severity="error">{errorItems}</Alert>;
    }

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>Create New Production Record</Typography>

            {submitError && <Alert severity="error" sx={{ mb: 2 }}>{submitError}</Alert>}

            <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
                <Typography variant="h6" gutterBottom>Produced Item (Output)</Typography>
                <FormControl fullWidth margin="normal">
                    <InputLabel>Produced Item</InputLabel>
                    <Select
                        value={producedItemId}
                        label="Produced Item"
                        onChange={(e) => {
                            const selectedItem = items.find(item => item.id === e.target.value);
                            setProducedItemId(e.target.value);
                            setProducedItemType(selectedItem ? selectedItem.type : '');
                        }}
                        required
                    >
                        {items.map(item => (
                            <MenuItem key={item.id} value={item.id}>{item.name} ({item.type})</MenuItem>
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
                    inputProps={{ step: "0.001" }}
                />
            </Paper>

            <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
                <Typography variant="h6" gutterBottom>Input Items (Consumed)</Typography>
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
                                            {items.map(item => (
                                                <MenuItem key={item.id} value={item.id}>{item.name} ({item.type})</MenuItem>
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
                                        inputProps={{ step: "0.001" }}
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
                <Button type="submit" variant="contained" disabled={isSubmitting}>
                    {isSubmitting ? <CircularProgress size={24} /> : 'Create Production Record'}
                </Button>
            </Box>
        </Box>
    );
};

export default ProductionCreate;

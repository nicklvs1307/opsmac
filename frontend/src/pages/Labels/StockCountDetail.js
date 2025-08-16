import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../api/axiosInstance';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, CircularProgress, Alert, Typography, Box, TextField
} from '@mui/material';

const StockCountDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [count, setCount] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [items, setItems] = useState([]);

    useEffect(() => {
        const fetchCount = async () => {
            try {
                const response = await apiClient.get(`/labels/stock-counts/${id}`);
                setCount(response.data);
                setItems(response.data.items || []);
            } catch (err) {
                setError('Failed to fetch stock count details.');
                console.error(err);
            }
            setLoading(false);
        };

        fetchCount();
    }, [id]);

    const handleQuantityChange = (itemId, newQuantity) => {
        setItems(items.map(item => 
            item.id === itemId ? { ...item, counted_quantity: parseInt(newQuantity, 10) || 0 } : item
        ));
    };

    const handleSaveChanges = async () => {
        try {
            await apiClient.put(`/labels/stock-counts/${id}`, { items });
            alert('Changes saved!'); // Replace with better notification
        } catch (err) {
            setError('Failed to save changes.');
            console.error(err);
        }
    };

    const handleCompleteCount = async () => {
        try {
            await apiClient.post(`/labels/stock-counts/${id}/complete`);
            alert('Stock count completed and stock adjusted!');
            navigate('/labels/stock-counts');
        } catch (err) {
            setError('Failed to complete count.');
            console.error(err);
        }
    };

    if (loading) {
        return <CircularProgress />;
    }

    if (error) {
        return <Alert severity="error">{error}</Alert>;
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
            <Typography variant="body1" gutterBottom>Counted by: {count.user?.name}</Typography>

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
                                            value={item.counted_quantity || ''}
                                            onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                                            sx={{ width: '100px' }}
                                        />
                                    )}
                                </TableCell>
                                <TableCell align="right">{(item.counted_quantity ?? 0) - item.system_quantity}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {!isCompleted && (
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                    <Button variant="outlined" onClick={handleSaveChanges}>Save Progress</Button>
                    <Button variant="contained" color="primary" onClick={handleCompleteCount}>
                        Complete and Adjust Stock
                    </Button>
                </Box>
            )}
        </Box>
    );
};

export default StockCountDetail;

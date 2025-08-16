import React, { useState, useEffect } from 'react';
import apiClient from 'api/axiosInstance';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress, Alert, Typography
} from '@mui/material';

const LossHistory = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const response = await apiClient.get('/labels/loss-history');
                setHistory(response.data);
            } catch (err) {
                setError('Failed to fetch loss history.');
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
            <Typography variant="h5" gutterBottom>Loss History</Typography>
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

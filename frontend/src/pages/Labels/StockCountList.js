import React, { useState, useEffect } from 'react';
import apiClient from '../../api/axiosInstance';
import { Link as RouterLink } from 'react-router-dom';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, CircularProgress, Alert, Typography, Box
} from '@mui/material';

const StockCountList = () => {
    const [counts, setCounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchCounts = async () => {
        setLoading(true);
        try {
            const response = await apiClient.get('/labels/stock-counts');
            setCounts(response.data);
        } catch (err) {
            setError('Failed to fetch stock counts.');
            console.error(err);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchCounts();
    }, []);

    const handleStartNewCount = async () => {
        try {
            // This will create a new count and refresh the list
            await apiClient.post('/labels/stock-counts');
            fetchCounts();
        } catch (err) {
            setError('Failed to start a new count.');
            console.error(err);
        }
    };

    if (loading) {
        return <CircularProgress />;
    }

    if (error) {
        return <Alert severity="error">{error}</Alert>;
    }

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5" gutterBottom>
                    Stock Counts
                </Typography>
                <Button variant="contained" onClick={handleStartNewCount}>
                    Start New Count
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
                                    <Button component={RouterLink} to={`/labels/stock-counts/${count.id}`} variant="outlined" size="small">
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

import React, { useState, useEffect } from 'react';
import apiClient from 'api/axiosInstance';
import { Link as RouterLink } from 'react-router-dom';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, CircularProgress, Alert, Typography, Box
} from '@mui/material';

const ProductionList = () => {
    const [productions, setProductions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchProductions = async () => {
        setLoading(true);
        try {
            const response = await apiClient.get('/labels/productions');
            setProductions(response.data);
        } catch (err) {
            setError('Failed to fetch production records.');
            console.error(err);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchProductions();
    }, []);

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
                    Production Records
                </Typography>
                <Button variant="contained" component={RouterLink} to="/labels/productions/new">
                    Create New Production
                </Button>
            </Box>
            <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label="production records table">
                    <TableHead>
                        <TableRow>
                            <TableCell>Date</TableCell>
                            <TableCell>Produced By</TableCell>
                            <TableCell>Notes</TableCell>
                            <TableCell align="center">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {productions.map((record) => (
                            <TableRow key={record.id}>
                                <TableCell>{new Date(record.production_date).toLocaleString()}</TableCell>
                                <TableCell>{record.user?.name || 'N/A'}</TableCell>
                                <TableCell>{record.notes || '-'}</TableCell>
                                <TableCell align="center">
                                    <Button component={RouterLink} to={`/labels/productions/${record.id}`} variant="outlined" size="small">
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

export default ProductionList;

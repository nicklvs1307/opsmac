import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useProductionRecords } from '@/features/ValidityControl/api/productionService'; // Import useProductionRecords
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

const ProductionList = () => {
  const {
    data: productions,
    isLoading,
    isError,
    error,
  } = useProductionRecords({
    onError: (err) => {
      toast.error('Failed to fetch production records.');
      console.error(err);
    },
  });

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
            {productions?.map((record) => (
              <TableRow key={record.id}>
                <TableCell>{new Date(record.production_date).toLocaleString()}</TableCell>
                <TableCell>{record.user?.name || 'N/A'}</TableCell>
                <TableCell>{record.notes || '-'}</TableCell>
                <TableCell align="center">
                  <Button
                    component={RouterLink}
                    to={`/labels/productions/${record.id}`}
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

export default ProductionList;

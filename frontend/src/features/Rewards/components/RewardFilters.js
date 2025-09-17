import React from 'react';
import {
  Paper,
  Typography,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem as SelectMenuItem,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const RewardFilters = ({ filters, onFilterChange }) => {
  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Filtros
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Buscar"
            value={filters.search}
            onChange={(e) => onFilterChange('search', e.target.value)}
            placeholder="Nome ou descrição..."
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />,
            }}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <FormControl fullWidth>
            <InputLabel>Tipo</InputLabel>
            <Select
              value={filters.type}
              label="Tipo"
              onChange={(e) => onFilterChange('type', e.target.value)}
            >
              <SelectMenuItem value="">Todos</SelectMenuItem>
              <SelectMenuItem value="discount">Desconto</SelectMenuItem>
              <SelectMenuItem value="free_item">Item Grátis</SelectMenuItem>
              <SelectMenuItem value="points">Pontos</SelectMenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={3}>
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={filters.status}
              label="Status"
              onChange={(e) => onFilterChange('status', e.target.value)}
            >
              <SelectMenuItem value="">Todos</SelectMenuItem>
              <SelectMenuItem value="active">Ativo</SelectMenuItem>
              <SelectMenuItem value="inactive">Inativo</SelectMenuItem>
              <SelectMenuItem value="expired">Expirado</SelectMenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default RewardFilters;

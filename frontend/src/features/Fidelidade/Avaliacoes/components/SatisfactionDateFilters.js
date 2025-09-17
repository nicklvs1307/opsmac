import React from 'react';
import { Box, Grid, Paper, TextField, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';

const SatisfactionDateFilters = ({ startDate, setStartDate, endDate, setEndDate, onApplyFilters }) => {
  const { t } = useTranslation();

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} md={5}>
          <TextField
            label={t('common.start_date')}
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} md={5}>
          <TextField
            label={t('common.end_date')}
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} md={2}>
          <Button variant="contained" fullWidth onClick={onApplyFilters}>
            {t('common.apply_filters')}
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default SatisfactionDateFilters;

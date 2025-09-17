import React from 'react';
import { Box, TextField } from '@mui/material';
import { Controller } from 'react-hook-form';

const ColorPickerField = ({ control, name, label, helperText }) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <TextField
            {...field}
            label={label}
            fullWidth
            margin="normal"
            type="color"
            helperText={helperText}
            InputLabelProps={{ shrink: true }}
            sx={{ flexGrow: 1 }}
          />
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '4px',
              backgroundColor: field.value || 'transparent',
              border: '1px solid #ccc',
            }}
          />
        </Box>
      )}
    />
  );
};

export default ColorPickerField;

import React from 'react';
import { FormControlLabel, Switch } from '@mui/material';
import { Controller } from 'react-hook-form';

const ToggleSwitchField = ({ control, name, label }) => {
  return (
    <FormControlLabel
      control={
        <Controller
          name={name}
          control={control}
          render={({ field }) => (
            <Switch
              {...field}
              checked={field.value}
              onChange={(e) => field.onChange(e.target.checked)}
            />
          )}
        />
      }
      label={label}
    />
  );
};

export default ToggleSwitchField;

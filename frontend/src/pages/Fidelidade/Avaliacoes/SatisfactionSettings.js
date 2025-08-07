import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, TextField, Button, List, ListItem, ListItemText, IconButton, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, Grid } from '@mui/material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useForm, Controller } from 'react-hook-form';
import axiosInstance from '../../../api/axiosInstance';
import toast from 'react-hot-toast';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAuth } from '../../../contexts/AuthContext'; // Import useAuth

// ... (API functions remain the same)

const SatisfactionSettings = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth(); // Get user from context
  const restaurantId = user?.restaurants?.[0]?.id;

  const [newCriterionName, setNewCriterionName] = useState('');
  const [editCriterion, setEditCriterion] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      background_color: '#ffffff',
      text_color: '#000000',
      primary_color: '#3f51b5',
      background_image_url: '',
    }
  });

  // Fetch existing settings
  useEffect(() => {
    if (restaurantId) {
      axiosInstance.get(`/api/settings/${restaurantId}`)
        .then(response => {
          const settings = response.data.settings?.survey_program_settings;
          if (settings) {
            reset(settings);
          }
        })
        .catch(err => console.error('Failed to fetch settings:', err));
    }
  }, [restaurantId, reset]);

  const { data: criteria, isLoading, isError } = useQuery('npsCriteria', fetchNpsCriteria);

  const onSettingsSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      await axiosInstance.put(`/api/settings/${restaurantId}`, {
        settings: {
          survey_program_settings: data
        }
      });
      toast.success('Configurações de personalização salvas com sucesso!');
    } catch (error) {
      toast.error(error.response?.data?.msg || 'Erro ao salvar as configurações.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ... (mutations for criteria remain the same)

  return (
    <Box p={3}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          Personalização da Página de Pesquisa
        </Typography>
        <form onSubmit={handleSubmit(onSettingsSubmit)}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Controller
                name="background_color"
                control={control}
                render={({ field }) => <TextField {...field} label="Cor de Fundo" fullWidth />}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="text_color"
                control={control}
                render={({ field }) => <TextField {...field} label="Cor do Texto" fullWidth />}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="primary_color"
                control={control}
                render={({ field }) => <TextField {...field} label="Cor de Destaque" fullWidth />}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="background_image_url"
                control={control}
                render={({ field }) => <TextField {...field} label="URL da Imagem de Fundo" fullWidth />}
              />
            </Grid>
          </Grid>
          <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }} disabled={isSubmitting}>
            {isSubmitting ? <CircularProgress size={24} /> : 'Salvar Personalização'}
          </Button>
        </form>
      </Paper>

      <Paper sx={{ p: 3 }}>
        {/* ... (rest of the component for NPS criteria) */}
      </Paper>

      {/* ... (dialog for editing criteria) */}
    </Box>
  );
};

export default SatisfactionSettings;
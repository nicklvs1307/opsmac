import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, TextField, Button, List, ListItem, ListItemText, IconButton, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, Grid } from '@mui/material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useForm, Controller } from 'react-hook-form';
import axiosInstance from '../../../api/axiosInstance';
import toast from 'react-hot-toast';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAuth } from '../../../contexts/AuthContext';

// Funções da API
const fetchNpsCriteria = async () => {
  const { data } = await axiosInstance.get('/api/nps-criteria');
  return data;
};

const createNpsCriterion = (name) => {
  return axiosInstance.post('/api/nps-criteria', { name });
};

const updateNpsCriterion = ({ id, name }) => {
  return axiosInstance.put(`/api/nps-criteria/${id}`, { name });
};

const deleteNpsCriterion = (id) => {
  return axiosInstance.delete(`/api/nps-criteria/${id}`);
};

const SatisfactionSettings = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const restaurantId = user?.restaurants?.[0]?.id;

  const [newCriterionName, setNewCriterionName] = useState('');
  const [editCriterion, setEditCriterion] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmittingSettings, setIsSubmittingSettings] = useState(false);

  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      background_color: '#ffffff',
      text_color: '#000000',
      primary_color: '#3f51b5',
      background_image_url: '',
    }
  });

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
      setIsSubmittingSettings(true);
      await axiosInstance.put(`/api/settings/${restaurantId}`, {
        settings: {
          survey_program_settings: data
        }
      });
      toast.success('Configurações de personalização salvas com sucesso!');
    } catch (error) {
      toast.error(error.response?.data?.msg || 'Erro ao salvar as configurações.');
    } finally {
      setIsSubmittingSettings(false);
    }
  };

  const mutationOptions = {
    onSuccess: () => {
      queryClient.invalidateQueries('npsCriteria');
      setIsSubmitting(false);
      setNewCriterionName('');
      setEditCriterion(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.msg || 'Ocorreu um erro.');
      setIsSubmitting(false);
    },
  };

  const createMutation = useMutation(createNpsCriterion, {
    ...mutationOptions,
    onSuccess: () => {
      toast.success('Critério criado com sucesso!');
      mutationOptions.onSuccess();
    },
  });

  const updateMutation = useMutation(updateNpsCriterion, {
    ...mutationOptions,
    onSuccess: () => {
      toast.success('Critério atualizado com sucesso!');
      mutationOptions.onSuccess();
    },
  });

  const deleteMutation = useMutation(deleteNpsCriterion, {
    ...mutationOptions,
    onSuccess: () => {
      toast.success('Critério excluído com sucesso!');
      mutationOptions.onSuccess();
    },
  });

  const handleCriterionSubmit = (e) => {
    e.preventDefault();
    if (!newCriterionName.trim()) {
      toast.error('O nome do critério não pode estar vazio.');
      return;
    }
    setIsSubmitting(true);
    createMutation.mutate(newCriterionName);
  };

  const handleUpdate = () => {
    if (!editCriterion || !editCriterion.name.trim()) {
        toast.error('O nome do critério não pode estar vazio.');
        return;
    }
    setIsSubmitting(true);
    updateMutation.mutate({ id: editCriterion.id, name: editCriterion.name });
  };

  const handleDelete = (id) => {
    if (window.confirm('Tem certeza que deseja excluir este critério?')) {
      deleteMutation.mutate(id);
    }
  };

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
          <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }} disabled={isSubmittingSettings}>
            {isSubmittingSettings ? <CircularProgress size={24} /> : 'Salvar Personalização'}
          </Button>
        </form>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Configurar Critérios de NPS
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Adicione ou remova os critérios que serão usados nas suas pesquisas de NPS. 
          Exemplos: Atendimento, Comida, Ambiente, Custo-Benefício.
        </Typography>

        <Box component="form" onSubmit={handleCriterionSubmit} sx={{ display: 'flex', gap: 2, mb: 4 }}>
          <TextField
            fullWidth
            label="Novo Critério de NPS"
            value={newCriterionName}
            onChange={(e) => setNewCriterionName(e.target.value)}
            variant="outlined"
            disabled={isSubmitting}
          />
          <Button type="submit" variant="contained" color="primary" disabled={isSubmitting}>
            {isSubmitting ? <CircularProgress size={24} /> : 'Adicionar'}
          </Button>
        </Box>

        {isLoading ? (
          <CircularProgress />
        ) : isError ? (
          <Typography color="error">Erro ao carregar critérios.</Typography>
        ) : (
          <List>
            {criteria?.map((criterion) => (
              <ListItem key={criterion.id} secondaryAction={
                <Box>
                  <IconButton edge="end" aria-label="edit" onClick={() => setEditCriterion(criterion)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton edge="end" aria-label="delete" onClick={() => handleDelete(criterion.id)} sx={{ ml: 1 }}>
                    <DeleteIcon />
                  </IconButton>
                </Box>
              }>
                <ListItemText primary={criterion.name} />
              </ListItem>
            ))}
          </List>
        )}
      </Paper>

      <Dialog open={!!editCriterion} onClose={() => setEditCriterion(null)} fullWidth maxWidth="sm">
        <DialogTitle>Editar Critério</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nome do Critério"
            type="text"
            fullWidth
            variant="standard"
            value={editCriterion?.name || ''}
            onChange={(e) => setEditCriterion({ ...editCriterion, name: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditCriterion(null)}>Cancelar</Button>
          <Button onClick={handleUpdate} disabled={isSubmitting}>
            {isSubmitting ? <CircularProgress size={24} /> : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SatisfactionSettings;
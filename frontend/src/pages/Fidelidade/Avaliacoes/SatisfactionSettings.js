import React, { useState } from 'react';
import { Box, Typography, Paper, TextField, Button, List, ListItem, ListItemText, IconButton, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import axiosInstance from '../../../api/axiosInstance';
import toast from 'react-hot-toast';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

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
  const [newCriterionName, setNewCriterionName] = useState('');
  const [editCriterion, setEditCriterion] = useState(null); // { id, name }
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: criteria, isLoading, isError } = useQuery('npsCriteria', fetchNpsCriteria);

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

  const handleSubmit = (e) => {
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
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Configurar Critérios de NPS
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Adicione ou remova os critérios que serão usados nas suas pesquisas de NPS. 
          Exemplos: Atendimento, Comida, Ambiente, Custo-Benefício.
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', gap: 2, mb: 4 }}>
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

      {/* Modal de Edição */}
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
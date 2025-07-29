
import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Paper, CircularProgress, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, TextField, Grid } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import BarChartIcon from '@mui/icons-material/BarChart';
import QrCodeIcon from '@mui/icons-material/QrCode';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import SearchIcon from '@mui/icons-material/Search';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import axiosInstance from '../../api/axiosInstance';
import toast from 'react-hot-toast';

const fetchSurveys = async (filters) => {
  const { data } = await axiosInstance.get('/surveys', { params: filters });
  return data;
};

const deleteSurvey = async (id) => {
  await axiosInstance.delete(`/api/surveys/${id}`);
};

const SurveyList = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({
    search: '',
  });

  const { data: surveys, isLoading, error, refetch } = useQuery(['surveys', filters], () => fetchSurveys(filters));

  const deleteMutation = useMutation(deleteSurvey, {
    onSuccess: () => {
      queryClient.invalidateQueries('surveys');
      toast.success('Pesquisa apagada com sucesso!');
    },
    onError: (err) => {
      toast.error(`Erro ao apagar pesquisa: ${err.response.data.msg || err.message}`);
    },
  });

  const handleDelete = (id) => {
    if (window.confirm('Tem certeza que deseja apagar esta pesquisa? Esta ação é irreversível.')) {
      deleteMutation.mutate(id);
    }
  };

  const handleCopyLink = (surveyId) => {
    const publicLink = `${window.location.origin}/public/surveys/${surveyId}`;
    navigator.clipboard.writeText(publicLink)
      .then(() => {
        toast.success('Link copiado para a área de transferência!');
      })
      .catch((err) => {
        toast.error('Erro ao copiar o link.');
        console.error('Erro ao copiar o link:', err);
      });
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    refetch();
  }, [filters, refetch]);

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Pesquisas</Typography>
        <Button
          variant="contained"
          component={RouterLink}
          to="/surveys/new"
          startIcon={<AddIcon />}
        >
          Nova Pesquisa
        </Button>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Filtros
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Buscar"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Buscar por título..."
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />,
              }}
            />
          </Grid>
        </Grid>
      </Paper>

      <Paper elevation={3} sx={{ p: 3 }}>
        {isLoading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">Erro ao carregar pesquisas: {error.message}</Alert>
        ) : (
          <TableContainer sx={{ overflowX: 'auto' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Título</TableCell>
                  <TableCell>Tipo</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {surveys.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      Nenhuma pesquisa encontrada.
                    </TableCell>
                  </TableRow>
                ) : (
                  surveys.map((survey) => (
                    <TableRow key={survey.id}>
                      <TableCell>{survey.title}</TableCell>
                      <TableCell>{survey.type}</TableCell>
                      <TableCell>{survey.status}</TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                          <IconButton component={RouterLink} to={`/surveys/${survey.id}/results`} color="primary" aria-label="Ver Resultados">
                            <BarChartIcon />
                          </IconButton>
                          <IconButton component={RouterLink} to={`/surveys/edit/${survey.id}`} color="info" aria-label="Editar Pesquisa">
                            <EditIcon />
                          </IconButton>
                          <IconButton color="secondary" aria-label="Gerar QR Code" onClick={() => toast('Funcionalidade de QR Code em breve!', { icon: '💡' })}> {/* Placeholder for QR Code */}
                            <QrCodeIcon />
                          </IconButton>
                          <IconButton color="default" aria-label="Copiar Link" onClick={() => handleCopyLink(survey.id)}>
                            <ContentCopyIcon />
                          </IconButton>
                          <IconButton color="error" aria-label="Apagar Pesquisa" onClick={() => handleDelete(survey.id)}>
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Box>
  );
};

export default SurveyList;

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Rating,
  Grid,
  Autocomplete,
  Chip,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import axiosInstance from '../../api/axiosInstance';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';

const NewFeedback = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const restaurantId = user?.restaurants?.[0]?.id; // Obter restaurantId do usuário logado
  console.log('Restaurant ID in NewFeedback.js:', restaurantId);
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [qrCodes, setQrCodes] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      customer_id: null,
      qr_code_id: null,
      rating: 5,
      comment: '',
      feedback_type: 'compliment',
      source: 'manual',
      table_number: '',
      visit_date: new Date().toISOString().split('T')[0],
    },
  });

  const watchRating = watch('rating');

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    // Auto-detect feedback type based on rating
    if (watchRating >= 4) {
      setValue('feedback_type', 'compliment');
    } else if (watchRating === 3) {
      setValue('feedback_type', 'suggestion');
    } else {
      setValue('feedback_type', 'complaint');
    }
  }, [watchRating, setValue]);

  const fetchInitialData = async () => {
    try {
      setLoadingData(true);
      
      const [customersResponse, qrCodesResponse] = await Promise.all([
        axiosInstance.get('/api/customers'),
        restaurantId ? axiosInstance.get(`/api/qrcode/restaurant/${restaurantId}`) : Promise.resolve({ data: { qrcodes: [] } }),
      ]);
      
      setCustomers(customersResponse.data.customers || []);
      setQrCodes(qrCodesResponse.data.qrcodes || []);
    } catch (err) {
      console.error('Error fetching initial data:', err);
      toast.error('Erro ao carregar dados iniciais');
    } finally {
      setLoadingData(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      
      // Remove null values
      const cleanData = Object.fromEntries(
        Object.entries(data).filter(([key, value]) => {
          // Não enviar customer_id ou qr_code_id se forem nulos
          if ((key === 'customer_id' || key === 'qr_code_id') && value === null) {
            return false;
          }
          return value !== null && value !== '';
        })
      );
      
      // Adicionar restaurantId ao cleanData
      cleanData.restaurant_id = restaurantId;

      // Se um customer_id foi selecionado, não enviar customer_data
      if (cleanData.customer_id) {
        delete cleanData.customer_data;
      } else if (cleanData.customer_data && !cleanData.customer_data.name && !cleanData.customer_data.email && !cleanData.customer_data.phone) {
        // Se customer_data estiver vazio e nenhum customer_id foi selecionado, remover customer_data
        delete cleanData.customer_data;
      }

      // Se nenhum cliente foi selecionado e nenhum customer_data foi fornecido, marcar como anônimo
      if (!cleanData.customer_id && !cleanData.customer_data) {
        cleanData.is_anonymous = true;
      } else {
        cleanData.is_anonymous = false;
      }

      console.log('Dados enviados para o feedback:', cleanData);
      
      await axiosInstance.post('/api/feedback', cleanData);
      
      toast.success('Feedback criado com sucesso!');
      navigate('/feedback');
    } catch (err) {
      console.error('Error creating feedback:', err);
      toast.error(err.response?.data?.message || 'Erro ao criar feedback');
    } finally {
      setLoading(false);
    }
  };

  const getRatingLabel = (rating) => {
    switch (rating) {
      case 1: return 'Muito Insatisfeito';
      case 2: return 'Insatisfeito';
      case 3: return 'Neutro';
      case 4: return 'Satisfeito';
      case 5: return 'Muito Satisfeito';
      default: return '';
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'compliment': return 'Elogio';
      case 'complaint': return 'Reclamação';
      case 'suggestion': return 'Sugestão';
      case 'criticism': return 'Crítica';
      default: return type;
    }
  };

  if (loadingData) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/feedback')}
        >
          Voltar
        </Button>
        <Typography variant="h4" component="h1">
          Novo Feedback
        </Typography>
      </Box>

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            {/* Customer Selection */}
            <Grid item xs={12} md={6}>
              <Controller
                name="customer_id"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <Autocomplete
                    options={customers}
                    getOptionLabel={(option) => `${option.name || option.email || option.phone}`}
                    value={customers.find(c => c.id === value) || null}
                    onChange={(_, newValue) => onChange(newValue?.id || null)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Cliente"
                        placeholder="Selecione um cliente"
                        error={!!errors.customer_id}
                        helperText={errors.customer_id?.message}
                      />
                    )}
                    renderOption={(props, option) => (
                      <li {...props}>
                        <Box>
                          <Typography variant="body1">{option.name || option.email || option.phone}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {option.email || option.phone}
                          </Typography>
                        </Box>
                      </li>
                    )}
                  />
                )}
              />
            </Grid>

            {/* QR Code Selection */}
            <Grid item xs={12} md={6}>
              <Controller
                name="qr_code_id"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <Autocomplete
                    options={qrCodes}
                    getOptionLabel={(option) => `${option.table_name || `Mesa ${option.table_number}`} - ${option.location_description || 'N/A'}`}
                    value={qrCodes.find(q => q.id === value) || null}
                    onChange={(_, newValue) => {
                      onChange(newValue?.id || null);
                      if (newValue?.table_number) {
                        setValue('table_number', newValue.table_number.toString());
                      }
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="QR Code"
                        placeholder="Selecione um QR Code"
                      />
                    )}
                    renderOption={(props, option) => (
                      <li {...props}>
                        <Box>
                          <Typography variant="body1">{option.table_name || `Mesa ${option.table_number}`}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {option.location_description || 'N/A'}
                          </Typography>
                        </Box>
                      </li>
                    )}
                  />
                )}
              />
            </Grid>

            {/* Rating */}
            <Grid item xs={12}>
              <Typography component="legend" gutterBottom>
                Avaliação *
              </Typography>
              <Box display="flex" alignItems="center" gap={2}>
                <Controller
                  name="rating"
                  control={control}
                  rules={{ required: 'Avaliação é obrigatória' }}
                  render={({ field: { onChange, value } }) => (
                    <Rating
                      value={value}
                      onChange={(_, newValue) => onChange(newValue)}
                      size="large"
                    />
                  )}
                />
                <Typography variant="body1" color="primary">
                  {getRatingLabel(watchRating)}
                </Typography>
              </Box>
              {errors.rating && (
                <Typography variant="caption" color="error">
                  {errors.rating.message}
                </Typography>
              )}
            </Grid>

            {/* Comment */}
            <Grid item xs={12}>
              <Controller
                name="comment"
                control={control}
                rules={{ required: 'Comentário é obrigatório' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Comentário"
                    multiline
                    rows={4}
                    fullWidth
                    error={!!errors.comment}
                    helperText={errors.comment?.message}
                    placeholder="Descreva a experiência do cliente..."
                  />
                )}
              />
            </Grid>

            {/* Feedback Type */}
            <Grid item xs={12} md={6}>
              <Controller
                name="feedback_type"
                control={control}
                rules={{ required: 'Tipo de feedback é obrigatório' }}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.feedback_type}>
                    <InputLabel>Tipo de Feedback</InputLabel>
                    <Select {...field} label="Tipo de Feedback">
                      <MenuItem value="compliment">Elogio</MenuItem>
                      <MenuItem value="complaint">Reclamação</MenuItem>
                      <MenuItem value="suggestion">Sugestão</MenuItem>
                      <MenuItem value="criticism">Crítica</MenuItem>
                    </Select>
                    {errors.feedback_type && (
                      <Typography variant="caption" color="error">
                        {errors.feedback_type.message}
                      </Typography>
                    )}
                  </FormControl>
                )}
              />
            </Grid>

            {/* Source */}
            <Grid item xs={12} md={6}>
              <Controller
                name="source"
                control={control}
                rules={{ required: 'Origem é obrigatória' }}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.source}>
                    <InputLabel>Origem</InputLabel>
                    <Select {...field} label="Origem">
                      <MenuItem value="qrcode">QR Code</MenuItem>
                      <MenuItem value="whatsapp">WhatsApp</MenuItem>
                      <MenuItem value="tablet">Tablet</MenuItem>
                      <MenuItem value="web">Website</MenuItem>
                      <MenuItem value="email">Email</MenuItem>
                      <MenuItem value="manual">Manual</MenuItem>
                    </Select>
                    {errors.source && (
                      <Typography variant="caption" color="error">
                        {errors.source.message}
                      </Typography>
                    )}
                  </FormControl>
                )}
              />
            </Grid>

            {/* Table Number */}
            <Grid item xs={12} md={6}>
              <Controller
                name="table_number"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Número da Mesa"
                    type="number"
                    fullWidth
                    placeholder="Ex: 5"
                  />
                )}
              />
            </Grid>

            {/* Visit Date */}
            <Grid item xs={12} md={6}>
              <Controller
                name="visit_date"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Data da Visita"
                    type="date"
                    fullWidth
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                )}
              />
            </Grid>

            {/* Preview */}
            <Grid item xs={12}>
              <Alert severity="info">
                <Typography variant="h6" gutterBottom>
                  Preview do Feedback
                </Typography>
                <Box display="flex" gap={1} mb={1}>
                  <Chip
                    label={getTypeLabel(watch('feedback_type'))}
                    color="primary"
                    size="small"
                  />
                  <Chip
                    label={watch('source')}
                    variant="outlined"
                    size="small"
                  />
                  {watch('table_number') && (
                    <Chip
                      label={`Mesa ${watch('table_number')}`}
                      variant="outlined"
                      size="small"
                    />
                  )}
                </Box>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <Rating value={watchRating} readOnly size="small" />
                  <Typography variant="body2">
                    {getRatingLabel(watchRating)}
                  </Typography>
                </Box>
                <Typography variant="body2">
                  {watch('comment') || 'Comentário aparecerá aqui...'}
                </Typography>
              </Alert>
            </Grid>

            {/* Actions */}
            <Grid item xs={12}>
              <Box display="flex" gap={2} justifyContent="flex-end">
                <Button
                  variant="outlined"
                  onClick={() => navigate('/feedback')}
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                  disabled={loading}
                >
                  {loading ? 'Salvando...' : 'Salvar Feedback'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default NewFeedback;
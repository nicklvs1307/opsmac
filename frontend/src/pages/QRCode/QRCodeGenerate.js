import React, { useState } from 'react';
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
  Grid,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  StepContent,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  Preview as PreviewIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import QRCode from 'qrcode.react';
import axiosInstance from '../../api/axiosInstance';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';

const steps = [
  'Informações Básicas',
  'Configurações',
  'Preview e Geração',
];

const QRCodeGenerate = () => {
  const { user } = useAuth();
  const restaurantId = user?.restaurants?.[0]?.id; // Acessa o ID do primeiro restaurante do usuário
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [generatedQRCode, setGeneratedQRCode] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
    trigger,
  } = useForm({
    defaultValues: {
      name: '',
      location: '',
      table_number: '',
      description: '',
      redirect_url: '',
      status: 'active',
      expires_at: '',
      custom_message: '',
      collect_customer_info: true,
      require_rating: true,
      allow_anonymous: true,
    },
  });

  const watchedValues = watch();

  React.useEffect(() => {
    // Generate preview URL based on form data
    if (watchedValues.name) {
      const baseUrl = window.location.origin;
      const slug = watchedValues.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      setPreviewUrl(`${baseUrl}/feedback/${slug}`);
    }
  }, [watchedValues.name]);

  const handleNext = async () => {
    const fieldsToValidate = getFieldsForStep(activeStep);
    const isValid = await trigger(fieldsToValidate);
    
    if (isValid) {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const getFieldsForStep = (step) => {
    switch (step) {
      case 0:
        return ['name', 'location'];
      case 1:
        return ['status'];
      default:
        return [];
    }
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      
      // Remove empty values
      const cleanData = Object.fromEntries(
        Object.entries(data).filter(([_, value]) => value !== '' && value !== null)
      );
      
      const response = await axiosInstance.post('/qrcode', { ...cleanData, restaurant_id: restaurantId });
      
      setGeneratedQRCode(response.data);
      toast.success('QR Code gerado com sucesso!');
    } catch (err) {
      console.error('Error generating QR code:', err);
      toast.error(err.response?.data?.message || 'Erro ao gerar QR Code');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!generatedQRCode) return;
    
    try {
      const response = await axiosInstance.get(`/qrcode/${generatedQRCode.id}/image`, {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `qrcode-${generatedQRCode.name}.png`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('QR Code baixado com sucesso!');
    } catch (err) {
      toast.error('Erro ao baixar QR Code');
    }
  };

  const handlePrint = async () => {
    if (!generatedQRCode) return;
    
    try {
      await axiosInstance.post(`/api/qrcode/${generatedQRCode.id}/print`);
      toast.success('QR Code enviado para impressão!');
    } catch (err) {
      toast.error('Erro ao imprimir QR Code');
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Controller
                name="name"
                control={control}
                rules={{ required: 'Nome é obrigatório' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Nome do QR Code"
                    fullWidth
                    error={!!errors.name}
                    helperText={errors.name?.message}
                    placeholder="Ex: Mesa 1, Balcão, Entrada"
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name="location"
                control={control}
                rules={{ required: 'Localização é obrigatória' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Localização"
                    fullWidth
                    error={!!errors.location}
                    helperText={errors.location?.message}
                    placeholder="Ex: Salão principal, Terraço, Área externa"
                  />
                )}
              />
            </Grid>
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
                    placeholder="Ex: 1, 2, 3..."
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Descrição"
                    multiline
                    rows={3}
                    fullWidth
                    placeholder="Descrição adicional sobre este QR Code..."
                  />
                )}
              />
            </Grid>
          </Grid>
        );
      
      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Controller
                name="status"
                control={control}
                rules={{ required: 'Status é obrigatório' }}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.status}>
                    <InputLabel>Status</InputLabel>
                    <Select {...field} label="Status">
                      <MenuItem value="active">Ativo</MenuItem>
                      <MenuItem value="inactive">Inativo</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name="expires_at"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Data de Expiração"
                    type="datetime-local"
                    fullWidth
                    InputLabelProps={{
                      shrink: true,
                    }}
                    helperText="Deixe em branco para não expirar"
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="redirect_url"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="URL de Redirecionamento Personalizada"
                    fullWidth
                    placeholder="https://exemplo.com/feedback"
                    helperText="Deixe em branco para usar a URL padrão do sistema"
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="custom_message"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Mensagem Personalizada"
                    multiline
                    rows={3}
                    fullWidth
                    placeholder="Mensagem que aparecerá na página de feedback..."
                  />
                )}
              />
            </Grid>
          </Grid>
        );
      
      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Preview do QR Code
                  </Typography>
                  <Box textAlign="center" mb={2}>
                    <QRCode
                      value={previewUrl}
                      size={200}
                      level="M"
                      includeMargin
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" textAlign="center">
                    {previewUrl}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Resumo das Configurações
                  </Typography>
                  <Box>
                    <Typography variant="body2">
                      <strong>Nome:</strong> {watchedValues.name}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Localização:</strong> {watchedValues.location}
                    </Typography>
                    {watchedValues.table_number && (
                      <Typography variant="body2">
                        <strong>Mesa:</strong> {watchedValues.table_number}
                      </Typography>
                    )}
                    <Typography variant="body2">
                      <strong>Status:</strong> {watchedValues.status === 'active' ? 'Ativo' : 'Inativo'}
                    </Typography>
                    {watchedValues.expires_at && (
                      <Typography variant="body2">
                        <strong>Expira em:</strong> {new Date(watchedValues.expires_at).toLocaleString('pt-BR')}
                      </Typography>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        );
      
      default:
        return null;
    }
  };

  if (generatedQRCode) {
    return (
      <Box>
        {/* Header */}
        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/qrcode')}
          >
            Voltar
          </Button>
          <Typography variant="h4" component="h1">
            QR Code Gerado com Sucesso!
          </Typography>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom>
                {generatedQRCode.name}
              </Typography>
              <QRCode
                value={generatedQRCode.url}
                size={256}
                level="M"
                includeMargin
              />
              <Typography variant="body2" color="text.secondary" mt={2}>
                {generatedQRCode.url}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Ações
              </Typography>
              <Box display="flex" flexDirection="column" gap={2}>
                <Button
                  variant="contained"
                  startIcon={<DownloadIcon />}
                  onClick={handleDownload}
                  fullWidth
                >
                  Baixar QR Code
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<PrintIcon />}
                  onClick={handlePrint}
                  fullWidth
                >
                  Imprimir QR Code
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/qrcode')}
                  fullWidth
                >
                  Gerenciar QR Codes
                </Button>
                <Button
                  variant="text"
                  onClick={() => {
                    setGeneratedQRCode(null);
                    setActiveStep(0);
                  }}
                  fullWidth
                >
                  Gerar Outro QR Code
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/qrcode')}
        >
          Voltar
        </Button>
        <Typography variant="h4" component="h1">
          Gerar QR Code
        </Typography>
      </Box>

      <Paper sx={{ p: 3 }}>
        <Stepper activeStep={activeStep} orientation="vertical">
          {steps.map((label, index) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
              <StepContent>
                <Box sx={{ mb: 2 }}>
                  {renderStepContent(index)}
                </Box>
                <Box sx={{ mb: 2 }}>
                  <div>
                    {index === steps.length - 1 ? (
                      <Button
                        variant="contained"
                        onClick={handleSubmit(onSubmit)}
                        disabled={loading}
                        startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                        sx={{ mt: 1, mr: 1 }}
                      >
                        {loading ? 'Gerando...' : 'Gerar QR Code'}
                      </Button>
                    ) : (
                      <Button
                        variant="contained"
                        onClick={handleNext}
                        sx={{ mt: 1, mr: 1 }}
                      >
                        Continuar
                      </Button>
                    )}
                    <Button
                      disabled={index === 0}
                      onClick={handleBack}
                      sx={{ mt: 1, mr: 1 }}
                    >
                      Voltar
                    </Button>
                  </div>
                </Box>
              </StepContent>
            </Step>
          ))}
        </Stepper>
      </Paper>
    </Box>
  );
};

export default QRCodeGenerate;
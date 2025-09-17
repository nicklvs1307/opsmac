import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { useMutation } from 'react-query';
import { toast } from 'react-hot-toast';
import { createRestaurantWithOwner, saveRestaurant, fetchUsers } from '@/features/Admin/services/adminService'; // Assuming these are correctly implemented
import { useQueryClient, useQuery } from 'react-query';
import usePermissions from '@/hooks/usePermissions';

const RestaurantCreatePage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { can } = usePermissions(); // Destructure can from usePermissions

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    defaultValues: {
      restaurant_name: '',
      restaurant_address: '',
      restaurant_cuisine_type: '',
      restaurant_description: '',
      restaurant_city: '', // Added
      restaurant_state: '', // Added
      owner_name: '',
      owner_email: '',
      owner_password: '',
      owner_phone: '',
      existing_owner_id: '',
      create_new_owner: true, // Default to creating a new owner
    },
  });

  const createNewOwner = watch('create_new_owner');

  // Fetch existing users to allow assigning an existing owner
  const { 
    data: users,
    isLoading: isLoadingUsers,
    isError: isErrorUsers,
  } = useQuery('adminUsers', fetchUsers);

  // Mutation for creating a new restaurant with a new owner
  const createRestaurantWithOwnerMutation = useMutation(createRestaurantWithOwner, {
    onSuccess: () => {
      toast.success('Restaurante e proprietário criados com sucesso!');
      queryClient.invalidateQueries('adminRestaurants');
      queryClient.invalidateQueries('adminUsers');
      navigate('/admin/restaurants');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Erro ao criar restaurante e proprietário.');
    },
  });

  // Mutation for creating a new restaurant and assigning an existing owner
  const saveRestaurantMutation = useMutation(saveRestaurant, {
    onSuccess: () => {
      toast.success('Restaurante criado com sucesso!');
      queryClient.invalidateQueries('adminRestaurants');
      navigate('/admin/restaurants');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Erro ao criar restaurante.');
    },
  });

  const onSubmit = async (data) => {
    if (createNewOwner) {
      // Create new restaurant with new owner
      await createRestaurantWithOwnerMutation.mutateAsync({
        restaurantName: data.restaurant_name,
        address: data.restaurant_address,
        cuisine_type: data.restaurant_cuisine_type,
        description: data.restaurant_description,
        city: data.restaurant_city, // Added
        state: data.restaurant_state, // Added
        ownerName: data.owner_name,
        ownerEmail: data.owner_email,
        ownerPassword: data.owner_password,
        ownerPhone: data.owner_phone,
      });
    } else {
      // Create new restaurant and assign existing owner
      await saveRestaurantMutation.mutateAsync({
        name: data.restaurant_name,
        address: data.restaurant_address,
        cuisine_type: data.restaurant_cuisine_type,
        description: data.restaurant_description,
        city: data.restaurant_city, // Added
        state: data.restaurant_state, // Added
        ownerId: data.existing_owner_id,
      });
    }
  };

  if (isLoadingUsers) {
    return (
      <Box
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (isErrorUsers) {
    return <Alert severity="error">Erro ao carregar usuários existentes.</Alert>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Criar Novo Restaurante
      </Typography>
      <Paper sx={{ p: 3, mb: 4 }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Typography variant="h5" gutterBottom sx={{ mt: 2 }}>
            Dados do Proprietário
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Controller
                name="restaurant_name"
                control={control}
                rules={{ required: 'Nome do restaurante é obrigatório' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Nome do Restaurante"
                    fullWidth
                    margin="normal"
                    error={!!errors.restaurant_name}
                    helperText={errors.restaurant_name?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="restaurant_address"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Endereço do Restaurante" fullWidth margin="normal" />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="restaurant_city"
                control={control}
                rules={{ required: 'Cidade é obrigatória' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Cidade do Restaurante"
                    fullWidth
                    margin="normal"
                    error={!!errors.restaurant_city}
                    helperText={errors.restaurant_city?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="restaurant_state"
                control={control}
                rules={{ required: 'Estado é obrigatório' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Estado do Restaurante"
                    fullWidth
                    margin="normal"
                    error={!!errors.restaurant_state}
                    helperText={errors.restaurant_state?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="restaurant_cuisine_type"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Tipo de Culinária" fullWidth margin="normal" />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="restaurant_description"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Descrição do Restaurante"
                    fullWidth
                    margin="normal"
                    multiline
                    rows={4}
                  />
                )}
              />
            </Grid>
          </Grid>

          <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
            Dados do Proprietário
          </Typography>
          <FormControlLabel
            control={
              <Controller
                name="create_new_owner"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    {...field}
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                  />
                )}
              />
            }
            label="Criar novo proprietário"
          />

          {createNewOwner ? (
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="owner_name"
                  control={control}
                  rules={{
                    required: createNewOwner ? 'Nome do proprietário é obrigatório' : false,
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Nome do Proprietário"
                      fullWidth
                      margin="normal"
                      error={!!errors.owner_name}
                      helperText={errors.owner_name?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="owner_email"
                  control={control}
                  rules={{
                    required: createNewOwner ? 'Email do proprietário é obrigatório' : false,
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Email do Proprietário"
                      fullWidth
                      margin="normal"
                      type="email"
                      error={!!errors.owner_email}
                      helperText={errors.owner_email?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="owner_password"
                  control={control}
                  rules={{
                    required: createNewOwner ? 'Senha do proprietário é obrigatória' : false,
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Senha do Proprietário"
                      fullWidth
                      margin="normal"
                      type="password"
                      error={!!errors.owner_password}
                      helperText={errors.owner_password?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="owner_phone"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Telefone do Proprietário"
                      fullWidth
                      margin="normal"
                    />
                  )}
                />
              </Grid>
            </Grid>
          ) : (
            <FormControl fullWidth margin="normal">
              <InputLabel id="existing-owner-label">Selecionar Proprietário Existente</InputLabel>
              <Controller
                name="existing_owner_id"
                control={control}
                rules={{
                  required: !createNewOwner ? 'Selecione um proprietário existente' : false,
                }}
                render={({ field }) => (
                  <Select
                    {...field}
                    labelId="existing-owner-label"
                    label="Selecionar Proprietário Existente"
                    error={!!errors.existing_owner_id}
                  >
                    <MenuItem value="">
                      <em>Nenhum</em>
                    </MenuItem>
                    {users?.map((user) => (
                      <MenuItem key={user.id} value={user.id}>
                        {user.name} ({user.email})
                      </MenuItem>
                    ))}
                  </Select>
                )}
              />
              {errors.existing_owner_id && (
                <Typography color="error" variant="caption">
                  {errors.existing_owner_id.message}
                </Typography>
              )}
            </FormControl>
          )}

          <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={
                createRestaurantWithOwnerMutation.isLoading ||
                saveRestaurantMutation.isLoading ||
                !can('admin:restaurants', 'create')
              }
            >
              {createRestaurantWithOwnerMutation.isLoading || saveRestaurantMutation.isLoading ? (
                <CircularProgress size={24} />
              ) : (
                'Criar Restaurante'
              )}
            </Button>
            <Button variant="outlined" onClick={() => navigate('/admin/restaurants')}> 
              Cancelar
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default RestaurantCreatePage;

import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-hot-toast';
import { saveUser } from '@/services/adminService';
import {
  useGetPermissionTree,
  useGetRoles,
  useSetUserPermissionOverrides,
  useAssignUserRole,
} from '@/features/IAM/api/iamQueries';
import { useAuth } from '@/app/providers/contexts/AuthContext';
import usePermissions from '@/hooks/usePermissions';
import PermissionTree from '@/components/Admin/PermissionTree';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

const validationSchema = yup.object().shape({
  name: yup.string().required('Nome é obrigatório'),
  email: yup.string().email('Formato de email inválido').required('Email é obrigatório'),
  password: yup
    .string()
    .required('Senha é obrigatória')
    .min(6, 'A senha deve ter pelo menos 6 caracteres'),
  phone: yup.string(),
  roleId: yup.string().required('Função é obrigatória'),
});

const UserCreatePage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { selectedRestaurantId } = useAuth();
  const { can } = usePermissions();

  const [selectedFeatures, setSelectedFeatures] = useState({});

  const {
    data: allRoles,
    isLoading: isLoadingAllRoles,
    isError: isErrorAllRoles,
    error: errorAllRoles,
  } = useGetRoles(selectedRestaurantId, { enabled: !!selectedRestaurantId });

  const {
    data: permissionTree,
    isLoading: isLoadingPermissionTree,
    isError: isErrorPermissionTree,
    error: errorPermissionTree,
  } = useGetPermissionTree(selectedRestaurantId, { enabled: !!selectedRestaurantId });

  useEffect(() => {
    if (permissionTree) {
      const initialSelection = {};
      permissionTree.modules.forEach((module) => {
        initialSelection[module.id] = {
          checked: false,
          indeterminate: false,
          features: module.submodules.reduce((accSub, submodule) => {
            submodule.features.forEach((feature) => {
              accSub[feature.id] = {
                checked: false,
                indeterminate: false,
                actions: feature.actions.reduce((accAct, action) => {
                  accAct[action.id] = false;
                  return accAct;
                }, {}),
              };
            });
            return accSub;
          }, {}),
          submodules: module.submodules.reduce((accSub, submodule) => {
            accSub[submodule.id] = {
              checked: false,
              indeterminate: false,
              features: submodule.features.reduce((accFeat, feature) => {
                accFeat[feature.id] = {
                  checked: false,
                  indeterminate: false,
                  actions: feature.actions.reduce((accAct, action) => {
                    accAct[action.id] = false;
                    return accAct;
                  }, {}),
                };
                return accFeat;
              }, {}),
            };
            return accSub;
          }, {}),
        };
      });
      setSelectedFeatures(initialSelection);
    }
  }, [permissionTree]);

  const handlePermissionChange = (newSelectedFeatures) => {
    setSelectedFeatures(newSelectedFeatures);
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      phone: '',
      roleId: '',
    },
    resolver: yupResolver(validationSchema),
  });

  const saveUserMutation = useMutation(saveUser, {
    onSuccess: (newUser) => {
      toast.success('Usuário criado com sucesso!');
      queryClient.invalidateQueries('adminUsers');

      // Assign role to the new user
      const newRoleId = control._formValues.roleId; // Get roleId from form
      if (newRoleId) {
        assignUserRoleMutation.mutate(
          {
            userId: newUser.id,
            restaurantId: selectedRestaurantId,
            roleId: newRoleId,
          },
          {
            onSuccess: () => {
              toast.success('Função do usuário atribuída com sucesso!');
              queryClient.invalidateQueries(['userRoles', newUser.id, selectedRestaurantId]);
              queryClient.invalidateQueries(['permissionTree', selectedRestaurantId]);
            },
            onError: (err) => {
              toast.error(err.response?.data?.message || 'Erro ao atribuir função ao usuário.');
            },
          }
        );
      }

      // Save user permission overrides
      if (selectedFeatures) {
        const overrides = [];
        permissionTree.modules.forEach((module) => {
          module.features.forEach((feature) => {
            feature.actions.forEach((action) => {
              const isActionSelected =
                selectedFeatures[module.id]?.features[feature.id]?.actions[action.id];
              if (isActionSelected !== undefined) {
                overrides.push({
                  featureId: feature.id,
                  actionId: action.id,
                  allowed: isActionSelected,
                });
              }
            });
          });
          module.submodules.forEach((submodule) => {
            submodule.features.forEach((feature) => {
              feature.actions.forEach((action) => {
                const isActionSelected =
                  selectedFeatures[module.id]?.submodules[submodule.id]?.features[feature.id]
                    ?.actions[action.id];
                if (isActionSelected !== undefined) {
                  overrides.push({
                    featureId: feature.id,
                    actionId: action.id,
                    allowed: isActionSelected,
                  });
                }
              });
            });
          });
        });

        if (overrides.length > 0) {
          if (selectedRestaurantId) {
            saveUserPermissionOverridesMutation.mutate(
              {
                userId: newUser.id,
                restaurantId: selectedRestaurantId,
                overrides,
              },
              {
                onSuccess: () => {
                  toast.success('Permissões do usuário salvas com sucesso!');
                  queryClient.invalidateQueries([
                    'userPermissionOverrides',
                    newUser.id,
                    selectedRestaurantId,
                  ]);
                  queryClient.invalidateQueries(['permissionTree', selectedRestaurantId]);
                },
                onError: (err) => {
                  toast.error(
                    err.response?.data?.message || 'Erro ao salvar permissões do usuário.'
                  );
                },
              }
            );
          } else {
            toast.error('Restaurant ID is missing. Cannot save user permission overrides.');
          }
        }
      }

      navigate('/admin/users');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Erro ao criar usuário.');
    },
  });

  const assignUserRoleMutation = useAssignUserRole();
  const saveUserPermissionOverridesMutation = useSetUserPermissionOverrides();

  const onSubmit = (data) => {
    saveUserMutation.mutate(data);
  };

  if (isLoadingAllRoles || isLoadingPermissionTree) {
    return (
      <Box
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (isErrorAllRoles || isErrorPermissionTree) {
    return (
      <Alert severity="error">
        Erro ao carregar dados: {errorAllRoles?.message || errorPermissionTree?.message}
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Criar Novo Usuário
      </Typography>
      <Paper sx={{ p: 3, mb: 4 }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Nome do Usuário"
                    fullWidth
                    margin="normal"
                    error={!!errors.name}
                    helperText={errors.name?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Email"
                    fullWidth
                    margin="normal"
                    type="email"
                    error={!!errors.email}
                    helperText={errors.email?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Senha"
                    fullWidth
                    margin="normal"
                    type="password"
                    error={!!errors.password}
                    helperText={errors.password?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="phone"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Telefone" fullWidth margin="normal" />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel id="select-role-label">Função</InputLabel>
                <Controller
                  name="roleId"
                  control={control}
                  rules={{ required: 'Função é obrigatória' }}
                  render={({ field }) => (
                    <Select
                      {...field}
                      labelId="select-role-label"
                      label="Função"
                      error={!!errors.roleId}
                    >
                      <MenuItem value="">
                        <em>Nenhum</em>
                      </MenuItem>
                      {allRoles?.map((role) => (
                        <MenuItem key={role.id} value={role.id}>
                          {role.name}
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                />
                {errors.roleId && (
                  <Typography color="error" variant="caption">
                    {errors.roleId.message}
                  </Typography>
                )}
              </FormControl>
            </Grid>
          </Grid>

          {permissionTree?.modules?.length > 0 && Object.keys(selectedFeatures).length > 0 && (
            <Box sx={{ mt: 4 }}>
              <Typography variant="h5" gutterBottom>
                Permissões do Usuário
              </Typography>
              <PermissionTree
                availableModules={permissionTree?.modules}
                selectedModules={selectedFeatures}
                onSelectionChange={handlePermissionChange}
                disabled={!can('admin_users', 'manage_permissions')}
              />
            </Box>
          )}

          <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={
                saveUserMutation.isLoading ||
                assignUserRoleMutation.isLoading ||
                saveUserPermissionOverridesMutation.isLoading ||
                !can('admin:users', 'create')
              }
            >
              {saveUserMutation.isLoading ||
              assignUserRoleMutation.isLoading ||
              saveUserPermissionOverridesMutation.isLoading ? (
                <CircularProgress size={24} />
              ) : (
                'Criar Usuário'
              )}
            </Button>
            <Button variant="outlined" onClick={() => navigate('/admin/users')}>
              Cancelar
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default UserCreatePage;

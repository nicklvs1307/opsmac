import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-hot-toast';
import {
  fetchUsers, // Keep for basic user details, not IAM
  saveUser,
} from '@/services/adminService';
import {
  useGetPermissionTree,
  useGetRoles,
  useGetUserPermissionOverrides,
  useSetUserPermissionOverrides,
  useAssignUserRole,
  useRemoveUserRole,
} from '@/features/IAM/api/iamQueries';
import { useAuth } from '@/app/providers/contexts/AuthContext';
import usePermissions from '@/hooks/usePermissions';
import PermissionTree from '@/components/Admin/PermissionTree';

const UserEditPage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, selectedRestaurantId } = useAuth();
  const { can } = usePermissions();

  // Fetch all users (to find the specific one)
  const {
    data: allUsers,
    isLoading: isLoadingUsers,
    isError: isErrorUsers,
    error: errorUsers,
  } = useQuery('adminUsers', fetchUsers);

  // Find the specific user from the fetched list
  const targetUser = allUsers?.find((u) => u.id === userId);

  // Fetch all roles for the selected restaurant
  const {
    data: allRoles,
    isLoading: isLoadingAllRoles,
    isError: isErrorAllRoles,
    error: errorAllRoles,
  } = useGetRoles(selectedRestaurantId, { enabled: !!selectedRestaurantId });

  // Fetch permission tree (modules, submodules, features) for the selected restaurant
  const {
    data: permissionTree,
    isLoading: isLoadingPermissionTree,
    isError: isErrorPermissionTree,
    error: errorPermissionTree,
  } = useGetPermissionTree(selectedRestaurantId, { enabled: !!selectedRestaurantId });

  // Fetch user's permission overrides for the selected restaurant
  const {
    data: userPermissionOverrides,
    isLoading: isLoadingUserPermissionOverrides,
    isError: isErrorUserPermissionOverrides,
    error: errorUserPermissionOverrides,
  } = useGetUserPermissionOverrides(userId, selectedRestaurantId, {
    enabled: !!userId && !!selectedRestaurantId,
  });

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  // Mutation for saving user details
  const saveUserMutation = useMutation(saveUser, {
    onSuccess: () => {
      toast.success('Detalhes do usuário atualizados com sucesso!');
      queryClient.invalidateQueries('adminUsers');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Erro ao atualizar detalhes do usuário.');
    },
  });

  // Mutation for assigning/removing user role
  const assignUserRoleMutation = useAssignUserRole();
  const removeUserRoleMutation = useRemoveUserRole();

  // Mutation for saving user permission overrides
  const saveUserPermissionOverridesMutation = useSetUserPermissionOverrides();

  const [selectedFeatures, setSelectedFeatures] = useState({});

  // Effect to populate form when data loads
  useEffect(() => {
    if (targetUser) {
      reset({
        name: targetUser.name || '',
        email: targetUser.email || '',
        phone: targetUser.phone || '',
        roleId: targetUser.role?.id || '', // Use roleId instead of roleName
      });
    }
  }, [targetUser, reset]);

  useEffect(() => {
    if (permissionTree && userPermissionOverrides) {
      const initialSelected = {};
      permissionTree.modules.forEach((module) => {
        initialSelected[module.id] = {
          checked: false,
          indeterminate: false,
          features: module.submodules.reduce((accSub, submodule) => {
            submodule.features.forEach((feature) => {
              accSub[feature.id] = {
                checked: userPermissionOverrides.some(
                  (override) => override.featureId === feature.id && override.allowed
                ),
                indeterminate: false,
                actions: feature.actions.reduce((accAct, action) => {
                  accAct[action.id] = userPermissionOverrides.some(
                    (override) =>
                      override.featureId === feature.id &&
                      override.actionId === action.id &&
                      override.allowed
                  );
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
                  checked: userPermissionOverrides.some(
                    (override) => override.featureId === feature.id && override.allowed
                  ),
                  indeterminate: false,
                  actions: feature.actions.reduce((accAct, action) => {
                    accAct[action.id] = userPermissionOverrides.some(
                      (override) =>
                        override.featureId === feature.id &&
                        override.actionId === action.id &&
                        override.allowed
                    );
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
      setSelectedFeatures(initialSelected);
    }
  }, [permissionTree, userPermissionOverrides]);

  const handlePermissionChange = (newSelectedFeatures) => {
    setSelectedFeatures(newSelectedFeatures);
  };

  const onSubmit = async (data) => {
    // Save user details
    try {
      await saveUserMutation.mutateAsync({ ...data, userId });
      toast.success('Detalhes do usuário atualizados com sucesso!');
      queryClient.invalidateQueries('adminUsers');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erro ao atualizar detalhes do usuário.');
      return; // Stop if user details save fails
    }

    // Handle role assignment/removal
    const currentRoleId = targetUser?.role?.id; // Assuming user object has role.id
    const newRoleId = data.roleId;

    if (currentRoleId !== newRoleId) {
      try {
        if (currentRoleId) {
          await removeUserRoleMutation.mutateAsync({
            userId,
            restaurantId: selectedRestaurantId,
            roleId: currentRoleId,
          });
        }
        if (newRoleId) {
          await assignUserRoleMutation.mutateAsync({
            userId,
            restaurantId: selectedRestaurantId,
            roleId: newRoleId,
          });
        }
        toast.success('Função do usuário atualizada com sucesso!');
        queryClient.invalidateQueries(['userRoles', userId, selectedRestaurantId]);
        queryClient.invalidateQueries(['permissionTree', selectedRestaurantId]); // Invalidate permission tree
      } catch (err) {
        toast.error(err.response?.data?.message || 'Erro ao atualizar função do usuário.');
        return; // Stop if role update fails
      }
    }

    // Save user permission overrides
    if (selectedFeatures) {
      const overrides = [];
      // Iterate through the permissionTree structure to build the overrides array
      permissionTree.modules.forEach((module) => {
        module.features.forEach((feature) => {
          // For each action associated with the feature, create an override entry
          feature.actions.forEach((action) => {
            const isActionSelected =
              selectedFeatures[module.id]?.features[feature.id]?.actions[action.id];
            if (isActionSelected !== undefined) {
              // Only add if explicitly set
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
                // Only add if explicitly set
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

      try {
        await saveUserPermissionOverridesMutation.mutateAsync({
          userId,
          restaurantId: selectedRestaurantId,
          overrides,
        });
        toast.success('Permissões do usuário atualizadas com sucesso!');
        queryClient.invalidateQueries(['userPermissionOverrides', userId, selectedRestaurantId]);
        queryClient.invalidateQueries(['permissionTree', selectedRestaurantId]); // Invalidate permission tree
      } catch (err) {
        toast.error(err.response?.data?.message || 'Erro ao atualizar permissões do usuário.');
      }
    }
  };

  if (
    isLoadingUsers ||
    isLoadingAllRoles ||
    isLoadingPermissionTree ||
    isLoadingUserPermissionOverrides
  ) {
    return (
      <Box
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (isErrorUsers || isErrorAllRoles || isErrorPermissionTree || isErrorUserPermissionOverrides) {
    return (
      <Alert severity="error">
        Erro ao carregar dados:{' '}
        {errorUsers?.message ||
          errorAllRoles?.message ||
          errorPermissionTree?.message ||
          errorUserPermissionOverrides?.message}
      </Alert>
    );
  }

  if (!targetUser) {
    return <Alert severity="warning">Usuário não encontrado.</Alert>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Editar Usuário: {targetUser.name}
      </Typography>
      <Paper sx={{ p: 3, mb: 4 }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Controller
                name="name"
                control={control}
                defaultValue=""
                rules={{ required: 'Nome é obrigatório' }}
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
                defaultValue=""
                rules={{
                  required: 'Email é obrigatório',
                  pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Email"
                    fullWidth
                    margin="normal"
                    error={!!errors.email}
                    helperText={errors.email?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="phone"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <TextField {...field} label="Telefone" fullWidth margin="normal" />
                )}
              />
            </Grid>
            {!userId && (
              <Grid item xs={12} sm={6}>
                <Controller
                  name="password"
                  control={control}
                  defaultValue=""
                  rules={{
                    required: 'Senha é obrigatória',
                    minLength: { value: 6, message: 'Senha deve ter pelo menos 6 caracteres' },
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Senha"
                      type="password"
                      fullWidth
                      margin="normal"
                      error={!!errors.password}
                      helperText={errors.password?.message}
                    />
                  )}
                />
              </Grid>
            )}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel id="select-role-label">Função</InputLabel>
                <Controller
                  name="roleId" // Use roleId instead of roleName
                  control={control}
                  rules={{ required: 'Função é obrigatória' }}
                  render={({ field }) => (
                    <Select
                      {...field}
                      labelId="select-role-label"
                      label="Função"
                      error={!!errors.roleId} // Changed to roleId
                    >
                      <MenuItem value="">
                        <em>Nenhum</em>
                      </MenuItem>
                      {allRoles?.map((role) => (
                        <MenuItem key={role.id} value={role.id}>
                          {' '}
                          {/* Use role.id as value */}
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
            {/* Add other user fields here */}
          </Grid>
          <Box sx={{ mt: 4 }}>
            <Typography variant="h5" gutterBottom>
              Permissões do Usuário
            </Typography>
            <PermissionTree
              availableModules={permissionTree?.modules} // Use permissionTree.modules
              selectedModules={selectedFeatures}
              onSelectionChange={handlePermissionChange}
              disabled={!can('admin_users', 'manage_permissions')}
            />
          </Box>
          <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={
                saveUserMutation.isLoading ||
                assignUserRoleMutation.isLoading ||
                removeUserRoleMutation.isLoading ||
                saveUserPermissionOverridesMutation.isLoading ||
                !can('admin_users', 'update')
              }
            >
              {saveUserMutation.isLoading ||
              assignUserRoleMutation.isLoading ||
              removeUserRoleMutation.isLoading ||
              saveUserPermissionOverridesMutation.isLoading ? (
                <CircularProgress size={24} />
              ) : (
                'Salvar Alterações'
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

export default UserEditPage;

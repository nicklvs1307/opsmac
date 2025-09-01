import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  CircularProgress,
  Alert,
  Checkbox,
  FormGroup,
  FormControlLabel,
} from '@mui/material';
import { TreeView, TreeItem } from '@mui/lab';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useQueryClient } from 'react-query';
import { useAuth } from '@/app/providers/contexts/AuthContext';
import usePermissions from '@/hooks/usePermissions';
import toast from 'react-hot-toast';

import {
  useGetRoles,
  useGetPermissionTree,
  useGetRolePermissions,
  useSetRolePermissions,
} from '@/features/IAM/api/iamQueries';

const RolePermissionManagementPage = () => {
  const { user: currentUser, selectedRestaurantId } = useAuth();
  const { can } = usePermissions();
  const queryClient = useQueryClient();
  const isSuperAdmin = currentUser?.role?.name === 'super_admin';

  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState({}); // { moduleId: { features: { featureId: { actions: { actionId: boolean } } } } }

  // Fetch roles based on user type
  const {
    data: allRoles,
    isLoading: isLoadingAllRoles,
    isError: isErrorAllRoles,
    error: errorAllRoles,
  } = useGetRoles(selectedRestaurantId, { enabled: !!selectedRestaurantId });

  const roles = allRoles; // Assuming useGetRoles returns all roles for the selected restaurant
  const isLoadingRoles = isLoadingAllRoles;
  const isErrorRoles = isErrorAllRoles;

  // Fetch permission tree (features and actions catalog)
  const {
    data: permissionTree,
    isLoading: isLoadingPermissionTree,
    isError: isErrorPermissionTree,
    error: errorPermissionTree,
  } = useGetPermissionTree(selectedRestaurantId, { enabled: !!selectedRestaurantId });

  // Fetch permissions for the selected role
  const {
    data: fetchedRolePermissions,
    isLoading: isLoadingRolePermissions,
    isError: isErrorRolePermissions,
    error: errorRolePermissions,
  } = useGetRolePermissions(selectedRoleId, selectedRestaurantId, {
    enabled: !!selectedRoleId && !!selectedRestaurantId,
  });

  // Mutation for updating role permissions
  const setRolePermissionsMutation = useSetRolePermissions();

  // Effect to set initial selected permissions when a role is selected or fetchedRolePermissions change
  useEffect(() => {
    if (fetchedRolePermissions && permissionTree) {
      const initialSelected = {};
      permissionTree.modules.forEach((module) => {
        initialSelected[module.id] = {
          checked: false,
          indeterminate: false,
          features: module.submodules.reduce((accSub, submodule) => {
            submodule.features.forEach((feature) => {
              accSub[feature.id] = {
                checked: false,
                indeterminate: false,
                actions: feature.actions.reduce((accAct, action) => {
                  accAct[action.id] = fetchedRolePermissions.some(
                    (rp) => rp.featureId === feature.id && rp.actionId === action.id && rp.allowed
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
                  checked: false,
                  indeterminate: false,
                  actions: feature.actions.reduce((accAct, action) => {
                    accAct[action.id] = fetchedRolePermissions.some(
                      (rp) => rp.featureId === feature.id && rp.actionId === action.id && rp.allowed
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
      setSelectedPermissions(initialSelected);
    }
  }, [fetchedRolePermissions, permissionTree]);

  // Helper function to update parent checkbox states (checked/indeterminate)

  // Handle permission change
  const handlePermissionChange = (newSelected) => {
    setSelectedPermissions(newSelected);
  };

  // Handle save
  const handleSave = async () => {
    if (!selectedRoleId) {
      toast.error('Por favor, selecione uma função.');
      return;
    }

    const permissionsToSave = [];
    permissionTree.modules.forEach((module) => {
      module.features.forEach((feature) => {
        feature.actions.forEach((action) => {
          const isActionSelected =
            selectedPermissions[module.id]?.features[feature.id]?.actions[action.id];
          if (isActionSelected !== undefined) {
            // Only add if explicitly set
            permissionsToSave.push({
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
              selectedPermissions[module.id]?.submodules[submodule.id]?.features[feature.id]
                ?.actions[action.id];
            if (isActionSelected !== undefined) {
              // Only add if explicitly set
              permissionsToSave.push({
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
      await setRolePermissionsMutation.mutateAsync({
        roleId: selectedRoleId,
        restaurantId: selectedRestaurantId,
        permissions: permissionsToSave,
      });
      toast.success('Permissões atualizadas com sucesso!');
      queryClient.invalidateQueries(['rolePermissions', selectedRoleId, selectedRestaurantId]);
      queryClient.invalidateQueries(['permissionTree', selectedRestaurantId]); // Invalidate permission tree
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao atualizar permissões.');
    }
  };

  if (!selectedRestaurantId || !selectedRoleId) {
    return <div>Invalid URL. Missing restaurant ID or role ID.</div>;
  }

  if (isLoadingRoles || isLoadingPermissionTree || isLoadingRolePermissions) {
    return <CircularProgress />;
  }

  if (isErrorRoles || isErrorPermissionTree || isErrorRolePermissions) {
    return <Alert severity="error">Erro ao carregar dados de permissões.</Alert>;
  }

  if (!roles || !permissionTree) {
    return <div>No data available.</div>;
  }

  const selectedRole = roles.find((r) => r.id === selectedRoleId);
  if (!selectedRole) {
    return <div>Role not found.</div>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Gerenciamento de Permissões para Função: {selectedRole.name} ({selectedRole.key})
      </Typography>
      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel id="select-role-label">Selecionar Função</InputLabel>
        <Select
          labelId="select-role-label"
          value={selectedRoleId}
          label="Selecionar Função"
          onChange={(e) => setSelectedRoleId(e.target.value)}
        >
          <MenuItem value="">
            <em>Nenhum</em>
          </MenuItem>
          {roles?.map((role) => (
            <MenuItem key={role.id} value={role.id}>
              {role.name}{' '}
              {role.restaurantId
                ? `(Restaurante: ${role.restaurantId})` // Assuming restaurant name is not directly available here
                : '(Global)'}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {selectedRoleId && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom>
            Atribuir Permissões
          </Typography>
          <TreeView
            defaultCollapseIcon={<ExpandMoreIcon />}
            defaultExpandIcon={<ChevronRightIcon />}
            multiSelect
          >
            {permissionTree?.modules.map((moduleNode) => (
              <TreeItem
                key={moduleNode.id}
                nodeId={moduleNode.id.toString()}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Checkbox
                      checked={selectedPermissions[moduleNode.id]?.checked || false}
                      indeterminate={selectedPermissions[moduleNode.id]?.indeterminate || false}
                      onChange={(e) => {
                        const newSelected = JSON.parse(JSON.stringify(selectedPermissions));
                        newSelected[moduleNode.id].checked = e.target.checked;
                        // Set all features and their actions within this module
                        moduleNode.features.forEach((feature) => {
                          newSelected[moduleNode.id].features[feature.id] = {
                            ...newSelected[moduleNode.id].features[feature.id],
                            checked: e.target.checked,
                          };
                          feature.actions.forEach((action) => {
                            newSelected[moduleNode.id].features[feature.id].actions[action.id] =
                              e.target.checked;
                          });
                        });
                        moduleNode.submodules.forEach((submodule) => {
                          newSelected[moduleNode.id].submodules[submodule.id] = {
                            ...newSelected[moduleNode.id].submodules[submodule.id],
                            checked: e.target.checked,
                          };
                          submodule.features.forEach((feature) => {
                            newSelected[moduleNode.id].submodules[submodule.id].features[
                              feature.id
                            ] = {
                              ...newSelected[moduleNode.id].submodules[submodule.id].features[
                                feature.id
                              ],
                              checked: e.target.checked,
                            };
                            feature.actions.forEach((action) => {
                              newSelected[moduleNode.id].submodules[submodule.id].features[
                                feature.id
                              ].actions[action.id] = e.target.checked;
                            });
                          });
                        });
                        // updateParentStates(newSelected, moduleNode.id); // This helper is not available here
                        handlePermissionChange(newSelected);
                      }}
                      disabled={!can('role_permissions', 'update')}
                    />
                    <Typography variant="body1">{moduleNode.name}</Typography>
                  </Box>
                }
              >
                {moduleNode.submodules?.map((submoduleNode) => (
                  <TreeItem
                    key={submoduleNode.id}
                    nodeId={submoduleNode.id.toString()}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Checkbox
                          checked={
                            selectedPermissions[moduleNode.id]?.submodules[submoduleNode.id]
                              ?.checked || false
                          }
                          indeterminate={
                            selectedPermissions[moduleNode.id]?.submodules[submoduleNode.id]
                              ?.indeterminate || false
                          }
                          onChange={(e) => {
                            const newSelected = JSON.parse(JSON.stringify(selectedPermissions));
                            newSelected[moduleNode.id].submodules[submoduleNode.id].checked =
                              e.target.checked;
                            submoduleNode.features.forEach((feature) => {
                              newSelected[moduleNode.id].submodules[submoduleNode.id].features[
                                feature.id
                              ] = {
                                ...newSelected[moduleNode.id].submodules[submoduleNode.id].features[
                                  feature.id
                                ],
                                checked: e.target.checked,
                              };
                              feature.actions.forEach((action) => {
                                newSelected[moduleNode.id].submodules[submoduleNode.id].features[
                                  feature.id
                                ].actions[action.id] = e.target.checked;
                              });
                            });
                            handlePermissionChange(newSelected);
                          }}
                          disabled={!can('role_permissions', 'update')}
                        />
                        <Typography variant="body1">{submoduleNode.name}</Typography>
                      </Box>
                    }
                  >
                    {submoduleNode.features?.map((featureNode) => (
                      <TreeItem
                        key={featureNode.id}
                        nodeId={featureNode.id.toString()}
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Checkbox
                              checked={
                                selectedPermissions[moduleNode.id]?.submodules[submoduleNode.id]
                                  ?.features[featureNode.id]?.checked || false
                              }
                              indeterminate={
                                selectedPermissions[moduleNode.id]?.submodules[submoduleNode.id]
                                  ?.features[featureNode.id]?.indeterminate || false
                              }
                              onChange={(e) => {
                                const newSelected = JSON.parse(JSON.stringify(selectedPermissions));
                                newSelected[moduleNode.id].submodules[submoduleNode.id].features[
                                  featureNode.id
                                ].checked = e.target.checked;
                                featureNode.actions.forEach((action) => {
                                  newSelected[moduleNode.id].submodules[submoduleNode.id].features[
                                    featureNode.id
                                  ].actions[action.id] = e.target.checked;
                                });
                                handlePermissionChange(newSelected);
                              }}
                              disabled={!can('role_permissions', 'update')}
                            />
                            <Typography variant="body1">{featureNode.name}</Typography>
                          </Box>
                        }
                      >
                        <FormGroup sx={{ ml: 4 }}>
                          {featureNode.actions?.map((action) => (
                            <FormControlLabel
                              key={action.id}
                              control={
                                <Checkbox
                                  checked={
                                    selectedPermissions[moduleNode.id]?.submodules[submoduleNode.id]
                                      ?.features[featureNode.id]?.actions[action.id] || false
                                  }
                                  onChange={(e) => {
                                    const newSelected = JSON.parse(
                                      JSON.stringify(selectedPermissions)
                                    );
                                    newSelected[moduleNode.id].submodules[
                                      submoduleNode.id
                                    ].features[featureNode.id].actions[action.id] =
                                      e.target.checked;
                                    handlePermissionChange(newSelected);
                                  }}
                                  disabled={!can('role_permissions', 'update')}
                                />
                              }
                              label={action.key}
                              sx={{ display: 'block' }}
                            />
                          ))}
                        </FormGroup>
                      </TreeItem>
                    ))}
                  </TreeItem>
                ))}
                {moduleNode.features?.map((featureNode) => (
                  <TreeItem
                    key={featureNode.id}
                    nodeId={featureNode.id.toString()}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Checkbox
                          checked={
                            selectedPermissions[moduleNode.id]?.features[featureNode.id]?.checked ||
                            false
                          }
                          indeterminate={
                            selectedPermissions[moduleNode.id]?.features[featureNode.id]
                              ?.indeterminate || false
                          }
                          onChange={(e) => {
                            const newSelected = JSON.parse(JSON.stringify(selectedPermissions));
                            newSelected[moduleNode.id].features[featureNode.id].checked =
                              e.target.checked;
                            featureNode.actions.forEach((action) => {
                              newSelected[moduleNode.id].features[featureNode.id].actions[
                                action.id
                              ] = e.target.checked;
                            });
                            handlePermissionChange(newSelected);
                          }}
                          disabled={!can('role_permissions', 'update')}
                        />
                        <Typography variant="body1">{featureNode.name}</Typography>
                      </Box>
                    }
                  >
                    <FormGroup sx={{ ml: 4 }}>
                      {featureNode.actions?.map((action) => (
                        <FormControlLabel
                          key={action.id}
                          control={
                            <Checkbox
                              checked={
                                selectedPermissions[moduleNode.id]?.features[featureNode.id]
                                  ?.actions[action.id] || false
                              }
                              onChange={(e) => {
                                const newSelected = JSON.parse(JSON.stringify(selectedPermissions));
                                newSelected[moduleNode.id].features[featureNode.id].actions[
                                  action.id
                                ] = e.target.checked;
                                handlePermissionChange(newSelected);
                              }}
                              disabled={!can('role_permissions', 'update')}
                            />
                          }
                          label={action.key}
                          sx={{ display: 'block' }}
                        />
                      ))}
                    </FormGroup>
                  </TreeItem>
                ))}
              </TreeItem>
            ))}
          </TreeView>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={setRolePermissionsMutation.isLoading || !can('role_permissions', 'update')}
            sx={{ mt: 3 }}
          >
            {setRolePermissionsMutation.isLoading ? (
              <CircularProgress size={24} />
            ) : (
              'Salvar Permissões'
            )}
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default RolePermissionManagementPage;

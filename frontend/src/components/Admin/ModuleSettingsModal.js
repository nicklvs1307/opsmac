import React from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormGroup,
  FormControlLabel,
  Checkbox,
  CircularProgress,
  Box,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import usePermissions from '@/hooks/usePermissions';

const ModuleSettingsModal = ({
  isOpen,
  onClose,
  editingRestaurant,
  allModules, // Recebe todos os módulos possíveis (array de objetos)
  selectedModuleStates, // Recebe o estado dos módulos (objeto aninhado)
  setSelectedModuleStates, // Função para atualizar o estado dos módulos
  onSaveModules,
  loading,
}) => {
  const { t } = useTranslation();
  const { can } = usePermissions(); // Destructure can from usePermissions

  const handleModuleChange = (path, checked) => {
    setSelectedModuleStates((prevStates) => {
      const newStates = JSON.parse(JSON.stringify(prevStates)); // Deep copy

      let current = newStates;
      for (let i = 0; i < path.length; i++) {
        const id = path[i];
        if (i === path.length - 1) {
          // This is the target item (module, submodule, or feature)
          if (path.length === 3) { // It's a feature
            current[id] = checked;
          } else { // It's a module or submodule
            current[id].checked = checked;
            // If a module/submodule is unchecked, uncheck all its children
            if (!checked) {
              if (current[id].submodules) {
                Object.values(current[id].submodules).forEach(sub => {
                  sub.checked = false;
                  Object.values(sub.features).forEach(feat => feat = false);
                });
              }
              if (current[id].features) {
                Object.values(current[id].features).forEach(feat => feat = false);
              }
            }
          }
        } else {
          if (path.length === 3 && i === 1) { // Navigating to feature within submodule
            current = current[id].features;
          } else {
            current = current[id].submodules || current[id].features || current[id];
          }
        }
      }

      // Now, update parent states (checked and indeterminate)
      const updateParentStates = (states, currentPath) => {
        if (currentPath.length === 0) return;

        const parentPath = currentPath.slice(0, -1);
        const parentId = parentPath[parentPath.length - 1];
        let parentNode = newStates;
        for (let i = 0; i < parentPath.length; i++) {
          const id = parentPath[i];
          if (i === parentPath.length - 1) {
            parentNode = parentNode[id];
          } else {
            parentNode = parentNode[id].submodules || parentNode[id].features || parentNode[id];
          }
        }

        let allChildrenChecked = true;
        let anyChildChecked = false;

        const children = path.length === 3 && currentPath.length === 3 ? Object.values(parentNode) :
                         path.length === 2 && currentPath.length === 2 ? Object.values(parentNode.features) :
                         Object.values(parentNode.submodules || parentNode.features || {});

        children.forEach(child => {
          const childChecked = typeof child === 'boolean' ? child : child.checked;
          if (!childChecked) allChildrenChecked = false;
          if (childChecked || (typeof child !== 'boolean' && child.indeterminate)) anyChildChecked = true;
        });

        if (parentNode) {
          parentNode.checked = allChildrenChecked;
          parentNode.indeterminate = !allChildrenChecked && anyChildChecked;
        }
        updateParentStates(states, parentPath);
      };

      updateParentStates(newStates, path);

      return newStates;
    });
  };

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {t('admin_dashboard.manage_modules_for', { name: editingRestaurant?.name })}
      </DialogTitle>
      <DialogContent dividers>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <FormGroup>
            {allModules.map((module) => {
              const moduleState = selectedModuleStates[module.id] || {};
              return (
                <Box key={module.id} sx={{ mb: 1 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={moduleState.checked || false}
                        indeterminate={moduleState.indeterminate || false}
                        onChange={() => handleModuleChange([module.id], !moduleState.checked)}
                        name={String(module.id)}
                        disabled={!can('modules', 'manage')}
                      />
                    }
                    label={<Typography variant="h6">{module.displayName}</Typography>}
                  />
                  <Box sx={{ pl: 4 }}>
                    {module.submodules?.map((submodule) => {
                      const submoduleState = moduleState.submodules?.[submodule.id] || {};
                      return (
                        <Box key={submodule.id} sx={{ mb: 1 }}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={submoduleState.checked || false}
                                indeterminate={submoduleState.indeterminate || false}
                                onChange={() => handleModuleChange([module.id, submodule.id], !submoduleState.checked)}
                                name={`${module.id}-${submodule.id}`}
                                disabled={!can('modules', 'manage')}
                              />
                            }
                            label={<Typography variant="subtitle1">{submodule.displayName}</Typography>}
                          />
                          <Box sx={{ pl: 4 }}>
                            {submodule.features?.map((feature) => {
                              const featureChecked = submoduleState.features?.[feature.id] || false;
                              return (
                                <FormControlLabel
                                  key={feature.id}
                                  control={
                                    <Checkbox
                                      checked={featureChecked}
                                      onChange={() => handleModuleChange([module.id, submodule.id, feature.id], !featureChecked)}
                                      name={`${module.id}-${submodule.id}-${feature.id}`}
                                      disabled={!can('modules', 'manage')}
                                    />
                                  }
                                  label={<Typography variant="body2">{feature.displayName}</Typography>}
                                />
                              );
                            })}
                          </Box>
                        </Box>
                      );
                    })}
                    {module.features?.map((feature) => { // Direct features under module
                      const featureChecked = moduleState.features?.[feature.id] || false;
                      return (
                        <FormControlLabel
                          key={feature.id}
                          control={
                            <Checkbox
                              checked={featureChecked}
                              onChange={() => handleModuleChange([module.id, feature.id], !featureChecked)}
                              name={`${module.id}-${feature.id}`}
                              disabled={!can('modules', 'manage')}
                            />
                          }
                          label={<Typography variant="body2">{feature.displayName}</Typography>}
                        />
                      );
                    })}
                  </Box>
                </Box>
              );
            })}
          </FormGroup>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          {t('common.cancel')}
        </Button>
        <Button
          onClick={onSaveModules}
          variant="contained"
          disabled={loading || !can('modules', 'manage')}
        >
          {loading ? <CircularProgress size={24} /> : t('common.save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ModuleSettingsModal;

import React from 'react';
import {
  Button, Dialog, DialogTitle, DialogContent, DialogActions,
  FormGroup, FormControlLabel, Checkbox, CircularProgress, Box
} from '@mui/material';
import { useTranslation } from 'react-i18next';

const ModuleSettingsModal = ({
  isOpen,
  onClose,
  editingRestaurant,
  allModules, // Recebe todos os módulos possíveis (array de objetos)
  selectedModuleIds, // Recebe os IDs dos módulos selecionados (array de números)
  setSelectedModuleIds, // Função para atualizar os IDs selecionados
  onSaveModules,
  loading
}) => {
  const { t } = useTranslation();

  const handleModuleChange = (event) => {
    const moduleId = parseInt(event.target.name, 10);
    if (event.target.checked) {
      setSelectedModuleIds((prev) => [...prev, moduleId]);
    } else {
      setSelectedModuleIds((prev) => prev.filter((id) => id !== moduleId));
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t('admin_dashboard.manage_modules_for', { name: editingRestaurant?.name })}</DialogTitle>
      <DialogContent dividers>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <FormGroup>
            {allModules.map((module) => (
              <FormControlLabel
                key={module.id}
                control={
                  <Checkbox
                    checked={selectedModuleIds.includes(module.id)}
                    onChange={handleModuleChange}
                    name={String(module.id)} // O nome agora é o ID do módulo
                  />
                }
                label={module.displayName} // Usa o displayName para o texto
              />
            ))}
          </FormGroup>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>{t('common.cancel')}</Button>
        <Button onClick={onSaveModules} variant="contained" disabled={loading}>
          {loading ? <CircularProgress size={24} /> : t('common.save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ModuleSettingsModal;
import React from 'react';
import {
  Button, Dialog, DialogTitle, DialogContent, DialogActions,
  FormGroup, FormControlLabel, Checkbox
} from '@mui/material';
import { useTranslation } from 'react-i18next';

const ModuleSettingsModal = ({
  isOpen,
  onClose,
  editingRestaurant,
  availableModules,
  selectedModules,
  onSaveModules,
  setSelectedModules,
}) => {
  const { t } = useTranslation();

  const handleModuleChange = (event) => {
    const moduleName = event.target.name;
    if (event.target.checked) {
      setSelectedModules((prev) => [...prev, moduleName]);
    } else {
      setSelectedModules((prev) => prev.filter((m) => m !== moduleName));
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose}>
      <DialogTitle>{t('admin_dashboard.manage_modules_for', { name: editingRestaurant?.name })}</DialogTitle>
      <DialogContent>
        <FormGroup>
          {availableModules.map((moduleName) => (
            <FormControlLabel
              key={moduleName}
              control={
                <Checkbox
                  checked={selectedModules.includes(moduleName)}
                  onChange={handleModuleChange}
                  name={moduleName}
                />
              }
              label={t(`modules.${moduleName}`)}
            />
          ))}
        </FormGroup>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('common.cancel')}</Button>
        <Button onClick={onSaveModules} variant="contained">{t('common.save')}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ModuleSettingsModal;

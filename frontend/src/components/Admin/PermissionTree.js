import React from 'react';
import { Box, Typography, FormControlLabel, Checkbox, FormGroup } from '@mui/material';

// Helper function to update parent checkbox states (checked/indeterminate)
const updateParentStates = (
  newSelected,
  moduleId,
  submoduleId = null,
  featureId = null,
  actionId = null
) => {
  let currentModule = newSelected[moduleId];

  // If an action was changed, update its parent feature
  if (actionId !== null && featureId !== null) {
    let currentFeature;
    if (submoduleId !== null) {
      currentFeature = currentModule.submodules[submoduleId].features[featureId];
    } else {
      currentFeature = currentModule.features[featureId];
    }

    const totalActions = Object.keys(currentFeature.actions).length;
    const checkedActions = Object.values(currentFeature.actions).filter(Boolean).length;

    if (checkedActions === 0) {
      currentFeature.checked = false;
      currentFeature.indeterminate = false;
    } else if (checkedActions === totalActions) {
      currentFeature.checked = true;
      currentFeature.indeterminate = false;
    } else {
      currentFeature.checked = false;
      currentFeature.indeterminate = true;
    }
  }

  // If a feature or feature's action was changed, update its parent submodule (if exists)
  if (featureId !== null && submoduleId !== null) {
    let currentSubmodule = currentModule.submodules[submoduleId];
    const totalFeaturesInSubmodule = Object.keys(currentSubmodule.features).length;
    let checkedFeaturesInSubmodule = 0;
    let indeterminateFeaturesInSubmodule = 0;

    Object.values(currentSubmodule.features).forEach((feat) => {
      if (feat.checked) checkedFeaturesInSubmodule++;
      if (feat.indeterminate) indeterminateFeaturesInSubmodule++;
    });

    if (checkedFeaturesInSubmodule === 0 && indeterminateFeaturesInSubmodule === 0) {
      currentSubmodule.checked = false;
      currentSubmodule.indeterminate = false;
    } else if (
      checkedFeaturesInSubmodule === totalFeaturesInSubmodule &&
      indeterminateFeaturesInSubmodule === 0
    ) {
      currentSubmodule.checked = true;
      currentSubmodule.indeterminate = false;
    } else {
      currentSubmodule.checked = false;
      currentSubmodule.indeterminate = true;
    }
  }

  // Update parent module
  const totalFeaturesInModule = Object.keys(currentModule.features).length;
  const totalSubmodulesInModule = Object.keys(currentModule.submodules).length;
  let checkedFeaturesInModule = 0;
  let indeterminateFeaturesInModule = 0;

  Object.values(currentModule.features).forEach((feat) => {
    if (feat.checked) checkedFeaturesInModule++;
    if (feat.indeterminate) indeterminateFeaturesInModule++;
  });

  Object.values(currentModule.submodules).forEach((submod) => {
    if (submod.checked) checkedFeaturesInModule++; // Treat submodule as a single checked item for module's state
    if (submod.indeterminate) indeterminateFeaturesInModule++;
  });

  const totalItemsForModule = totalFeaturesInModule + totalSubmodulesInModule;

  if (checkedFeaturesInModule === 0 && indeterminateFeaturesInModule === 0) {
    currentModule.checked = false;
    currentModule.indeterminate = false;
  } else if (
    checkedFeaturesInModule === totalItemsForModule &&
    indeterminateFeaturesInModule === 0
  ) {
    currentModule.checked = true;
    currentModule.indeterminate = false;
  } else {
    currentModule.checked = false;
    currentModule.indeterminate = true;
  }
};

const PermissionTree = ({ availableModules, selectedModules, onSelectionChange, disabled }) => {
  return (
    <FormGroup>
      {availableModules?.map((module) => (
        <Box key={module.id} sx={{ mb: 2, border: '1px solid #eee', borderRadius: '8px', p: 2 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={selectedModules[module.id]?.checked || false}
                indeterminate={selectedModules[module.id]?.indeterminate || false}
                onChange={(e) => {
                  const newSelected = JSON.parse(JSON.stringify(selectedModules));
                  newSelected[module.id].checked = e.target.checked;
                  // Set all features and their actions within this module
                  module.features.forEach((feature) => {
                    newSelected[module.id].features[feature.id].checked = e.target.checked;
                    feature.actions.forEach((action) => {
                      newSelected[module.id].features[feature.id].actions[action.id] =
                        e.target.checked;
                    });
                  });
                  module.submodules.forEach((submodule) => {
                    newSelected[module.id].submodules[submodule.id].checked = e.target.checked;
                    submodule.features.forEach((feature) => {
                      newSelected[module.id].submodules[submodule.id].features[feature.id].checked =
                        e.target.checked;
                      feature.actions.forEach((action) => {
                        newSelected[module.id].submodules[submodule.id].features[
                          feature.id
                        ].actions[action.id] = e.target.checked;
                      });
                    });
                  });
                  updateParentStates(newSelected, module.id); // Update module's own state based on children
                  onSelectionChange(newSelected);
                }}
                disabled={disabled}
              />
            }
            label={<Typography variant="h6">{module.name}</Typography>}
          />
          <Box sx={{ ml: 3 }}>
            {module.features?.map((feature) => (
              <Box key={feature.id} sx={{ ml: 3, mt: 1, borderLeft: '1px solid #eee', pl: 2 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectedModules[module.id]?.features[feature.id]?.checked || false}
                      indeterminate={
                        selectedModules[module.id]?.features[feature.id]?.indeterminate || false
                      }
                      onChange={(e) => {
                        const newSelected = JSON.parse(JSON.stringify(selectedModules));
                        newSelected[module.id].features[feature.id].checked = e.target.checked;
                        feature.actions.forEach((action) => {
                          newSelected[module.id].features[feature.id].actions[action.id] =
                            e.target.checked;
                        });
                        updateParentStates(newSelected, module.id, null, feature.id);
                        onSelectionChange(newSelected);
                      }}
                      disabled={disabled}
                    />
                  }
                  label={<Typography variant="subtitle1">{feature.name}</Typography>}
                  sx={{ display: 'block' }}
                />
                <FormGroup sx={{ ml: 4 }}>
                  {feature.actions?.map((action) => (
                    <FormControlLabel
                      key={action.id}
                      control={
                        <Checkbox
                          checked={
                            selectedModules[module.id]?.features[feature.id]?.actions[action.id] ||
                            false
                          }
                          onChange={(e) => {
                            const newSelected = JSON.parse(JSON.stringify(selectedModules));
                            newSelected[module.id].features[feature.id].actions[action.id] =
                              e.target.checked;
                            updateParentStates(newSelected, module.id, null, feature.id, action.id);
                            onSelectionChange(newSelected);
                          }}
                          disabled={disabled}
                        />
                      }
                      label={action.key}
                      sx={{ display: 'block' }}
                    />
                  ))}
                </FormGroup>
              </Box>
            ))}
            {module.submodules?.map((submodule) => (
              <Box key={submodule.id} sx={{ ml: 2, mt: 1, borderLeft: '2px solid #ddd', pl: 2 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={
                        selectedModules[module.id]?.submodules[submodule.id]?.checked || false
                      }
                      indeterminate={
                        selectedModules[module.id]?.submodules[submodule.id]?.indeterminate || false
                      }
                      onChange={(e) => {
                        const newSelected = JSON.parse(JSON.stringify(selectedModules));
                        newSelected[module.id].submodules[submodule.id].checked = e.target.checked;
                        submodule.features.forEach((feature) => {
                          newSelected[module.id].submodules[submodule.id].features[
                            feature.id
                          ].checked = e.target.checked;
                          feature.actions.forEach((action) => {
                            newSelected[module.id].submodules[submodule.id].features[
                              feature.id
                            ].actions[action.id] = e.target.checked;
                          });
                        });
                        updateParentStates(newSelected, module.id, submodule.id);
                        onSelectionChange(newSelected);
                      }}
                      disabled={disabled}
                    />
                  }
                  label={<Typography variant="subtitle1">{submodule.name}</Typography>}
                />
                <FormGroup sx={{ ml: 4 }}>
                  {submodule.features?.map((feature) => (
                    <Box
                      key={feature.id}
                      sx={{ ml: 3, mt: 1, borderLeft: '1px solid #eee', pl: 2 }}
                    >
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={
                              selectedModules[module.id]?.submodules[submodule.id]?.features[
                                feature.id
                              ]?.checked || false
                            }
                            indeterminate={
                              selectedModules[module.id]?.submodules[submodule.id]?.features[
                                feature.id
                              ]?.indeterminate || false
                            }
                            onChange={(e) => {
                              const newSelected = JSON.parse(JSON.stringify(selectedModules));
                              newSelected[module.id].submodules[submodule.id].features[
                                feature.id
                              ].checked = e.target.checked;
                              feature.actions.forEach((action) => {
                                newSelected[module.id].submodules[submodule.id].features[
                                  feature.id
                                ].actions[action.id] = e.target.checked;
                              });
                              updateParentStates(newSelected, module.id, submodule.id, feature.id);
                              onSelectionChange(newSelected);
                            }}
                            disabled={disabled}
                          />
                        }
                        label={<Typography variant="subtitle2">{feature.name}</Typography>}
                        sx={{ display: 'block' }}
                      />
                      <FormGroup sx={{ ml: 4 }}>
                        {feature.actions?.map((action) => (
                          <FormControlLabel
                            key={action.id}
                            control={
                              <Checkbox
                                checked={
                                  selectedModules[module.id]?.submodules[submodule.id]?.features[
                                    feature.id
                                  ]?.actions[action.id] || false
                                }
                                onChange={(e) => {
                                  const newSelected = JSON.parse(JSON.stringify(selectedModules));
                                  newSelected[module.id].submodules[submodule.id].features[
                                    feature.id
                                  ].actions[action.id] = e.target.checked;
                                  updateParentStates(
                                    newSelected,
                                    module.id,
                                    submodule.id,
                                    feature.id,
                                    action.id
                                  );
                                  onSelectionChange(newSelected);
                                }}
                                disabled={disabled}
                              />
                            }
                            label={action.key}
                            sx={{ display: 'block' }}
                          />
                        ))}
                      </FormGroup>
                    </Box>
                  ))}
                </FormGroup>
              </Box>
            ))}
          </Box>
        </Box>
      ))}
    </FormGroup>
  );
};

export default PermissionTree;

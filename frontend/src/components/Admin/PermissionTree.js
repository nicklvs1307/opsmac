import React from 'react';
import {
  Box,
  Typography,
  Checkbox,
  FormGroup,
  FormControlLabel,
} from '@mui/material';
import { TreeView, TreeItem } from '@mui/x-tree-view';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

const PermissionTree = ({ availableModules, selectedPermissions, onPermissionChange, disabled }) => {
  if (!availableModules) {
    console.log('PermissionTree Debug: availableModules is null or undefined', availableModules);
    return null;
  }

  console.log('PermissionTree Debug: availableModules', availableModules);

  const renderTree = (modules) => {
    return modules.map(moduleNode => (
      <TreeItem
        key={moduleNode.id}
        nodeId={moduleNode.id.toString()}
        label={
          <FormControlLabel
            control={
              <Checkbox
                checked={selectedPermissions[moduleNode.id]?.checked || false}
                indeterminate={selectedPermissions[moduleNode.id]?.indeterminate || false}
                onChange={(e) => onPermissionChange([moduleNode.id], e.target.checked)}
                disabled={disabled}
              />
            }
            label={moduleNode.name}
          />
        }
      >
                {moduleNode.submodules?.map(submoduleNode => (
          <TreeItem
            key={submoduleNode.id}
            nodeId={`${moduleNode.id}-${submoduleNode.id}`}
            label={
              <FormControlLabel
                control={
                  <Checkbox
                    checked={selectedPermissions[moduleNode.id]?.submodules[submoduleNode.id]?.checked || false}
                    indeterminate={selectedPermissions[moduleNode.id]?.submodules[submoduleNode.id]?.indeterminate || false}
                    onChange={(e) => onPermissionChange([moduleNode.id, submoduleNode.id], e.target.checked)}
                    disabled={disabled}
                  />
                }
                label={submoduleNode.name}
              />
            }
          >
                        {submoduleNode.features?.map(featureNode => (
              <TreeItem
                key={featureNode.id}
                nodeId={`${moduleNode.id}-${submoduleNode.id}-${featureNode.id}`}
                label={featureNode.name}
              >
                {/* Actions will be re-added later */}
              </TreeItem>
            ))}
          </TreeItem>
        ))}
      </TreeItem>
    ));
  };

  return (
    <TreeView
      defaultCollapseIcon={<ExpandMoreIcon />}
      defaultExpandIcon={<ChevronRightIcon />}
      sx={{ flexGrow: 1, overflowY: 'auto' }}
    >
      {renderTree(availableModules)}
    </TreeView>
  );
};

export default PermissionTree;
                      
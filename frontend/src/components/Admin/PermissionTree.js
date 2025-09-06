import React from 'react';
import {
  Box,
  Typography,
  Checkbox,
  FormGroup,
  FormControlLabel,
} from '@mui/material';
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import { TreeItem } from '@mui/x-tree-view/TreeItem';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

const PermissionTree = ({ availableModules, selectedPermissions, onPermissionChange, disabled }) => {
  if (!availableModules) {
    return null;
  }

  const renderTree = (modules) => {
    return modules.map((moduleNode, index) => (
      <TreeItem
        key={moduleNode.id || `module-${index}`}
        itemId={moduleNode.id ? moduleNode.id.toString() : `module-${index}`}
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
                {moduleNode.submodules?.map((submoduleNode, subIndex) => (
          <TreeItem
            key={submoduleNode.id || `submodule-${moduleNode.id}-${subIndex}`}
            itemId={submoduleNode.id ? `${moduleNode.id}-${submoduleNode.id}` : `submodule-${moduleNode.id}-${subIndex}`}
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
                        {submoduleNode.features?.map((featureNode, featureIndex) => (
              <TreeItem
                key={featureNode.id || `feature-${moduleNode.id}-${submoduleNode.id}-${featureIndex}`}
                itemId={featureNode.id ? `${moduleNode.id}-${submoduleNode.id}-${featureNode.id}` : `feature-${moduleNode.id}-${submoduleNode.id}-${featureIndex}`}
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
    <SimpleTreeView
      defaultCollapseIcon={<ExpandMoreIcon />}
      defaultExpandIcon={<ChevronRightIcon />}
      sx={{ flexGrow: 1, overflowY: 'auto' }}
    >
      {renderTree(availableModules)}
    </SimpleTreeView>
  );
};

export default PermissionTree;
                      
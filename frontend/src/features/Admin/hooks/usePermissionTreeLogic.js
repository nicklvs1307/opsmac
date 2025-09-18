import { useState, useCallback, useEffect } from 'react';

export const usePermissionTreeLogic = (permissionTree, fetchedPermissions) => {
  const [selectedPermissions, setSelectedPermissions] = useState({});

  const updateParentStates = useCallback((permissions, tree) => {
    if (!tree || !tree.modules) return permissions;
    const newSelected = JSON.parse(JSON.stringify(permissions));

    tree.modules.forEach((module) => {
      let moduleChecked = true;
      let moduleIndeterminate = false;

      module.submodules.forEach((submodule) => {
        let submoduleChecked = true;
        let submoduleIndeterminate = false;

        submodule.features.forEach((feature) => {
          const featureActions =
            newSelected[module.id]?.submodules[submodule.id]?.features[feature.id]?.actions || {};
          const actionKeys = Object.keys(featureActions);
          const checkedCount = actionKeys.filter((key) => featureActions[key]).length;

          const featureState = newSelected[module.id].submodules[submodule.id].features[feature.id];
          featureState.checked = actionKeys.length > 0 && checkedCount === actionKeys.length;
          featureState.indeterminate = checkedCount > 0 && checkedCount < actionKeys.length;

          if (!featureState.checked) submoduleChecked = false;
          if (featureState.indeterminate || featureState.checked) submoduleIndeterminate = true;
        });

        const subState = newSelected[module.id].submodules[submodule.id];
        subState.checked = submoduleChecked;
        subState.indeterminate = !submoduleChecked && submoduleIndeterminate;

        if (!subState.checked) moduleChecked = false;
        if (subState.indeterminate || subState.checked) moduleIndeterminate = true;
      });

      const modState = newSelected[module.id];
      modState.checked = moduleChecked;
      modState.indeterminate = !moduleChecked && moduleIndeterminate;
    });

    return newSelected;
  }, []);

  const handlePermissionChange = useCallback((path, checked) => {
    setSelectedPermissions((prevSelected) => {
      let newSelected = JSON.parse(JSON.stringify(prevSelected));
      const [moduleId, submoduleId, featureId, actionId] = path;

      const setChildrenState = (branch, value) => {
        branch.checked = value;
        if (branch.actions) {
          Object.keys(branch.actions).forEach((key) => {
            branch.actions[key] = value;
          });
        }
        if (branch.features) {
          Object.values(branch.features).forEach((feat) => setChildrenState(feat, value));
        }
        if (branch.submodules) {
          Object.values(branch.submodules).forEach((sub) => setChildrenState(sub, value));
        }
      };

      if (actionId) {
        newSelected[moduleId].submodules[submoduleId].features[featureId].actions[actionId] = checked;
      } else if (featureId) {
        setChildrenState(newSelected[moduleId].submodules[submoduleId].features[featureId], checked);
      } else if (submoduleId) {
        setChildrenState(newSelected[moduleId].submodules[submoduleId], checked);
      } else if (moduleId) {
        setChildrenState(newSelected[moduleId], checked);
      }

      const updatedState = updateParentStates(newSelected, permissionTree);
      return updatedState;
    });
  }, [permissionTree, updateParentStates]);

  useEffect(() => {
    if (fetchedPermissions && permissionTree) {
      // This part needs to be adapted based on how fetchedPermissions is structured
      // For UserEditPage, fetchedPermissions is fetchedUserOverrides
      // For RolePermissionManagementPage, fetchedPermissions is fetchedRolePermissions
      // The logic to initialize initialSelected will vary slightly.

      let initialSelected = {};
      // Example for UserEditPage (assuming fetchedPermissions is fetchedUserOverrides)
      // const entitlementMap = new Map(
      //   fetchedPermissions.map((e) => [`${e.featureId}-${e.actionId}`, e.allowed])
      // );

      permissionTree.modules?.forEach((module) => {
        initialSelected[module.id] = {
          checked: false,
          indeterminate: false,
          submodules: module.submodules?.reduce((accSub, submodule) => {
            accSub[submodule.id] = {
              checked: false,
              indeterminate: false,
              features: submodule.features?.reduce((accFeat, feature) => {
                accFeat[feature.id] = {
                  checked: false,
                  indeterminate: false,
                  actions: feature.actions?.reduce((accAct, action) => {
                    // This part needs to be dynamic based on fetchedPermissions structure
                    // For UserEditPage:
                    // const override = fetchedPermissions.find(
                    //   (o) => o.featureId === feature.id && o.actionId === action.id
                    // );
                    // accAct[action.id] = override ? override.allowed : false;

                    // For RolePermissionManagementPage:
                    // const rolePerm = fetchedPermissions.find(
                    //   (rp) => rp.featureId === feature.id && rp.actionId === action.id
                    // );
                    // accAct[action.id] = rolePerm ? rolePerm.allowed : false;

                    // For now, a generic placeholder:
                    accAct[action.id] = false; // Default to false
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
      const updatedState = updateParentStates(initialSelected, permissionTree);
      setSelectedPermissions(updatedState);
    }
  }, [fetchedPermissions, permissionTree, updateParentStates]);

  return { selectedPermissions, handlePermissionChange };
};
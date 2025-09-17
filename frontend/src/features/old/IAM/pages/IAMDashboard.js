import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/app/providers/contexts/AuthContext';
import usePermissions from '@/hooks/usePermissions';

const IAMDashboard = () => {
  const { selectedRestaurantId } = useAuth();
  const { can } = usePermissions();

  if (!selectedRestaurantId) {
    return <div>Please select a restaurant to manage IAM settings.</div>;
  }

  return (
    <div>
      <h1>IAM Administration for Restaurant: {selectedRestaurantId}</h1>
      <p>Manage roles, permissions, and user access for this restaurant.</p>

      <h2>Management Sections:</h2>
      <ul>
        {can('roles', 'read') && (
          <li>
            <Link to={`/admin/iam/${selectedRestaurantId}/roles`}>Manage Roles</Link>
          </li>
        )}
        {can('entitlements', 'read') && (
          <li>
            <Link to={`/admin/iam/${selectedRestaurantId}/entitlements`}>Manage Entitlements</Link>
          </li>
        )}
        {can('user_roles', 'read') && ( // Assuming user_roles read permission covers user role assignments
          <li>
            <Link to={`/admin/iam/${selectedRestaurantId}/users`}>
              Manage User Roles & Overrides
            </Link>
          </li>
        )}
        {/* Add more links as components are built */}
      </ul>
    </div>
  );
};

export default IAMDashboard;

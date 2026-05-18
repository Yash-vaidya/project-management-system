/**
 * usePermissions — tiny hook for checking & managing user permissions.
 *
 * Usage:
 *   const { can, grant, revoke, permissions, rolePermissions } = usePermissions(user);
 *   can('edit_task_sheet')   → boolean
 *   grant('edit_task_sheet')  → returns new Set
 *   revoke('delete_project')  → returns new Set
 */

import { useState, useMemo } from 'react';
import { defaultRolePermissions } from './PermissionsContext';

export function usePermissions(user) {
  const resolvedPermissions = useMemo(() => {
    // 1. Start with per-user permission overrides (most specific)
    if (user?.permissions && Array.isArray(user.permissions)) {
      return new Set(user.permissions);
    }

    // 2. Fall back to role defaults
    if (user?.role && defaultRolePermissions[user.role]) {
      return new Set(defaultRolePermissions[user.role]);
    }

    // 3. Ultimate fallback: Member
    return new Set(defaultRolePermissions.Member);
  }, [user]);

  const [permissions, setPermissions] = useState(resolvedPermissions);

  /** Whether user has a specific permission */
  const can = (permKey) => permissions.has(permKey);

  /** Add permission */
  const grant = (permKey) => {
    const next = new Set(permissions);
    if (!next.has(permKey)) next.add(permKey);
    setPermissions(next);
    return next;
  };

  /** Remove permission */
  const revoke = (permKey) => {
    const next = new Set(permissions);
    next.delete(permKey);
    setPermissions(next);
    return next;
  };

  /** Reset to default role set */
  const resetToRoleDefaults = () => {
    const rolePerms = user?.role && defaultRolePermissions[user.role]
      ? new Set(defaultRolePermissions[user.role])
      : new Set(defaultRolePermissions.Member);
    setPermissions(rolePerms);
    return rolePerms;
  };

  /** Get all current permissions as array */
  const list = () => [...permissions];

  return { can, grant, revoke, resetToRoleDefaults, permissions, list };
}

export default usePermissions;

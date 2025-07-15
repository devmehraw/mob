import { User } from '../types/auth'; // Adjust path

// Define permissions for each role
const ROLE_PERMISSIONS: Record<string, { resource: string; actions: string[] }[]> = {
  admin: [
    { resource: 'leads', actions: ['create', 'read', 'update', 'delete', 'assign'] },
    { resource: 'agents', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'analytics', actions: ['read', 'export'] },
    { resource: 'reports', actions: ['read', 'export', 'create'] },
    { resource: 'settings', actions: ['read', 'update'] },
    { resource: 'users', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'calendar', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'communications', actions: ['create', 'read', 'update', 'delete'] },
  ],
  agent: [
    { resource: 'leads', actions: ['create', 'read', 'update'] }, // No assign permission
    { resource: 'analytics', actions: ['read'] }, // Only own data
    { resource: 'reports', actions: ['read'] }, // Only own data
    { resource: 'calendar', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'communications', actions: ['create', 'read', 'update'] },
  ],
};

export class PermissionService {
  private static instance: PermissionService;

  static getInstance(): PermissionService {
    if (!PermissionService.instance) {
      PermissionService.instance = new PermissionService();
    }
    return PermissionService.instance;
  }

  /**
   * Checks if a user has a specific permission.
   * @param user The authenticated user object.
   * @param resource The resource (e.g., 'leads', 'users').
   * @param action The action (e.g., 'read', 'create', 'update', 'delete', 'assign').
   * @returns True if the user has the permission, false otherwise.
   */
  hasPermission(user: User | null, resource: string, action: string): boolean {
    if (!user) {
      return false;
    }

    const rolePermissions = ROLE_PERMISSIONS[user.role];
    if (!rolePermissions) {
      return false; // Role not found
    }

    // Check if the user's role has access to the specified resource and action
    const resourcePermission = rolePermissions.find(p => p.resource === resource);
    if (resourcePermission && resourcePermission.actions.includes(action)) {
      return true;
    }

    return false;
  }

  /**
   * Checks if the user is an admin.
   * @param user The authenticated user object.
   * @returns True if the user's role is 'admin', false otherwise.
   */
  isAdmin(user: User | null): boolean {
    return user?.role === 'admin';
  }

  // You can add other utility methods here if needed, e.g., to get allowed statuses, etc.
}
import { User, Role, Permission } from '@prisma/client';

export type UserWithRole = User & {
  role: Role;
};

export type RoleWithPermissions = Role & {
  permissions: Permission[];
};

export type PermissionWithRole = Permission & {
  role: Role;
};

// DTOs (Data Transfer Objects)
export interface CreateUserDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  roleId: string;
}

export interface UpdateUserDto {
  email?: string;
  firstName?: string;
  lastName?: string;
  roleId?: string;
  isActive?: boolean;
}

export interface CreateRoleDto {
  name: string;
  description: string;
  isDefault?: boolean;
}

export interface UpdateRoleDto {
  name?: string;
  description?: string;
  isDefault?: boolean;
}

export interface CreatePermissionDto {
  module: string;
  actions: string[];
  roleId: string;
}

export interface UpdatePermissionDto {
  module?: string;
  actions?: string[];
  roleId?: string;
} 
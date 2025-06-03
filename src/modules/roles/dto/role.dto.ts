import { z } from 'zod';

const permissionSchema = z.object({
  module: z.string(),
  actions: z.array(z.string())
});

export const createRoleSchema = z.object({
  name: z.string().min(2),
  description: z.string().min(2),
  isDefault: z.boolean().optional(),
  permissions: z.array(permissionSchema).optional()
});

export const updateRoleSchema = createRoleSchema.partial();

export type CreateRoleDto = z.infer<typeof createRoleSchema>;
export type UpdateRoleDto = z.infer<typeof updateRoleSchema>;
export type PermissionDto = z.infer<typeof permissionSchema>; 
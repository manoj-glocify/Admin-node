import {z} from "zod";

export const userSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  roleId: z.string().min(2),
});

export const updateUserSchema = z.object({
  firstName: z.string().min(2).optional(),
  lastName: z.string().min(2).optional(),
  email: z.string().email().optional(),
  isActive: z.boolean().optional(),
  roleId: z.string().min(2),
});

export type UserDto = z.infer<typeof userSchema>;
export type UserUpdateDto = z.infer<typeof updateUserSchema>;

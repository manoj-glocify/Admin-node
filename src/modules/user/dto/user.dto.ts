import {z} from "zod";

export const userSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  roleId: z.string().min(2),
});

export type RegisterDto = z.infer<typeof userSchema>;
// export type LoginDto = z.infer<typeof loginSchema>;

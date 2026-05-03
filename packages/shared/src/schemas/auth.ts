import { z } from "zod";

export const signupSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  password: z.string().min(8).max(100),
  role: z.enum(["ADMIN", "MEMBER"]).default("MEMBER"),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

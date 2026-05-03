import { z } from "zod";

export const createProjectSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().max(500).optional(),
});

export const updateProjectSchema = createProjectSchema.partial();

export const addMemberSchema = z.object({
  email: z.string().email(),
  role: z.enum(["ADMIN", "MEMBER"]).default("MEMBER"),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type AddMemberInput = z.infer<typeof addMemberSchema>;

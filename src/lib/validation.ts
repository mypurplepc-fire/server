import { z } from "zod";

export const passwordSchema = z
  .string()
  .min(10, "Password must be at least 10 characters")
  .max(200, "Password is too long");

export const signupSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  password: passwordSchema,
  inviteToken: z.string().trim().optional(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
});

export const resetPasswordSchema = z.object({
  token: z.string().trim().min(1, "Reset token is required"),
  password: passwordSchema,
});

export const projectSchema = z.object({
  name: z.string().trim().min(1, "Project name is required").max(200),
  code: z
    .string()
    .trim()
    .min(1, "Project code is required")
    .max(40)
    .regex(/^[A-Za-z0-9-_]+$/, "Code may only contain letters, numbers, - and _"),
  client: z.string().trim().min(1, "Client is required").max(200),
  startDate: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Start date must be YYYY-MM-DD"),
  budgetTotal: z
    .string()
    .trim()
    .regex(/^\d+(\.\d{1,2})?$/, "Budget must be a positive number"),
  status: z.enum(["ACTIVE", "CLOSED", "ON_HOLD"]).default("ACTIVE"),
});

export const inviteSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  role: z.enum(["ADMIN", "PROJECT_MANAGER", "SITE_ENGINEER", "VIEWER"]),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type ProjectInput = z.infer<typeof projectSchema>;
export type InviteInput = z.infer<typeof inviteSchema>;

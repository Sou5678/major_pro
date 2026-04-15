import { z } from "zod";

const passwordRule =
  /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+={[}\]|:;"'<,>.?/]).{8,}$/;

export const signUpSchema = z
  .object({
    name: z.string().min(2, "Please enter your full name."),
    email: z.string().email("Enter a valid email address."),
    password: z
      .string()
      .regex(
        passwordRule,
        "Use 8+ characters with an uppercase letter, number, and special character.",
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  });

export const signInSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(1, "Password is required."),
  rememberMe: z.boolean().optional(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Enter a valid email address."),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(10, "Reset token is invalid."),
    password: z
      .string()
      .regex(
        passwordRule,
        "Use 8+ characters with an uppercase letter, number, and special character.",
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  });

export const uploadResumeSchema = z.object({
  jobTitle: z.string().max(100).optional().or(z.literal("")),
});

export const resumeEditorSchema = z.object({
  editedContent: z.record(z.string(), z.string()),
});

export const usageLimitSchema = z.object({
  freePlanLimit: z.coerce.number().int().positive().default(3),
});

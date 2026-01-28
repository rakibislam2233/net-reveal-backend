import { z } from 'zod';

export const AuthValidation = {
  register: z.object({
    fullName: z.string().min(2, 'Full name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    phoneNumber: z.string().optional(),
  }),

  login: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  }),

  refreshToken: z.object({
    refreshToken: z.string().min(1, 'Refresh token is required'),
  }),

  changePassword: z.object({
    oldPassword: z.string().min(1, 'Old password is required'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters'),
  }),

  forgotPassword: z.object({
    email: z.string().email('Invalid email address'),
  }),

  resetPassword: z.object({
    token: z.string().min(1, 'Reset token is required'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
  }),

  verifyEmail: z.object({
    token: z.string().min(1, 'Verification token is required'),
  }),
};

export type RegisterInput = z.infer<typeof AuthValidation.register>;
export type LoginInput = z.infer<typeof AuthValidation.login>;
export type RefreshTokenInput = z.infer<typeof AuthValidation.refreshToken>;
export type ChangePasswordInput = z.infer<typeof AuthValidation.changePassword>;
export type ForgotPasswordInput = z.infer<typeof AuthValidation.forgotPassword>;
export type ResetPasswordInput = z.infer<typeof AuthValidation.resetPassword>;
export type VerifyEmailInput = z.infer<typeof AuthValidation.verifyEmail>;

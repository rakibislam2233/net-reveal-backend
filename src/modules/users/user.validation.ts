import { z } from 'zod';

export const UserValidation = {
  updateProfile: z.object({
    fullName: z.string().min(2, 'Full name must be at least 2 characters').optional(),
    phoneNumber: z.string().optional(),
    profileImage: z.string().url('Invalid profile image URL').optional(),
    bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
    dateOfBirth: z.string().datetime().optional(),
  }),

  updatePreferences: z.object({
    preferredLanguage: z.string().min(2, 'Language code must be at least 2 characters').optional(),
    audioLanguage: z.string().min(2, 'Audio language code must be at least 2 characters').optional(),
    preferredGenres: z.array(z.string()).optional(),
    contentRatings: z.array(z.string()).optional(),
    autoplayNext: z.boolean().optional(),
    subtitlesEnabled: z.boolean().optional(),
    theme: z.enum(['dark', 'light']).optional(),
  }),

  getUsers: z.object({
    page: z.string().transform(Number).refine(n => n > 0, 'Page must be greater than 0').optional(),
    limit: z.string().transform(Number).refine(n => n > 0 && n <= 100, 'Limit must be between 1 and 100').optional(),
    search: z.string().optional(),
    role: z.enum(['USER', 'MODERATOR', 'ADMIN', 'SUPER_ADMIN']).optional(),
    status: z.enum(['ACTIVE', 'INACTIVE', 'BLOCKED', 'BANNED']).optional(),
    sortBy: z.enum(['createdAt', 'fullName', 'email', 'lastLogin']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  }),
};

export type UpdateProfileInput = z.infer<typeof UserValidation.updateProfile>;
export type UpdatePreferencesInput = z.infer<typeof UserValidation.updatePreferences>;
export type GetUsersInput = z.infer<typeof UserValidation.getUsers>;

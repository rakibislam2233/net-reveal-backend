export interface User {
  id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  profileImage?: string;
  bio?: string;
  dateOfBirth?: Date;
  role: string;
  status: string;
  isEmailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
  subscription?: {
    id: string;
    plan: string;
    status: string;
    maxQuality: string;
    maxDevices: number;
    downloadsEnabled: boolean;
  };
  preferences?: {
    preferredLanguage: string;
    audioLanguage: string;
    preferredGenres: string[];
    contentRatings: string[];
    autoplayNext: boolean;
    subtitlesEnabled: boolean;
    theme: string;
  };
}

export interface UpdateUserRequest {
  fullName?: string;
  phoneNumber?: string;
  profileImage?: string;
  bio?: string;
  dateOfBirth?: Date;
}

export interface UpdateUserPreferencesRequest {
  preferredLanguage?: string;
  audioLanguage?: string;
  preferredGenres?: string[];
  contentRatings?: string[];
  autoplayNext?: boolean;
  subtitlesEnabled?: boolean;
  theme?: string;
}

export interface UserListResponse {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface UserStatsResponse {
  totalUsers: number;
  activeUsers: number;
  newUsersThisMonth: number;
  usersByPlan: {
    FREE: number;
    BASIC: number;
    PREMIUM: number;
    PREMIUM_PLUS: number;
  };
  usersByRole: {
    USER: number;
    MODERATOR: number;
    ADMIN: number;
    SUPER_ADMIN: number;
  };
}

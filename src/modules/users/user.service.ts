import { 
  User, 
  UpdateUserRequest, 
  UpdateUserPreferencesRequest, 
  UserListResponse,
  UserStatsResponse 
} from '../interfaces/user.interface';

export class UserService {
  // Mock user data storage (replace with actual database operations)
  private users: Map<string, User> = new Map();
  private userPreferences: Map<string, any> = new Map();

  constructor() {
    // Initialize with some mock data
    this.initializeMockData();
  }

  private initializeMockData() {
    const mockUsers: User[] = [
      {
        id: 'user_1',
        fullName: 'John Doe',
        email: 'john@example.com',
        phoneNumber: '+1234567890',
        profileImage: 'https://example.com/profile1.jpg',
        bio: 'Movie enthusiast and tech lover',
        dateOfBirth: new Date('1990-01-01'),
        role: 'USER',
        status: 'ACTIVE',
        isEmailVerified: true,
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01'),
        lastLogin: new Date(),
        subscription: {
          id: 'sub_1',
          plan: 'PREMIUM',
          status: 'ACTIVE',
          maxQuality: 'FULL_HD',
          maxDevices: 4,
          downloadsEnabled: true,
        },
        preferences: {
          preferredLanguage: 'en',
          audioLanguage: 'en',
          preferredGenres: ['28', '12', '35'],
          contentRatings: ['PG-13', 'R'],
          autoplayNext: true,
          subtitlesEnabled: false,
          theme: 'dark',
        },
      },
      {
        id: 'user_2',
        fullName: 'Jane Smith',
        email: 'jane@example.com',
        phoneNumber: '+0987654321',
        profileImage: 'https://example.com/profile2.jpg',
        bio: 'Cinema lover and weekend binge-watcher',
        dateOfBirth: new Date('1992-05-15'),
        role: 'USER',
        status: 'ACTIVE',
        isEmailVerified: true,
        createdAt: new Date('2023-02-15'),
        updatedAt: new Date('2023-02-15'),
        lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000),
        subscription: {
          id: 'sub_2',
          plan: 'BASIC',
          status: 'ACTIVE',
          maxQuality: 'HD',
          maxDevices: 2,
          downloadsEnabled: true,
        },
        preferences: {
          preferredLanguage: 'en',
          audioLanguage: 'en',
          preferredGenres: ['18', '10749', '99'],
          contentRatings: ['PG', 'PG-13'],
          autoplayNext: false,
          subtitlesEnabled: true,
          theme: 'light',
        },
      },
      {
        id: 'user_3',
        fullName: 'Admin User',
        email: 'admin@example.com',
        role: 'ADMIN',
        status: 'ACTIVE',
        isEmailVerified: true,
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01'),
        lastLogin: new Date(Date.now() - 30 * 60 * 1000),
        subscription: {
          id: 'sub_3',
          plan: 'PREMIUM_PLUS',
          status: 'ACTIVE',
          maxQuality: '4K',
          maxDevices: 6,
          downloadsEnabled: true,
        },
      },
    ];

    mockUsers.forEach(user => {
      this.users.set(user.id, user);
      if (user.preferences) {
        this.userPreferences.set(user.id, user.preferences);
      }
    });
  }

  // Get all users with pagination and filtering
  async getUsers(params: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: string;
  }): Promise<UserListResponse> {
    try {
      const {
        page = 1,
        limit = 20,
        search,
        role,
        status,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = params;

      let users = Array.from(this.users.values());

      // Apply filters
      if (search) {
        users = users.filter(user => 
          user.fullName.toLowerCase().includes(search.toLowerCase()) ||
          user.email.toLowerCase().includes(search.toLowerCase())
        );
      }

      if (role) {
        users = users.filter(user => user.role === role);
      }

      if (status) {
        users = users.filter(user => user.status === status);
      }

      // Apply sorting
      users.sort((a, b) => {
        const aValue = a[sortBy as keyof User];
        const bValue = b[sortBy as keyof User];
        
        if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });

      // Apply pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedUsers = users.slice(startIndex, endIndex);

      return {
        users: paginatedUsers,
        pagination: {
          page,
          limit,
          total: users.length,
          totalPages: Math.ceil(users.length / limit),
        },
      };
    } catch (error: any) {
      throw new Error(`Failed to get users: ${error.message}`);
    }
  }

  // Get user by ID
  async getUserById(userId: string): Promise<User | null> {
    try {
      const user = this.users.get(userId);
      if (!user) {
        return null;
      }

      // Include preferences if available
      const preferences = this.userPreferences.get(userId);
      if (preferences) {
        user.preferences = preferences;
      }

      return user;
    } catch (error: any) {
      throw new Error(`Failed to get user: ${error.message}`);
    }
  }

  // Update user profile
  async updateUser(userId: string, updateData: UpdateUserRequest): Promise<User> {
    try {
      const user = this.users.get(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Update user data
      const updatedUser = {
        ...user,
        ...updateData,
        updatedAt: new Date(),
      };

      this.users.set(userId, updatedUser);
      return updatedUser;
    } catch (error: any) {
      throw new Error(`Failed to update user: ${error.message}`);
    }
  }

  // Update user preferences
  async updateUserPreferences(userId: string, preferencesData: UpdateUserPreferencesRequest): Promise<any> {
    try {
      const user = this.users.get(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Get existing preferences or create new ones
      const existingPreferences = this.userPreferences.get(userId) || {};
      
      // Update preferences
      const updatedPreferences = {
        ...existingPreferences,
        ...preferencesData,
      };

      this.userPreferences.set(userId, updatedPreferences);
      
      return updatedPreferences;
    } catch (error: any) {
      throw new Error(`Failed to update user preferences: ${error.message}`);
    }
  }

  // Get user preferences
  async getUserPreferences(userId: string): Promise<any> {
    try {
      const user = this.users.get(userId);
      if (!user) {
        throw new Error('User not found');
      }

      return this.userPreferences.get(userId) || {
        preferredLanguage: 'en',
        audioLanguage: 'en',
        preferredGenres: [],
        contentRatings: [],
        autoplayNext: true,
        subtitlesEnabled: false,
        theme: 'dark',
      };
    } catch (error: any) {
      throw new Error(`Failed to get user preferences: ${error.message}`);
    }
  }

  // Delete user
  async deleteUser(userId: string): Promise<boolean> {
    try {
      const user = this.users.get(userId);
      if (!user) {
        throw new Error('User not found');
      }

      this.users.delete(userId);
      this.userPreferences.delete(userId);
      
      return true;
    } catch (error: any) {
      throw new Error(`Failed to delete user: ${error.message}`);
    }
  }

  // Update user status
  async updateUserStatus(userId: string, status: string): Promise<User> {
    try {
      const user = this.users.get(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const updatedUser = {
        ...user,
        status,
        updatedAt: new Date(),
      };

      this.users.set(userId, updatedUser);
      return updatedUser;
    } catch (error: any) {
      throw new Error(`Failed to update user status: ${error.message}`);
    }
  }

  // Get user statistics
  async getUserStats(): Promise<UserStatsResponse> {
    try {
      const users = Array.from(this.users.values());
      const now = new Date();
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const stats: UserStatsResponse = {
        totalUsers: users.length,
        activeUsers: users.filter(user => user.status === 'ACTIVE').length,
        newUsersThisMonth: users.filter(user => user.createdAt >= oneMonthAgo).length,
        usersByPlan: {
          FREE: 0,
          BASIC: 0,
          PREMIUM: 0,
          PREMIUM_PLUS: 0,
        },
        usersByRole: {
          USER: 0,
          MODERATOR: 0,
          ADMIN: 0,
          SUPER_ADMIN: 0,
        },
      };

      // Count users by subscription plan
      users.forEach(user => {
        if (user.subscription) {
          const plan = user.subscription.plan as keyof typeof stats.usersByPlan;
          if (stats.usersByPlan[plan] !== undefined) {
            stats.usersByPlan[plan]++;
          }
        }

        const role = user.role as keyof typeof stats.usersByRole;
        if (stats.usersByRole[role] !== undefined) {
          stats.usersByRole[role]++;
        }
      });

      return stats;
    } catch (error: any) {
      throw new Error(`Failed to get user stats: ${error.message}`);
    }
  }

  // Search users
  async searchUsers(query: string, limit: number = 10): Promise<User[]> {
    try {
      const users = Array.from(this.users.values());
      
      const filteredUsers = users.filter(user =>
        user.fullName.toLowerCase().includes(query.toLowerCase()) ||
        user.email.toLowerCase().includes(query.toLowerCase())
      );

      return filteredUsers.slice(0, limit);
    } catch (error: any) {
      throw new Error(`Failed to search users: ${error.message}`);
    }
  }

  // Update last login
  async updateLastLogin(userId: string): Promise<void> {
    try {
      const user = this.users.get(userId);
      if (user) {
        user.lastLogin = new Date();
        this.users.set(userId, user);
      }
    } catch (error: any) {
      throw new Error(`Failed to update last login: ${error.message}`);
    }
  }
}

export const userService = new UserService();

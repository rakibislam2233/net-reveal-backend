import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import config from '../../config';
import { 
  RegisterRequest, 
  LoginRequest, 
  AuthResponse, 
  RefreshTokenRequest,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  VerifyEmailRequest,
  UserPayload,
  LoginAttempt
} from './auth.interface';

// In-memory storage for login attempts and refresh tokens (replace with database in production)
const loginAttempts = new Map<string, LoginAttempt>();
const refreshTokens = new Map<string, { userId: string; expiresAt: Date }>();
const emailVerificationTokens = new Map<string, { userId: string; expiresAt: Date }>();
const passwordResetTokens = new Map<string, { userId: string; expiresAt: Date }>();

export class AuthenticationService {
  // Generate JWT tokens
  private generateTokens(user: UserPayload) {
    const accessToken = jwt.sign(
      { userId: user.userId, email: user.email, role: user.role },
      config.jwt.accessSecret,
      { expiresIn: config.jwt.accessExpiration }
    );

    const refreshToken = jwt.sign(
      { userId: user.userId, email: user.email, role: user.role },
      config.jwt.refreshSecret,
      { expiresIn: config.jwt.refreshExpiration }
    );

    return { accessToken, refreshToken };
  }

  // Hash password
  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, config.bcrypt.saltRounds);
  }

  // Verify password
  private async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  // Check login attempts and lockout
  private checkLoginAttempts(email: string): { allowed: boolean; remaining?: number; lockedUntil?: Date } {
    const attempt = loginAttempts.get(email);
    
    if (!attempt) {
      return { allowed: true };
    }

    // Check if account is locked
    if (attempt.lockedUntil && attempt.lockedUntil > new Date()) {
      return { 
        allowed: false, 
        lockedUntil: attempt.lockedUntil 
      };
    }

    // Reset if lock period has passed
    if (attempt.lockedUntil && attempt.lockedUntil <= new Date()) {
      loginAttempts.delete(email);
      return { allowed: true };
    }

    // Check remaining attempts
    const remaining = Math.max(0, 5 - attempt.attempts);
    return { allowed: remaining > 0, remaining };
  }

  // Record failed login attempt
  private recordFailedAttempt(email: string): { locked?: Date } {
    const attempt = loginAttempts.get(email) || { attempts: 0, lastAttempt: new Date() };
    attempt.attempts += 1;
    attempt.lastAttempt = new Date();

    // Lock account after 5 failed attempts
    if (attempt.attempts >= 5) {
      attempt.lockedUntil = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes
      loginAttempts.set(email, attempt);
      return { locked: attempt.lockedUntil };
    }

    loginAttempts.set(email, attempt);
    return {};
  }

  // Clear login attempts on successful login
  private clearLoginAttempts(email: string): void {
    loginAttempts.delete(email);
  }

  // Generate email verification token
  private generateEmailVerificationToken(userId: string): string {
    const token = jwt.sign(
      { userId, type: 'email_verification' },
      config.jwt.accessSecret,
      { expiresIn: '24h' }
    );
    
    emailVerificationTokens.set(token, {
      userId,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
    });
    
    return token;
  }

  // Generate password reset token
  private generatePasswordResetToken(userId: string): string {
    const token = jwt.sign(
      { userId, type: 'password_reset' },
      config.jwt.resetPasswordSecret,
      { expiresIn: '1h' }
    );
    
    passwordResetTokens.set(token, {
      userId,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000)
    });
    
    return token;
  }

  // Verify email verification token
  private verifyEmailVerificationToken(token: string): { userId: string } | null {
    try {
      const decoded = jwt.verify(token, config.jwt.accessSecret) as any;
      
      if (decoded.type !== 'email_verification') {
        return null;
      }

      const storedToken = emailVerificationTokens.get(token);
      if (!storedToken || storedToken.expiresAt < new Date()) {
        emailVerificationTokens.delete(token);
        return null;
      }

      return { userId: decoded.userId };
    } catch {
      return null;
    }
  }

  // Verify password reset token
  private verifyPasswordResetToken(token: string): { userId: string } | null {
    try {
      const decoded = jwt.verify(token, config.jwt.resetPasswordSecret) as any;
      
      if (decoded.type !== 'password_reset') {
        return null;
      }

      const storedToken = passwordResetTokens.get(token);
      if (!storedToken || storedToken.expiresAt < new Date()) {
        passwordResetTokens.delete(token);
        return null;
      }

      return { userId: decoded.userId };
    } catch {
      return null;
    }
  }

  // Mock user operations (replace with actual database operations)
  private async findUserByEmail(email: string) {
    // Mock user data - replace with actual database query
    const mockUsers = [
      {
        id: 'user_1',
        fullName: 'Test User',
        email: 'test@example.com',
        password: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LFvO.', // hashed 'password123'
        role: 'USER',
        isEmailVerified: true,
        createdAt: new Date(),
      }
    ];

    return mockUsers.find(user => user.email === email) || null;
  }

  private async createUser(userData: RegisterRequest) {
    // Mock user creation - replace with actual database operation
    const hashedPassword = await this.hashPassword(userData.password);
    
    return {
      id: `user_${Date.now()}`,
      fullName: userData.fullName,
      email: userData.email,
      password: hashedPassword,
      phoneNumber: userData.phoneNumber,
      role: 'USER',
      isEmailVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  private async updateUser(userId: string, updateData: any) {
    // Mock user update - replace with actual database operation
    return {
      id: userId,
      ...updateData,
      updatedAt: new Date(),
    };
  }

  // Register user
  async register(userData: RegisterRequest): Promise<{ message: string; data: any }> {
    try {
      // Check if user already exists
      const existingUser = await this.findUserByEmail(userData.email);
      if (existingUser) {
        throw new Error('User already exists');
      }

      // Create new user
      const user = await this.createUser(userData);

      // Generate email verification token
      const verificationToken = this.generateEmailVerificationToken(user.id);

      return {
        message: 'User registered successfully. Please check your email to verify your account.',
        data: {
          userId: user.id,
          email: user.email,
          verificationToken,
        },
      };
    } catch (error: any) {
      throw new Error(`Registration failed: ${error.message}`);
    }
  }

  // Login user
  async login(loginData: LoginRequest): Promise<AuthResponse> {
    try {
      const { email, password } = loginData;

      // Check login attempts
      const attemptCheck = this.checkLoginAttempts(email);
      if (!attemptCheck.allowed) {
        throw new Error(
          attemptCheck.lockedUntil 
            ? `Account locked. Try again after ${attemptCheck.lockedUntil.toLocaleTimeString()}`
            : 'Too many failed attempts. Try again later.'
        );
      }

      // Find user
      const user = await this.findUserByEmail(email);
      if (!user) {
        this.recordFailedAttempt(email);
        throw new Error('Invalid credentials');
      }

      // Verify password
      const isPasswordValid = await this.verifyPassword(password, user.password);
      if (!isPasswordValid) {
        const result = this.recordFailedAttempt(email);
        if (result.locked) {
          throw new Error(`Account locked for 2 minutes due to too many failed attempts`);
        }
        throw new Error(`Invalid credentials. ${attemptCheck.remaining || 4} attempts remaining.`);
      }

      // Clear login attempts on successful login
      this.clearLoginAttempts(email);

      // Check email verification
      if (!user.isEmailVerified) {
        const verificationToken = this.generateEmailVerificationToken(user.id);
        throw new Error('Please verify your email before logging in');
      }

      // Generate tokens
      const tokens = this.generateTokens({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      // Store refresh token
      refreshTokens.set(tokens.refreshToken, {
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      });

      return {
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          isEmailVerified: user.isEmailVerified,
        },
        tokens,
      };
    } catch (error: any) {
      throw new Error(`Login failed: ${error.message}`);
    }
  }

  // Refresh token
  async refreshToken(refreshTokenData: RefreshTokenRequest): Promise<{ accessToken: string }> {
    try {
      const { refreshToken } = refreshTokenData;

      // Check if refresh token exists and is valid
      const storedToken = refreshTokens.get(refreshToken);
      if (!storedToken || storedToken.expiresAt < new Date()) {
        refreshTokens.delete(refreshToken);
        throw new Error('Invalid or expired refresh token');
      }

      // Verify refresh token
      const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret) as UserPayload;

      // Generate new access token
      const accessToken = jwt.sign(
        { userId: decoded.userId, email: decoded.email, role: decoded.role },
        config.jwt.accessSecret,
        { expiresIn: config.jwt.accessExpiration }
      );

      return { accessToken };
    } catch (error: any) {
      throw new Error(`Token refresh failed: ${error.message}`);
    }
  }

  // Logout
  async logout(refreshTokenData: RefreshTokenRequest): Promise<{ message: string }> {
    try {
      const { refreshToken } = refreshTokenData;
      refreshTokens.delete(refreshToken);
      return { message: 'Logged out successfully' };
    } catch (error: any) {
      throw new Error(`Logout failed: ${error.message}`);
    }
  }

  // Change password
  async changePassword(userId: string, passwordData: ChangePasswordRequest): Promise<{ message: string }> {
    try {
      const { oldPassword, newPassword } = passwordData;

      // Find user (mock implementation)
      const user = await this.findUserByEmail('user@example.com'); // Replace with actual user lookup
      if (!user) {
        throw new Error('User not found');
      }

      // Verify old password
      const isOldPasswordValid = await this.verifyPassword(oldPassword, user.password);
      if (!isOldPasswordValid) {
        throw new Error('Old password is incorrect');
      }

      // Hash new password
      const hashedNewPassword = await this.hashPassword(newPassword);

      // Update user password (mock implementation)
      await this.updateUser(userId, { password: hashedNewPassword });

      return { message: 'Password changed successfully' };
    } catch (error: any) {
      throw new Error(`Password change failed: ${error.message}`);
    }
  }

  // Forgot password
  async forgotPassword(forgotPasswordData: ForgotPasswordRequest): Promise<{ message: string; data: any }> {
    try {
      const { email } = forgotPasswordData;

      const user = await this.findUserByEmail(email);
      if (!user) {
        // Don't reveal if user exists or not
        return { message: 'If an account exists with this email, a password reset link has been sent.', data: {} };
      }

      const resetToken = this.generatePasswordResetToken(user.id);

      return {
        message: 'Password reset link sent to your email',
        data: { resetToken },
      };
    } catch (error: any) {
      throw new Error(`Forgot password failed: ${error.message}`);
    }
  }

  // Reset password
  async resetPassword(resetPasswordData: ResetPasswordRequest): Promise<{ message: string }> {
    try {
      const { token, password } = resetPasswordData;

      const tokenData = this.verifyPasswordResetToken(token);
      if (!tokenData) {
        throw new Error('Invalid or expired reset token');
      }

      // Hash new password
      const hashedPassword = await this.hashPassword(password);

      // Update user password
      await this.updateUser(tokenData.userId, { password: hashedPassword });

      // Remove used token
      passwordResetTokens.delete(token);

      return { message: 'Password reset successfully' };
    } catch (error: any) {
      throw new Error(`Password reset failed: ${error.message}`);
    }
  }

  // Verify email
  async verifyEmail(verifyEmailData: VerifyEmailRequest): Promise<{ message: string }> {
    try {
      const { token } = verifyEmailData;

      const tokenData = this.verifyEmailVerificationToken(token);
      if (!tokenData) {
        throw new Error('Invalid or expired verification token');
      }

      // Update user email verification status
      await this.updateUser(tokenData.userId, { isEmailVerified: true });

      // Remove used token
      emailVerificationTokens.delete(token);

      return { message: 'Email verified successfully' };
    } catch (error: any) {
      throw new Error(`Email verification failed: ${error.message}`);
    }
  }
}

export const authenticationService = new AuthenticationService();

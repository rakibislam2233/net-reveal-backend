import { StatusCodes } from 'http-status-codes';
import ApiError from '../../utils/ApiError';
import { IOtpSession, OtpType } from './otp.interface';
import { generateSecureOtp, generateSessionId } from './otp.utils';

// In-memory storage for OTP sessions (replace with database in production)
const otpSessions = new Map<string, IOtpSession>();

const OTP_SESSION_TTL = 10 * 60 * 1000; // 10 minutes

const createOtpSession = async (email: string, type: OtpType) => {
  const sessionId = await generateSessionId();
  const code = await generateSecureOtp();

  const sessionData: IOtpSession = {
    email,
    userId: sessionId, // Use sessionId as userId since interface requires it
    code,
    type,
    attempts: 0,
    createdAt: new Date(),
  };

  // Store session in memory
  otpSessions.set(sessionId, sessionData);

  // Auto-cleanup after TTL
  setTimeout(() => {
    otpSessions.delete(sessionId);
  }, OTP_SESSION_TTL);

  return {
    sessionId,
    code,
  };
};

const verifyOtpSession = async (sessionId: string, code: string) => {
  const sessionData = otpSessions.get(sessionId);

  if (!sessionData) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid or expired session');
  }

  // Max attempts reached
  if (sessionData.attempts >= 5) {
    otpSessions.delete(sessionId);
    throw new ApiError(StatusCodes.TOO_MANY_REQUESTS, 'Too many attempts. Please try again later.');
  }

  // Code mismatch
  if (sessionData.code !== code) {
    sessionData.attempts += 1;
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid OTP code');
  }

  // On success, delete the session and return data
  otpSessions.delete(sessionId);

  return {
    email: sessionData.email,
    type: sessionData.type,
  };
};

const resendOtpSession = async (sessionId: string) => {
  const sessionData = otpSessions.get(sessionId);

  if (!sessionData) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid or expired session');
  }

  // Check if enough time has passed for resend (1 minute)
  const now = new Date();
  const timeDiff = now.getTime() - sessionData.createdAt.getTime();
  
  if (timeDiff < 60 * 1000) { // 1 minute
    throw new ApiError(StatusCodes.TOO_MANY_REQUESTS, 'Please wait before requesting a new OTP');
  }

  // Generate new code
  const newCode = await generateSecureOtp();
  sessionData.code = newCode;
  sessionData.attempts = 0;
  sessionData.createdAt = new Date();

  // Update session
  otpSessions.set(sessionId, sessionData);

  // Trigger Email
  if (sessionData.type === OtpType.EMAIL_VERIFICATION) {
    // TODO: Send email verification code
    console.log(`Email verification OTP for ${sessionData.email}: ${newCode}`);
  } else if (sessionData.type === OtpType.RESET_PASSWORD) {
    // TODO: Send password reset code
    console.log(`Password reset OTP for ${sessionData.email}: ${newCode}`);
  }

  return {
    sessionId,
    code: newCode,
  };
};

// Cleanup function to remove expired sessions (call this periodically)
export const cleanupExpiredOtpSessions = (): void => {
  const now = new Date().getTime();
  let cleaned = 0;

  for (const [sessionId, sessionData] of otpSessions.entries()) {
    const sessionAge = now - sessionData.createdAt.getTime();
    if (sessionAge > OTP_SESSION_TTL) {
      otpSessions.delete(sessionId);
      cleaned++;
    }
  }

  if (cleaned > 0) {
    console.log(`🧹 Cleaned up ${cleaned} expired OTP sessions`);
  }
};

// Auto-cleanup every 5 minutes
setInterval(cleanupExpiredOtpSessions, 5 * 60 * 1000);

export { createOtpSession, verifyOtpSession, resendOtpSession };

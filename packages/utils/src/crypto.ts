import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { nanoid } from 'nanoid';
import type { JWTPayload } from '@tecno-gamerz/types';
import {
  BCRYPT_ROUNDS,
  JWT_ALGORITHM,
  JWT_ISSUER,
  JWT_AUDIENCE,
  JWT_ACCESS_TOKEN_EXPIRES_IN,
  JWT_REFRESH_TOKEN_EXPIRES_IN,
} from './constants';

// Password hashing
export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
};

export const verifyPassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

// JWT token generation and verification
export const generateAccessToken = (payload: Omit<JWTPayload, 'iat' | 'exp' | 'aud' | 'iss'>): string => {
  const privateKey = process.env.JWT_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error('JWT_PRIVATE_KEY environment variable is required');
  }

  const now = Math.floor(Date.now() / 1000);
  const exp = now + parseTimeToSeconds(JWT_ACCESS_TOKEN_EXPIRES_IN);

  const fullPayload: JWTPayload = {
    ...payload,
    iat: now,
    exp,
    aud: JWT_AUDIENCE,
    iss: JWT_ISSUER,
  };

  return jwt.sign(fullPayload, privateKey, {
    algorithm: JWT_ALGORITHM,
  });
};

export const generateRefreshToken = (): string => {
  // For refresh tokens, we use a random string approach
  // You could also use JWT if you prefer
  return nanoid(64);
};

export const verifyAccessToken = (token: string): JWTPayload => {
  const publicKey = process.env.JWT_PUBLIC_KEY;
  if (!publicKey) {
    throw new Error('JWT_PUBLIC_KEY environment variable is required');
  }

  try {
    const decoded = jwt.verify(token, publicKey, {
      algorithms: [JWT_ALGORITHM],
      audience: JWT_AUDIENCE,
      issuer: JWT_ISSUER,
    }) as JWTPayload;

    return decoded;
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid token');
    }
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token expired');
    }
    throw error;
  }
};

export const decodeTokenWithoutVerification = (token: string): JWTPayload | null => {
  try {
    const decoded = jwt.decode(token) as JWTPayload;
    return decoded;
  } catch {
    return null;
  }
};

// Generate RSA key pair for JWT signing (development utility)
export const generateJWTKeyPair = (): { privateKey: string; publicKey: string } => {
  const crypto = require('crypto');
  
  const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem',
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem',
    },
  });

  return { privateKey, publicKey };
};

// Utility functions
export const generateSecureId = (length = 21): string => {
  return nanoid(length);
};

export const generateApiKey = (): string => {
  return `tgh_${nanoid(32)}`;
};

export const generateOTP = (length = 6): string => {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * digits.length)];
  }
  return otp;
};

// Time parsing helper
function parseTimeToSeconds(timeString: string): number {
  const match = timeString.match(/^(\d+)([smhd])$/);
  if (!match) {
    throw new Error(`Invalid time format: ${timeString}`);
  }

  const [, amount, unit] = match;
  const value = parseInt(amount, 10);

  switch (unit) {
    case 's':
      return value;
    case 'm':
      return value * 60;
    case 'h':
      return value * 60 * 60;
    case 'd':
      return value * 60 * 60 * 24;
    default:
      throw new Error(`Invalid time unit: ${unit}`);
  }
}

// Session token utilities
export const generateSessionToken = (): string => {
  return nanoid(32);
};

export const isTokenExpired = (exp: number): boolean => {
  return Date.now() >= exp * 1000;
};

// CSRF token utilities
export const generateCSRFToken = (): string => {
  return nanoid(32);
};

// Rate limiting token bucket
export class TokenBucket {
  private tokens: number;
  private lastRefill: number;

  constructor(
    private capacity: number,
    private refillRate: number,
    private refillInterval: number = 1000
  ) {
    this.tokens = capacity;
    this.lastRefill = Date.now();
  }

  consume(tokens = 1): boolean {
    this.refill();
    
    if (this.tokens >= tokens) {
      this.tokens -= tokens;
      return true;
    }
    
    return false;
  }

  private refill(): void {
    const now = Date.now();
    const timePassed = now - this.lastRefill;
    const tokensToAdd = Math.floor(timePassed / this.refillInterval) * this.refillRate;
    
    this.tokens = Math.min(this.capacity, this.tokens + tokensToAdd);
    this.lastRefill = now;
  }

  getAvailableTokens(): number {
    this.refill();
    return this.tokens;
  }
}
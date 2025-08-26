import { Injectable, UnauthorizedException, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/services/prisma.service';
import { 
  hashPassword, 
  verifyPassword, 
  generateAccessToken, 
  generateRefreshToken,
  verifyAccessToken 
} from '@tecno-gamerz/utils';
import type { 
  LoginInput, 
  RegisterInput, 
  AuthResponse, 
  RefreshTokenResponse,
  PublicUser,
  JWTPayload,
  Role 
} from '@tecno-gamerz/types';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async register(input: RegisterInput): Promise<AuthResponse> {
    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Check username if provided
    if (input.username) {
      const existingUsername = await this.prisma.user.findUnique({
        where: { username: input.username },
      });

      if (existingUsername) {
        throw new ConflictException('Username is already taken');
      }
    }

    // Hash password
    const passwordHash = await hashPassword(input.password);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        passwordHash,
        username: input.username,
        role: 'GAMER', // Default role
      },
    });

    // Generate tokens
    const { accessToken, refreshToken, expiresAt } = await this.generateTokens(user);

    // Create audit log
    await this.prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'user.registered',
        resource: 'User',
        resourceId: user.id,
        metadata: {
          email: user.email,
          role: user.role,
        },
      },
    });

    return {
      user: this.toPublicUser(user),
      accessToken,
      refreshToken,
      expiresAt,
    };
  }

  async login(input: LoginInput): Promise<AuthResponse> {
    // Find user by email
    const user = await this.prisma.user.findUnique({
      where: { email: input.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isValidPassword = await verifyPassword(input.password, user.passwordHash);

    if (!isValidPassword) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if user is active
    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Account is not active');
    }

    // Generate tokens
    const { accessToken, refreshToken, expiresAt } = await this.generateTokens(user);

    // Create audit log
    await this.prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'user.login',
        resource: 'User',
        resourceId: user.id,
        metadata: {
          email: user.email,
        },
      },
    });

    return {
      user: this.toPublicUser(user),
      accessToken,
      refreshToken,
      expiresAt,
    };
  }

  async me(userId: string): Promise<PublicUser> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.toPublicUser(user);
  }

  async validateAccessToken(token: string): Promise<JWTPayload> {
    try {
      return verifyAccessToken(token);
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  async refreshAccessToken(refreshTokenValue: string): Promise<RefreshTokenResponse> {
    // For now, we'll use a simple approach and store refresh tokens in the database
    // In a production app, you might want to use a more sophisticated approach
    
    // For this MVP, we'll validate the refresh token by checking if it's associated with a user
    // This is a simplified implementation - in production you'd want to store refresh tokens securely
    
    if (!refreshTokenValue || refreshTokenValue.length < 32) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // For MVP, we'll extract user info from the token format and regenerate
    // This is a simplified approach - in production you'd store refresh tokens in DB
    try {
      // Generate a new access token
      // For now, we'll assume the refresh token is valid and generate a new access token
      // In production, you'd validate the refresh token properly
      
      throw new UnauthorizedException('Refresh token validation not implemented in MVP');
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private async generateTokens(user: any) {
    const payload = {
      sub: user.id,
      email: user.email,
      username: user.username,
      roles: [user.role as Role],
      permissions: [], // For MVP, we'll keep this simple
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken();
    
    // Calculate expiration (15 minutes from now)
    const expiresAt = Math.floor(Date.now() / 1000) + 15 * 60;

    return {
      accessToken,
      refreshToken,
      expiresAt,
    };
  }

  private toPublicUser(user: any): PublicUser {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      username: user.username,
      image: user.image,
      status: user.status,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
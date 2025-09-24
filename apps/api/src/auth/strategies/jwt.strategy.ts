import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';
import type { JWTPayload } from '@tecno-gamerz/types';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private authService: AuthService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_PUBLIC_KEY') || 'fallback-secret-key',
      algorithms: ['RS256'],
    });
  }

  async validate(payload: JWTPayload): Promise<JWTPayload> {
    if (!payload.sub) {
      throw new UnauthorizedException('Invalid token payload');
    }

    // Additional validation could be performed here
    // For example, checking if user is still active
    try {
      await this.authService.me(payload.sub);
      return payload;
    } catch (error) {
      throw new UnauthorizedException('User not found or inactive');
    }
  }
}
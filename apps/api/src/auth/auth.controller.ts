import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('token')
  @ApiOperation({ summary: 'Generate API token' })
  @ApiResponse({ status: 201, description: 'Token generated successfully' })
  async generateToken(@Body() body: { userId: string }) {
    // TODO: Implement token generation
    return {
      message: 'Token generation endpoint - TODO',
      userId: body.userId,
    };
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, description: 'Token refreshed successfully' })
  async refreshToken(@Body() body: { refreshToken: string }) {
    // TODO: Implement token refresh
    return {
      message: 'Token refresh endpoint - TODO',
      refreshToken: body.refreshToken,
    };
  }
}
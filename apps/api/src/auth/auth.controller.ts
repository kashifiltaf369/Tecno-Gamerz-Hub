import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  UseGuards, 
  Request,
  ValidationPipe,
  HttpCode,
  HttpStatus 
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { RegisterDto, LoginDto, RefreshTokenDto } from './dto/auth.dto';
import { 
  Role,
  AuthResponse, 
  RefreshTokenResponse,
  PublicUser 
} from '@tecno-gamerz/types';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ 
    status: 201, 
    description: 'User registered successfully',
    type: 'AuthResponse'
  })
  @ApiResponse({ 
    status: 409, 
    description: 'User already exists' 
  })
  async register(
    @Body(ValidationPipe) input: RegisterDto
  ): Promise<AuthResponse> {
    return this.authService.register(input);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({ 
    status: 200, 
    description: 'Login successful',
    type: 'AuthResponse'
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Invalid credentials' 
  })
  async login(
    @Body(ValidationPipe) input: LoginDto
  ): Promise<AuthResponse> {
    return this.authService.login(input);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ 
    status: 200, 
    description: 'User profile retrieved successfully',
    type: 'PublicUser'
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized' 
  })
  async me(@Request() req: any): Promise<PublicUser> {
    return this.authService.me(req.user.sub);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ 
    status: 200, 
    description: 'Token refreshed successfully',
    type: 'RefreshTokenResponse'
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Invalid refresh token' 
  })
  async refreshToken(
    @Body(ValidationPipe) body: RefreshTokenDto
  ): Promise<RefreshTokenResponse> {
    return this.authService.refreshAccessToken(body.refreshToken);
  }
}
import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RbacService } from './rbac.service';

@ApiTags('RBAC')
@Controller('rbac')
export class RbacController {
  constructor(private readonly rbacService: RbacService) {}

  @Get('roles')
  @ApiOperation({ summary: 'Get all roles' })
  @ApiResponse({ status: 200, description: 'Roles retrieved successfully' })
  async getRoles() {
    return this.rbacService.getAllRoles();
  }

  @Get('permissions')
  @ApiOperation({ summary: 'Get all permissions' })
  @ApiResponse({ status: 200, description: 'Permissions retrieved successfully' })
  async getPermissions() {
    return this.rbacService.getAllPermissions();
  }

  @Post('check-permission')
  @ApiOperation({ summary: 'Check user permission' })
  @ApiResponse({ status: 200, description: 'Permission checked successfully' })
  async checkPermission(@Body() body: { userId: string; permission: string }) {
    return this.rbacService.checkPermission(body.userId, body.permission);
  }
}
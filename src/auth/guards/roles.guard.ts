import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { RoleService } from '../../role/role.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private roleService: RoleService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if route is public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    // Get required roles from decorator
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no roles required, allow access
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // Get user from request
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Get user roles
    const userRoles = await this.roleService.getUserRoles(user.id);

    // Extract role names and build full hierarchy for each role
    const userRoleNames = new Set<string>();
    for (const userRole of userRoles) {
      const roleName = userRole.role.name;
      userRoleNames.add(roleName);
      
      // Get all parent roles in hierarchy
      if (userRole.role.id) {
        const parentRoles = await this.roleService.getParentRoles(userRole.role.id);
        parentRoles.forEach((parentRole) => userRoleNames.add(parentRole));
      }
    }

    // Check if user has at least one of the required roles (or parent role in hierarchy)
    const hasRequiredRole = requiredRoles.some((requiredRole) => {
      // Direct match or parent role match
      return userRoleNames.has(requiredRole);
    });

    if (!hasRequiredRole) {
      throw new ForbiddenException(
        `Access denied. Required roles: ${requiredRoles.join(', ')}`,
      );
    }

    return true;
  }
}


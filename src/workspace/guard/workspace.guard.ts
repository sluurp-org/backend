import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Request } from 'express';
import { WorkspaceService } from '../workspace.service';
import { Reflector } from '@nestjs/core';
import { WorkspaceRoles } from '../decorator/workspace-role.decorator';

@Injectable()
export class WorkspaceGuard implements CanActivate {
  constructor(
    private readonly workspaceService: WorkspaceService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const { user, workspace } = request;

    if (!user) throw new UnauthorizedException('인증되지 않은 사용자 입니다.');
    if (!workspace)
      throw new NotFoundException('워크스페이스가 존재하지 않습니다.');

    if (user.isAdmin) return true;

    const workspaceUser = await this.workspaceService.validateWorkspaceUser(
      user.id,
      workspace.id,
    );
    if (!workspaceUser)
      throw new ForbiddenException('해당 작업을 실행할 권한이 부족합니다.');

    const roles = this.reflector.get(WorkspaceRoles, context.getHandler());
    if (roles.length === 0) return true;

    const hasRole = roles.some((role) => workspaceUser.role === role);
    if (!hasRole)
      throw new ForbiddenException('해당 작업을 실행할 권한이 부족합니다.');

    return hasRole;
  }
}

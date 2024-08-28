import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { WorkspaceRole } from '@prisma/client';
import { WorkspaceGuard } from 'src/workspace/guard/workspace.guard';
import { WorkspaceRoles } from './workspace-role.decorator';
import { StrategyType } from 'src/auth/enum/strategy.enum';
import { AuthGuard } from '@nestjs/passport';

export function WorkspaceAuth(roles: WorkspaceRole[] = []) {
  return applyDecorators(
    WorkspaceRoles(roles),
    UseGuards(AuthGuard(StrategyType.ACCESS), WorkspaceGuard),
    ApiBearerAuth('accessToken'),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
  );
}

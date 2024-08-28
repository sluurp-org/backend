import { Reflector } from '@nestjs/core';
import { WorkspaceRole } from '@prisma/client';

export const WorkspaceRoles = Reflector.createDecorator<WorkspaceRole[]>();

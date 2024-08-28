import {
  Injectable,
  NestMiddleware,
  BadRequestException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { WorkspaceService } from 'src/workspace/workspace.service';

@Injectable()
export class WorkspaceMiddleware implements NestMiddleware {
  constructor(private readonly workspaceService: WorkspaceService) {}

  async use(req: Request, _: Response, next: NextFunction) {
    const workspaceId = req.params.workspaceId;

    if (!workspaceId) return next();
    if (isNaN(Number(workspaceId))) {
      throw new BadRequestException('워크스페이스 ID가 올바르지 않습니다.');
    }

    const workspace = await this.workspaceService.findOneById(
      Number(workspaceId),
    );
    if (!workspace) {
      throw new BadRequestException('워크스페이스가 존재하지 않습니다.');
    }

    req.workspace = workspace;
    return next();
  }
}

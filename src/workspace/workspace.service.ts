import {
  InternalServerErrorException,
  ForbiddenException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { WorkspaceRole, WorkspaceUser } from '@prisma/client';

import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class WorkspaceService {
  private readonly logger = new Logger(WorkspaceService.name);

  constructor(private readonly prismaService: PrismaService) {}

  public async findOneById(id: number) {
    try {
      const workspace = await this.prismaService.workspace.findUnique({
        where: { id, deletedAt: null },
      });

      return workspace;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(
        '워크스페이스 조회에 실패했습니다.',
      );
    }
  }

  public async findWorkspaceById(userId: number, workspaceId: number) {
    const workspaceUser = await this.validateWorkspaceUser(userId, workspaceId);
    if (!workspaceUser)
      throw new ForbiddenException('워크스페이스 사용자가 아닙니다.');

    try {
      const workspace = await this.prismaService.workspace.findUnique({
        where: { id: workspaceId, deletedAt: null },
      });
      return workspace;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(
        '워크스페이스 조회에 실패했습니다.',
      );
    }
  }

  public async createWorkspace(
    userId: number,
    createWorkspaceDto: CreateWorkspaceDto,
  ) {
    try {
      return await this.prismaService.$transaction(async (tx) => {
        const nextPurchaseAt = new Date();
        nextPurchaseAt.setDate(nextPurchaseAt.getDate() + 14);
        nextPurchaseAt.setHours(0, 0, 0, 0);

        const workspace = await tx.workspace.create({
          data: {
            ...createWorkspaceDto,
            lastPurchaseAt: new Date(),
            nextPurchaseAt,
            workspaceUser: {
              create: {
                user: { connect: { id: userId } },
                role: WorkspaceRole.OWNER,
              },
            },
          },
        });

        return workspace;
      });
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(
        '워크스페이스 생성에 실패했습니다.',
      );
    }
  }

  public async updateWorkspace(
    id: number,
    updateWorkspaceDto: UpdateWorkspaceDto,
  ) {
    const existWorkspace = await this.prismaService.workspace.findUnique({
      where: { id, deletedAt: null },
    });
    if (!existWorkspace)
      throw new ForbiddenException('존재하지 않는 워크스페이스입니다.');

    try {
      const workspace = await this.prismaService.workspace.update({
        where: { id },
        data: updateWorkspaceDto,
      });

      return workspace;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(
        '워크스페이스 수정에 실패했습니다.',
      );
    }
  }

  public async deleteWorkspace(userId: number, id: number) {
    const existWorkspace = await this.prismaService.workspace.findUnique({
      where: { id, deletedAt: null },
    });
    if (!existWorkspace)
      throw new ForbiddenException('존재하지 않는 워크스페이스입니다.');

    const workspaceUser = await this.validateWorkspaceUser(id, userId);
    if (!workspaceUser)
      throw new ForbiddenException('워크스페이스 사용자가 아닙니다.');

    try {
      const workspace = await this.prismaService.workspace.update({
        where: { id },
        data: { deletedAt: new Date() },
      });

      return workspace;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(
        '워크스페이스 삭제에 실패했습니다.',
      );
    }
  }

  public async findWorkspacesByUserId(userId: number) {
    try {
      const workspaces = await this.prismaService.workspace.findMany({
        where: { workspaceUser: { some: { userId } }, deletedAt: null },
      });

      return workspaces;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(
        '워크스페이스 목록 조회에 실패했습니다.',
      );
    }
  }

  public async findWorkspaceUsers(workspaceId: number) {
    try {
      const workspaceUsers = await this.prismaService.workspaceUser.findMany({
        where: { workspaceId },
      });

      return workspaceUsers;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(
        '워크스페이스 사용자 조회에 실패했습니다.',
      );
    }
  }

  public async updateWorkspaceUserRole(
    workspaceId: number,
    userId: number,
    role: WorkspaceRole,
  ) {
    try {
      const workspaceUser = await this.validateWorkspaceUser(
        workspaceId,
        userId,
      );
      if (!workspaceUser)
        throw new ForbiddenException('워크스페이스 사용자가 아닙니다.');

      if (workspaceUser.role === WorkspaceRole.OWNER) {
        const workspaceUsers = await this.prismaService.workspaceUser.count({
          where: { workspaceId, role: WorkspaceRole.OWNER },
        });
        if (workspaceUsers === 1)
          throw new ForbiddenException(
            '마지막 워크스페이스 관리자의 역할을 변경할 수 없습니다.',
          );
      }

      return await this.prismaService.workspaceUser.update({
        where: { userId_workspaceId: { workspaceId, userId } },
        data: { role },
      });
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(
        '워크스페이스 사용자 역할 수정에 실패했습니다.',
      );
    }
  }

  public async leaveWorkspace(workspaceId: number, userId: number) {
    try {
      const workspaceUser = await this.prismaService.workspaceUser.findUnique({
        where: { userId_workspaceId: { workspaceId, userId } },
      });
      if (!workspaceUser)
        throw new ForbiddenException('워크스페이스 사용자가 아닙니다.');

      if (workspaceUser.role === WorkspaceRole.OWNER) {
        const workspaceUsers = await this.prismaService.workspaceUser.count({
          where: { workspaceId, role: WorkspaceRole.OWNER },
        });
        if (workspaceUsers === 1)
          throw new ForbiddenException(
            '마지막 워크스페이스 관리자는 탈퇴할 수 없습니다.',
          );
      }

      return await this.prismaService.workspaceUser.delete({
        where: { userId_workspaceId: { workspaceId, userId } },
      });
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(
        '워크스페이스 탈퇴에 실패했습니다.',
      );
    }
  }

  public async validateWorkspaceUser(
    userId: number,
    workspaceId: number,
  ): Promise<WorkspaceUser> {
    try {
      return this.prismaService.workspaceUser.findUnique({
        where: { userId_workspaceId: { userId, workspaceId } },
      });
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(
        '워크스페이스 사용자 조회에 실패했습니다.',
      );
    }
  }
}

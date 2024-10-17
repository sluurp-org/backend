import {
  Injectable,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { addDays } from 'date-fns';
import {
  CreditType,
  Prisma,
  Workspace,
  WorkspaceBilling,
  WorkspaceCredit,
} from '@prisma/client';
import { FindCreditBodyDto } from './dto/req/find-credit-body.dto';
import { CreateCreditBodyDto } from './dto/req/create-credit-body.dto';
import { UseCreditBodyDto } from './dto/req/use-credit-body.dto';
import { CreditDto } from './dto/res/credit.dto';

@Injectable()
export class CreditService {
  constructor(private prisma: PrismaService) {}

  public async findAll(
    workspaceId: number,
    dto: FindCreditBodyDto,
  ): Promise<WorkspaceCredit[]> {
    const { take, skip, type } = dto;
    return this.prisma.workspaceCredit.findMany({
      where: { workspaceId, type },
      orderBy: { id: 'desc' },
      take,
      skip,
    });
  }

  public async count(
    workspaceId: number,
    dto: FindCreditBodyDto,
  ): Promise<number> {
    const { type } = dto;
    return this.prisma.workspaceCredit.count({
      where: { workspaceId, type },
    });
  }

  public async create(
    workspaceId: number,
    dto: CreateCreditBodyDto,
    tx: Prisma.TransactionClient = this.prisma,
  ): Promise<CreditDto> {
    const { amount, expireAfterDays, reason } = dto;

    await tx.workspace.update({
      where: { id: workspaceId, deletedAt: null },
      data: {
        credit: {
          increment: amount,
        },
      },
    });

    return await tx.workspaceCredit.create({
      data: {
        workspaceId,
        amount,
        reason,
        remainAmount: amount,
        expireAt: expireAfterDays ? addDays(new Date(), expireAfterDays) : null,
      },
    });
  }

  public async use(
    workspaceId: number,
    dto: UseCreditBodyDto,
  ): Promise<WorkspaceCredit> {
    const { amount, reason } = dto;

    return await this.prisma.$transaction(async (prisma) => {
      const workspace = await prisma.workspace.findUnique({
        where: { id: workspaceId, deletedAt: null },
      });
      if (!workspace)
        throw new NotFoundException('존재하지 않는 워크스페이스입니다.');

      if (workspace.credit < amount)
        throw new NotAcceptableException('크레딧이 부족합니다.');

      const workspacePoints = await prisma.workspaceCredit.findMany({
        where: {
          workspaceId,
          remainAmount: { gt: 0 },
          type: CreditType.ADD,
          OR: [{ expireAt: { gte: new Date() } }, { expireAt: null }],
        },
        orderBy: { expireAt: 'asc' },
      });

      let remainingAmountToUse = amount;
      for (const transaction of workspacePoints) {
        if (remainingAmountToUse <= 0) break;

        const amountToDeduct = Math.min(
          transaction.remainAmount,
          remainingAmountToUse,
        );

        await prisma.workspaceCredit.update({
          where: { id: transaction.id },
          data: { remainAmount: { decrement: amountToDeduct } },
        });

        remainingAmountToUse -= amountToDeduct;
      }

      if (remainingAmountToUse > 0)
        throw new NotAcceptableException('크레딧이 부족합니다.');

      await prisma.workspace.update({
        where: { id: workspaceId, deletedAt: null },
        data: { credit: { decrement: amount } },
      });

      const usedCredit = await prisma.workspaceCredit.create({
        data: {
          reason,
          workspaceId,
          type: CreditType.USE,
          amount,
          remainAmount: 0,
        },
      });

      return usedCredit;
    });
  }
}

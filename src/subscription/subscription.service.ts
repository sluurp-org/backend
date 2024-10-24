import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SubscriptionService {
  constructor(private readonly prismaService: PrismaService) {}

  public async getSubscriptionProducts() {
    return this.prismaService.subscriptionModel.findMany();
  }
}

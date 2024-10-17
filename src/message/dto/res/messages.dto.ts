import { ApiProperty } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import { Expose, Exclude } from 'class-transformer';

export class MessagesDto {
  @Expose()
  @ApiProperty({
    description: '메시지 템플릿 ID',
    example: 1,
  })
  id: number;

  @Expose()
  @ApiProperty({
    description: '메시지 템플릿 이름',
    example: '주문 완료',
  })
  name: string;

  @Exclude()
  variables: Prisma.JsonValue;

  @Exclude()
  workspaceId: number;

  @Exclude()
  contentGroupId: number;

  @Exclude()
  credentialId: number;

  @Exclude()
  webhookUrl: string;

  @Exclude()
  webhookHeaders: Prisma.JsonValue;

  @Exclude()
  webhookBody: Prisma.JsonValue;

  @Exclude()
  emailTitle: string;

  @Exclude()
  emailBody: string;

  @Exclude()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Exclude()
  kakaoTemplateId: string;

  @Exclude()
  deletedAt: Date;
}

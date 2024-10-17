import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { WebhookTypeEnum } from 'src/portone/enum/webhook.enum';

export class WebhookDataBodyDto {
  @ApiProperty({
    example: '1234567890',
    description: '결제 ID',
    required: false,
  })
  @IsOptional()
  @IsString()
  paymentId?: string;

  @ApiProperty({
    example: '1234567890',
    description: '거래 ID',
    required: false,
  })
  @IsOptional()
  @IsString()
  transactionId?: string;

  @ApiProperty({
    example: '1234567890',
    description: '취소 ID',
    required: false,
  })
  @IsOptional()
  @IsString()
  cancellationId?: string;

  @ApiProperty({
    example: '1234567890',
    description: '빌링키',
    required: false,
  })
  @IsOptional()
  @IsString()
  billingKey?: string;
}

export class WebhookBodyDto {
  @ApiProperty({
    enum: WebhookTypeEnum,
    example: WebhookTypeEnum.TransactionReady,
    description: '웹훅 타입',
  })
  @IsNotEmpty()
  @IsEnum(WebhookTypeEnum)
  type: WebhookTypeEnum;

  @ApiProperty({
    example: new Date(),
    description: '웹훅 발생 시간',
  })
  @IsNotEmpty()
  @IsDate()
  timestamp: Date;

  @ApiProperty({
    type: WebhookDataBodyDto,
    description: '웹훅 데이터',
  })
  @Type(() => WebhookDataBodyDto)
  @ValidateNested()
  @IsNotEmpty()
  data: WebhookDataBodyDto;
}

import { ApiProperty } from '@nestjs/swagger';
import { CreditType } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';
import { PaginationQueryDto } from 'src/common/dto/req/pagination-query.dto';

export class FindCreditBodyDto extends PaginationQueryDto {
  @ApiProperty({
    description: '크레딧 타입',
    example: CreditType.ADD,
    enum: CreditType,
    required: false,
  })
  @IsEnum(CreditType)
  @IsOptional()
  type?: CreditType;
}

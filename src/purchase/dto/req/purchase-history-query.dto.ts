import { ApiProperty } from "@nestjs/swagger";
import { PurchaseType } from "@prisma/client";
import { IsEnum, IsOptional } from "class-validator";
import { PaginationQueryDto } from "src/common/dto/req/pagination-query.dto";

export class PurchaseHistoryQueryDto extends PaginationQueryDto {
  @ApiProperty({
    example: PurchaseType.CREDIT,
    description: '결제 유형',
    required: false,
    enum: PurchaseType,
  })
  @IsOptional()
  @IsEnum(PurchaseType)
  type?: PurchaseType;
}

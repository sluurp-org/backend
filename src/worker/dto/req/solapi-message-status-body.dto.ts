import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsNotEmpty, IsString, ValidateNested } from 'class-validator';

class CustomFields {
  @ApiProperty({
    description: '이벤트 아이디',
    example: 'atest',
  })
  @IsString()
  @IsNotEmpty()
  eventId: string;
}

export class SolapiMessageStatuBodyDto {
  @ApiProperty({
    description: '메시지 아이디',
    example: 'M4V2024092917053597NMBWI4NER0ZFT',
  })
  @IsString()
  @IsNotEmpty()
  messageId: string;

  @ApiProperty({
    description: '처리 날짜',
    example: '2024-09-29T08:05:36.688Z',
  })
  @IsDate()
  @IsNotEmpty()
  dateProcessed: Date;

  @ApiProperty({
    description: '상태 코드',
    example: '4000',
  })
  @IsString()
  @IsNotEmpty()
  statusCode: string;

  @ApiProperty({
    description: '사용자 정의 필드',
    type: CustomFields,
  })
  @Type(() => CustomFields)
  @IsNotEmpty()
  @ValidateNested()
  customFields: CustomFields;
}

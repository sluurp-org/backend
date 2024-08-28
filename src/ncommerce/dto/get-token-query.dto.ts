import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class GetTokenQueryDto {
  @ApiProperty({
    description: 'application Id',
    example: '6IwRzlmtQUOAybqjyBykNm',
  })
  @IsString()
  @IsNotEmpty()
  applicationId: string;

  @ApiProperty({
    description: 'application secret',
    example: '$2a$04$8/fJtdcaR1MRDMKczYgyN.',
  })
  @IsString()
  @IsNotEmpty()
  applicationSecret: string;
}

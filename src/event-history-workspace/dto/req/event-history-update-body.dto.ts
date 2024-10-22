import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsDate, IsOptional } from 'class-validator';

export class EventHistoryWorkspaceUpdateBodyDto {
  @ApiProperty({
    description: '만료 일시',
    required: false,
  })
  @IsOptional()
  @IsDate()
  expiredAt?: Date;

  @ApiProperty({
    description: '다운로드 제한',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  disableDownload?: boolean;
}

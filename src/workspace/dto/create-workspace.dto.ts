import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateWorkspaceDto {
  @ApiProperty({
    example: '스르륵 스토어',
    description: '워크스페이스 이름',
  })
  @IsString()
  @IsNotEmpty()
  name: string;
}

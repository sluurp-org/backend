import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { UserDto } from './user.dto';

export class UserMeDto extends UserDto {
  @ApiProperty({
    description: '사용자 채널톡 해시',
    example: 'gisuhgiauhefwiuawueygfauwfeh',
  })
  @Expose()
  hash: string;
}

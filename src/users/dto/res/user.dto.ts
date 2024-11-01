import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

export class UserDto {
  @ApiProperty({
    description: '사용자 아이디',
    example: '1',
  })
  @Expose()
  id: number;

  @ApiProperty({
    description: '사용자 이름',
    example: '홍길동',
  })
  @Expose()
  name: string;

  @ApiProperty({
    description: '이메일',
    example: 'example@example.com',
  })
  @Expose()
  email: string;

  @ApiProperty({
    description: '전화번호',
    example: '01012345678',
  })
  @Expose()
  phone: string;

  @Exclude()
  password: string;

  @Exclude()
  salt: string;

  @Exclude()
  refreshToken: string;

  @Exclude()
  createdAt: Date;

  @Exclude()
  updatedAt: Date;

  @Exclude()
  deletedAt: Date;
}

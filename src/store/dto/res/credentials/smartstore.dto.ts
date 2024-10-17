import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

export class SmartStoreCredentialsDto {
  @ApiProperty({
    description: '스마트스토어 인증 고유 ID',
    example: 1,
  })
  @Expose()
  id: number;

  @ApiProperty({
    description: '스마트스토어 아이디',
    example: 'wowid',
  })
  @Expose()
  applicationId: string;

  @ApiProperty({
    description: '스마트스토어 비밀키',
    example: 'wowsecret',
  })
  @Expose()
  applicationSecret: string;

  @ApiProperty({
    description: '스토어 이름',
    example: '스르륵 스마트 스토어',
  })
  @Expose()
  name: string;

  @ApiProperty({
    description: '네이버 채널 ID',
    example: 1,
  })
  @Expose()
  channelId: number;

  @ApiProperty({
    description: '이메일 파싱 가능 여부',
    example: true,
  })
  @Expose()
  emailParseable: boolean;

  @Exclude()
  storeId: number;

  @Exclude()
  createdAt: Date;

  @Exclude()
  updatedAt: Date;

  @Exclude()
  deletedAt: Date;
}

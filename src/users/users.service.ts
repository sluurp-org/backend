import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma, Provider, User, VerificationType } from '@prisma/client';
import * as crypto from 'crypto';
import { CreateUserBodyDto } from './dto/req/create-user-body.dto';
import { UpdateUserBodyDto } from './dto/req/update-user-body.dto';
import { ConfigService } from '@nestjs/config';
import { KakaoService } from 'src/kakao/kakao.service';
import { differenceInSeconds } from 'date-fns';
import { ChangePasswordByCodeDto } from './dto/req/find-user-by-phone-body.dto copy';

@Injectable()
export class UsersService {
  private readonly logger: Logger = new Logger(UsersService.name);
  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
    private readonly kakaoService: KakaoService,
  ) {}

  public async findOneByPhone(phone: string, name: string): Promise<User> {
    const user = await this.prismaService.user.findFirst({
      where: { phone, name },
    });
    if (!user) throw new NotFoundException('사용자 정보가 없습니다.');

    return user;
  }

  public async findOneById(userId: number): Promise<User> {
    try {
      const user = await this.prismaService.user.findUnique({
        where: { id: userId, deletedAt: null },
      });
      if (!user) throw new NotFoundException('사용자 정보가 없습니다.');

      return user;
    } catch (error) {
      this.logger.error(error.message);
      throw new InternalServerErrorException(
        '사용자 정보를 가져오는 중 오류가 발생했습니다.',
      );
    }
  }

  public async findOneByLoginId(loginId: string): Promise<User | null> {
    try {
      const user = await this.prismaService.user.findUnique({
        where: { loginId, deletedAt: null },
      });

      return user;
    } catch (error) {
      this.logger.error(error.message);
      throw new InternalServerErrorException(
        '사용자 정보를 가져오는 중 오류가 발생했습니다.',
      );
    }
  }

  public async phoneVerification(
    name: string,
    phone: string,
    type: VerificationType = VerificationType.REGISTER,
  ) {
    const code = Math.floor(100000 + Math.random() * 900000);

    const recentPhoneVerification =
      await this.prismaService.phoneVerification.findUnique({
        where: {
          phone_type: {
            phone,
            type,
          },
        },
      });

    if (
      recentPhoneVerification &&
      recentPhoneVerification?.expiredAt > new Date()
    )
      throw new NotAcceptableException(
        `${differenceInSeconds(recentPhoneVerification.expiredAt, new Date())}초 후 다시 시도해주세요.`,
      );

    await this.prismaService.$transaction(async (tx) => {
      await tx.phoneVerification.upsert({
        where: {
          phone_type: {
            phone,
            type,
          },
        },
        create: {
          phone,
          type,
          code: code.toString(),
          expiredAt: new Date(Date.now() + 1000 * 60 * 3),
        },
        update: {
          code: code.toString(),
          expiredAt: new Date(Date.now() + 1000 * 60 * 3),
        },
      });

      const mapSendType: Record<VerificationType, string> = {
        [VerificationType.REGISTER]: '가입',
        [VerificationType.FIND_PASSWORD]: '비밀번호 찾기',
      };

      await this.kakaoService.sendKakaoMessage([
        {
          to: phone,
          templateId: 'KA01TP241101000643373udDIuJU8YOy',
          variables: {
            '#{발송유형}': mapSendType[type],
            '#{고객명}': name,
            '#{인증번호}': code.toString(),
          },
        },
      ]);
    });
  }

  public async createUser(createUserBodyDto: CreateUserBodyDto): Promise<User> {
    const { loginId, phone, code, password, ...createUserRest } =
      createUserBodyDto;

    const userExistsById = await this.findOneByLoginId(loginId);
    if (userExistsById)
      throw new NotAcceptableException('이미 가입된 아이디입니다.');

    const userExistsByPhone = await this.prismaService.user.findUnique({
      where: { phone },
    });
    if (userExistsByPhone)
      throw new NotAcceptableException('이미 가입된 전화번호입니다.');

    const phoneVerification =
      await this.prismaService.phoneVerification.findUnique({
        where: {
          phone_type: {
            phone,
            type: VerificationType.REGISTER,
          },
          code,
          expiredAt: {
            gte: new Date(),
          },
        },
      });
    if (!phoneVerification)
      throw new NotAcceptableException('인증번호가 올바르지 않습니다.');

    try {
      const salt = crypto.randomBytes(32).toString('hex');
      const hash = this.hashPassword(password, salt);

      const user = await this.prismaService.user.create({
        data: {
          phone,
          loginId,
          salt,
          password: hash,
          ...createUserRest,
        },
      });

      await this.prismaService.phoneVerification.delete({
        where: { id: phoneVerification.id },
      });

      await this.kakaoService.sendKakaoMessage([
        {
          to: phone,
          templateId: 'KA01TP2411031303212274F0PV0H5O5j',
          variables: {
            '#{고객명}': user.name,
          },
        },
      ]);

      return user;
    } catch (error) {
      this.logger.error(error.message);
      throw new InternalServerErrorException(
        '사용자 정보를 저장하는 중 오류가 발생했습니다.',
      );
    }
  }

  public async changePasswordByCode(dto: ChangePasswordByCodeDto) {
    const { phone, code, password } = dto;

    const phoneVerification =
      await this.prismaService.phoneVerification.findUnique({
        where: {
          phone_type: {
            phone,
            type: VerificationType.FIND_PASSWORD,
          },
          code,
          expiredAt: {
            gte: new Date(),
          },
        },
      });
    if (!phoneVerification)
      throw new NotAcceptableException('인증번호가 올바르지 않습니다.');

    try {
      const salt = crypto.randomBytes(32).toString('hex');
      const hash = this.hashPassword(password, salt);

      await this.prismaService.$transaction(async (tx) => {
        await tx.user.update({
          where: { phone },
          data: {
            salt,
            password: hash,
          },
        });

        await tx.phoneVerification.delete({
          where: { id: phoneVerification.id },
        });
      });
    } catch (error) {
      this.logger.error(error.message);
      throw new InternalServerErrorException(
        '비밀번호를 변경하는 중 오류가 발생했습니다.',
      );
    }
  }

  public async createUserByProvider(
    createUserBodyDto: Prisma.UserCreateInput,
    provider: Provider,
    providerId: string,
  ): Promise<User> {
    const userExistsByProvider = await this.findOneByProvider(
      provider,
      providerId,
    );
    if (userExistsByProvider)
      throw new NotAcceptableException('이미 가입된 계정입니다.');

    const userExistsByPhone = await this.prismaService.user.findUnique({
      where: { phone: createUserBodyDto.phone },
    });
    if (userExistsByPhone)
      throw new NotAcceptableException('이미 가입된 전화번호입니다.');

    try {
      return await this.prismaService.user.create({
        data: {
          ...createUserBodyDto,
          password: '',
          salt: '',
          provider,
          providerId,
        },
      });
    } catch (error) {
      this.logger.error(error.message);
      throw new InternalServerErrorException(
        '사용자 정보를 저장하는 중 오류가 발생했습니다.',
      );
    }
  }

  public async updateUserById(
    userId: number,
    updateUserBodyDto: UpdateUserBodyDto,
  ): Promise<User> {
    const user = await this.findOneById(userId);
    if (!user) throw new NotFoundException('사용자 정보가 없습니다.');

    try {
      const { password, ...updateUser } = updateUserBodyDto;
      if (password) {
        const salt = crypto.randomBytes(32).toString('hex');
        const hash = this.hashPassword(password, salt);

        return await this.prismaService.user.update({
          where: { id: userId },
          data: {
            ...updateUser,
            password: hash,
            salt,
          },
        });
      }

      return await this.prismaService.user.update({
        where: { id: userId },
        data: updateUser,
      });
    } catch (error) {
      this.logger.error(error.message);
      throw new InternalServerErrorException(
        '사용자 정보를 수정하는 중 오류가 발생했습니다.',
      );
    }
  }

  public async updateUserRefreshToken(userId: number, refreshToken?: string) {
    try {
      return await this.prismaService.user.update({
        where: { id: userId },
        data: { refreshToken },
      });
    } catch (error) {
      this.logger.error(error.message);
      throw new InternalServerErrorException(
        '사용자 정보를 수정하는 중 오류가 발생했습니다.',
      );
    }
  }

  public async deleteUserById(userId: number): Promise<User> {
    const user = await this.findOneById(userId);
    if (!user) throw new NotFoundException('사용자 정보가 없습니다.');

    const workspace = await this.prismaService.workspaceUser.findFirst({
      where: { userId },
    });
    if (workspace)
      throw new NotAcceptableException(
        '모든 워크스페이스에서 탈퇴 후 회원 탈퇴가 가능합니다.',
      );

    try {
      return await this.prismaService.user.update({
        where: { id: userId },
        data: { deletedAt: new Date() },
      });
    } catch (error) {
      this.logger.error(error.message);
      throw new InternalServerErrorException(
        '사용자 정보를 삭제하는 중 오류가 발생했습니다.',
      );
    }
  }

  public async findOneByProvider(provider: Provider, providerId: string) {
    return this.prismaService.user.findUnique({
      where: {
        provider_providerId: {
          provider,
          providerId,
        },
      },
    });
  }

  public hashPassword(password: string, salt: string): string {
    const hash = crypto
      .pbkdf2Sync(password, salt, 1, 32, 'sha512')
      .toString('hex');

    return hash;
  }

  public hashChannel(userId: number): string {
    const secretKey = this.configService.getOrThrow<string>(
      'CHANNELTALK_SECRET_KEY',
    );

    const hash = crypto
      .createHmac('sha256', Buffer.from(secretKey, 'hex'))
      .update(userId.toString())
      .digest('hex');

    return hash;
  }

  public async getMe(id: number) {
    const user = await this.findOneById(id);
    const hash = this.hashChannel(id);

    return {
      ...user,
      hash,
    };
  }
}

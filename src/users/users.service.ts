import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { User } from '@prisma/client';
import * as crypto from 'crypto';

@Injectable()
export class UsersService {
  private readonly logger: Logger = new Logger(UsersService.name);
  constructor(private readonly prismaService: PrismaService) {}

  public async findOneById(userId: number): Promise<User> {
    try {
      const user = await this.prismaService.user.findUnique({
        where: { id: userId, deletedAt: null },
      });

      return user;
    } catch (error) {
      this.logger.error(error.message);
      throw new InternalServerErrorException(
        '사용자 정보를 가져오는 중 오류가 발생했습니다.',
      );
    }
  }

  public async findOneByEmail(email: string): Promise<User> {
    try {
      const user = await this.prismaService.user.findUnique({
        where: { email, deletedAt: null },
      });

      return user;
    } catch (error) {
      this.logger.error(error.message);
      throw new InternalServerErrorException(
        '사용자 정보를 가져오는 중 오류가 발생했습니다.',
      );
    }
  }

  public async createUser(createUserDto: CreateUserDto): Promise<User> {
    const userExistsByEmail = await this.findOneByEmail(createUserDto.email);
    if (userExistsByEmail)
      throw new NotAcceptableException('이미 가입된 이메일입니다.');

    try {
      const { password } = createUserDto;
      const salt = crypto.randomBytes(32).toString('hex');
      const hash = this.hashPassword(password, salt);

      const user = await this.prismaService.user.create({
        data: {
          ...createUserDto,
          password: hash,
          salt,
        },
      });

      return user;
    } catch (error) {
      this.logger.error(error.message);
      throw new InternalServerErrorException(
        '사용자 정보를 저장하는 중 오류가 발생했습니다.',
      );
    }
  }

  public async updateUserById(
    userId: number,
    updateUserDto: UpdateUserDto,
  ): Promise<User> {
    const user = await this.findOneById(userId);
    if (!user) throw new NotFoundException('사용자 정보가 없습니다.');

    try {
      const { password, ...updateUser } = updateUserDto;
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

  public async updateUserRefreshToken(userId: number, refreshToken: string) {
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

  public hashPassword(password: string, salt: string): string {
    const hash = crypto
      .pbkdf2Sync(password, salt, 1, 32, 'sha512')
      .toString('hex');

    return hash;
  }
}

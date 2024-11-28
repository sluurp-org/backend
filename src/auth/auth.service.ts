import { Injectable, NotFoundException } from '@nestjs/common';
import { LoginDto } from './dto/req/login.dto';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { TokenDto } from './dto/res/token.dto';
import { Provider, User } from '@prisma/client';
import { NaverService } from 'src/naver/naver.service';
import { GoogleService } from 'src/google/google.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly googleService: GoogleService,
    private readonly naverService: NaverService,
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  public async login(loginDto: LoginDto): Promise<TokenDto> {
    const { loginId, password } = loginDto;

    const user = await this.userService.findOneByLoginId(loginId);
    if (!user)
      throw new NotFoundException('비밀번호 또는 아이디가 일치하지 않습니다.');

    const hash = this.userService.hashPassword(password, user.salt);
    if (hash !== user.password)
      throw new NotFoundException('비밀번호 또는 아이디가 일치하지 않습니다.');

    const accessToken = this.generateAccessToken(user.id);
    const refreshToken = await this.generateRefreshToken(user.id);

    return { accessToken, refreshToken };
  }

  public async logout(userId: number): Promise<void> {
    await this.userService.updateUserRefreshToken(userId);
  }

  public async refresh(userId: number): Promise<TokenDto> {
    const accessToken = this.generateAccessToken(userId);
    const newRefreshToken = await this.generateRefreshToken(userId);

    return { accessToken, refreshToken: newRefreshToken };
  }

  public async validateUser(userId: number): Promise<User> {
    const user = await this.userService.findOneById(userId);
    if (!user) throw new NotFoundException('사용자를 찾을 수 없습니다.');

    return user;
  }

  public async validateRefreshToken(
    userId: number,
    refreshToken: string,
  ): Promise<boolean> {
    const user = await this.userService.findOneById(userId);
    if (!user) throw new NotFoundException('사용자를 찾을 수 없습니다.');

    return user.refreshToken === refreshToken;
  }

  public async naverLogin(code: string) {
    const profile = await this.naverService.getProfile(code);
    const user = await this.userService.findOneByProvider(
      Provider.NAVER,
      profile.id,
    );

    if (!user) {
      const newUser = await this.userService.createProviderUser(
        {
          name: profile.name,
          phone: profile.mobile,
          password: profile.id,
          loginId: profile.id,
          salt: profile.id,
        },
        Provider.NAVER,
        profile.id,
      );

      const accessToken = this.generateAccessToken(newUser.id);
      const refreshToken = await this.generateRefreshToken(newUser.id);

      return { accessToken, refreshToken };
    }

    const accessToken = this.generateAccessToken(user.id);
    const refreshToken = await this.generateRefreshToken(user.id);

    return { accessToken, refreshToken };
  }

  public async googleLogin(code: string) {
    const profile = await this.googleService.getProfile(code);
    const user = await this.userService.findOneByProvider(
      Provider.GOOGLE,
      profile.id,
    );

    if (!user)
      return {
        isRegister: true,
        id: profile.id,
        name: profile.name,
      };

    const accessToken = this.generateAccessToken(user.id);
    const refreshToken = await this.generateRefreshToken(user.id);

    return { accessToken, refreshToken };
  }

  private generateAccessToken(userId: number): string {
    const secret = this.configService.get<string>(
      'ACCESS_TOKEN_SECRET',
      'secret',
    );
    const expiresIn = this.configService.get<string>(
      'ACCESS_TOKEN_EXPIRES_IN',
      '1h',
    );

    const payload = { sub: userId };
    return this.jwtService.sign(payload, { secret, expiresIn });
  }

  private async generateRefreshToken(userId: number): Promise<string> {
    const secret = this.configService.get<string>(
      'REFRESH_TOKEN_SECRET',
      'secret',
    );
    const expiresIn = this.configService.get<string>(
      'REFRESH_TOKEN_EXPIRES_IN',
      '7d',
    );

    const payload = { sub: userId };
    const token = this.jwtService.sign(payload, { secret, expiresIn });
    await this.userService.updateUserRefreshToken(userId, token);

    return token;
  }
}

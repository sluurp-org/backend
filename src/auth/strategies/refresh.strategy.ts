import { ExtractJwt, Strategy, VerifiedCallback } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';
import { Request } from 'express';
import { Payload } from '../interface/payload.interface';
import { StrategyType } from '../enum/strategy.enum';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  StrategyType.REFRESH,
) {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {
    const secretOrKey = configService.get<string>(
      'REFRESH_TOKEN_SECRET',
      'secret',
    );

    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
      ignoreExpiration: false,
      passReqToCallback: true,
      secretOrKey,
    });
  }

  async validate(
    req: Request,
    payload: Payload,
    done: VerifiedCallback,
  ): Promise<void> {
    const refreshToken = req.body?.refreshToken ?? '';
    if (!refreshToken)
      throw new UnauthorizedException('세션이 만료되었습니다.');

    const user = await this.authService.validateUser(payload.sub);
    const validateRefreshToken = await this.authService.validateRefreshToken(
      user.id,
      refreshToken,
    );
    if (!validateRefreshToken)
      throw new UnauthorizedException('세션이 만료되었습니다.');

    return done(null, user);
  }
}

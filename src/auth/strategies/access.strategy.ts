import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';
import { Payload } from '../interface/payload.interface';
import { StrategyType } from '../enum/strategy.enum';

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(
  Strategy,
  StrategyType.ACCESS,
) {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    const secretOrKey = configService.get<string>(
      'ACCESS_TOKEN_SECRET',
      'secret',
    );

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey,
    });
  }

  async validate(payload: Payload) {
    return await this.authService.validateUser(payload.sub);
  }
}

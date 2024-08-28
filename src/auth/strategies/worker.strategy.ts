import { BasicStrategy as Strategy } from 'passport-http';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { StrategyType } from '../enum/strategy.enum';

@Injectable()
export class WorkerStrategy extends PassportStrategy(
  Strategy,
  StrategyType.WORKER,
) {
  constructor(private readonly configService: ConfigService) {
    super({
      passReqToCallback: true,
    });
  }

  public validate = async (req, username, password): Promise<boolean> => {
    //TODO: DB에 저장된 워커 정보와 비교하여 인증
    if (
      this.configService.get<string>('WORKER_USERNAME') === username &&
      this.configService.get<string>('WORKER_PASSWORD') === password
    )
      return true;

    throw new UnauthorizedException('인증되지 않은 워커입니다.');
  };
}

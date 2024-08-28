import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from 'src/users/users.module';
import { AccessTokenStrategy } from './strategies/access.strategy';
import { RefreshTokenStrategy } from './strategies/refresh.strategy';
import { JwtModule } from '@nestjs/jwt';
import { WorkerStrategy } from './strategies/worker.strategy';

@Module({
  imports: [JwtModule, UsersModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    AccessTokenStrategy,
    RefreshTokenStrategy,
    WorkerStrategy,
  ],
})
export class AuthModule {}

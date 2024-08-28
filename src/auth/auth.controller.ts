import { Body, Controller, Post, Res, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';

import { StrategyType } from './enum/strategy.enum';
import { Auth } from './decorators/auth.decorator';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ReqUser } from 'src/common/decorators/req-user.decorator';
import { User } from '@prisma/client';
import { AuthGuard } from '@nestjs/passport';
import { RefreshDto } from './dto/refresh.dto';
import { Response } from 'express';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: '로그인' })
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const token = await this.authService.login(loginDto);

    res.cookie('accessToken', token.accessToken, {
      domain: 'localhost',
      httpOnly: false,
      secure: true,
      sameSite: 'none',
    });

    res.cookie('refreshToken', token.refreshToken, {
      domain: 'localhost',
      httpOnly: false,
      secure: true,
      sameSite: 'none',
    });

    return token;
  }

  @Auth()
  @Post('logout')
  @ApiOperation({ summary: '로그아웃' })
  async logout(@ReqUser() user: User) {
    return this.authService.logout(user.id);
  }

  @Post('refresh')
  @UseGuards(AuthGuard(StrategyType.REFRESH))
  @ApiOperation({ summary: '토큰 갱신' })
  @ApiBody({ type: RefreshDto })
  async refresh(
    @ReqUser() user: User,
    @Res({ passthrough: true }) res: Response,
  ) {
    const token = await this.authService.refresh(user.id);
    res.cookie('accessToken', token.accessToken, {
      domain: 'localhost',
      httpOnly: false,
      secure: true,
      sameSite: 'none',
    });

    res.cookie('refreshToken', token.refreshToken, {
      domain: 'localhost',
      httpOnly: false,
      secure: true,
      sameSite: 'none',
    });

    return token;
  }
}

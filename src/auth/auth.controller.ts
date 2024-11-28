import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Redirect,
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { StrategyType } from './enum/strategy.enum';
import { Auth } from './decorators/auth.decorator';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/req/login.dto';
import { ReqUser } from 'src/common/decorators/req-user.decorator';
import { User } from '@prisma/client';
import { AuthGuard } from '@nestjs/passport';
import { RefreshDto } from './dto/req/refresh.dto';
import { Serialize } from 'src/common/decorators/serialize.decorator';
import { TokenDto } from './dto/res/token.dto';
import { NaverService } from 'src/naver/naver.service';
import { ConfigService } from '@nestjs/config';
import { GoogleService } from 'src/google/google.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly naverService: NaverService,
    private readonly googleService: GoogleService,
    private readonly configService: ConfigService,
  ) {}

  @Post('login')
  @Serialize(TokenDto)
  @ApiOperation({ summary: '로그인' })
  @ApiResponse({
    status: 200,
    type: TokenDto,
  })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Auth()
  @Post('logout')
  @ApiOperation({ summary: '로그아웃' })
  async logout(@ReqUser() user: User) {
    return this.authService.logout(user.id);
  }

  @Post('refresh')
  @Serialize(TokenDto)
  @UseGuards(AuthGuard(StrategyType.REFRESH))
  @ApiOperation({ summary: '토큰 갱신' })
  @ApiBody({ type: RefreshDto })
  @ApiResponse({
    status: 200,
    type: TokenDto,
  })
  async refresh(@ReqUser() user: User) {
    return this.authService.refresh(user.id);
  }

  @Get('naver')
  @Redirect()
  @ApiOperation({ summary: '네이버 로그인' })
  async naver() {
    return {
      url: this.naverService.getAuthorizationUrl(),
    };
  }

  @Get('naver/callback')
  @ApiOperation({
    summary: '네이버 로그인 콜백',
  })
  @Serialize(TokenDto)
  @ApiResponse({
    status: 200,
    type: TokenDto,
  })
  async naverCallback(@Query('code') code: string) {
    return this.authService.naverLogin(code);
  }

  @Get('google')
  @Redirect()
  @ApiOperation({ summary: '구글 로그인' })
  async google() {
    return {
      url: this.googleService.getAuthorizationUrl(),
    };
  }

  @Get('google/callback')
  @ApiOperation({
    summary: '네이버 로그인 콜백',
  })
  @Serialize(TokenDto)
  @ApiResponse({
    status: 200,
    type: TokenDto,
  })
  async googleCallback(@Query('code') code: string) {
    return this.authService.googleLogin(code);
  }
}

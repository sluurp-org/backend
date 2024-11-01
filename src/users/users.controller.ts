import {
  Controller,
  Get,
  Delete,
  Patch,
  Post,
  Body,
  Put,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { User, VerificationType } from '@prisma/client';

import { ReqUser } from 'src/common/decorators/req-user.decorator';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { UsersService } from './users.service';
import { CreateUserBodyDto } from './dto/req/create-user-body.dto';
import { UserDto } from './dto/res/user.dto';
import { Serialize } from 'src/common/decorators/serialize.decorator';
import { UpdateUserBodyDto } from './dto/req/update-user-body.dto';
import { UserMeDto } from './dto/res/user-me.dto';
import { CreatePhoneCodeBodyDto } from './dto/req/create-phone-code-body.dto';
import { FindUserByPhoneBodyDto } from './dto/req/find-user-by-phone-body.dto';
import { ChangePasswordByCodeDto } from './dto/req/find-user-by-phone-body.dto copy';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('code')
  @ApiOperation({ summary: '인증 코드 요청' })
  @ApiResponse({
    status: 200,
  })
  async requestCode(@Body() { name, phone }: CreatePhoneCodeBodyDto) {
    return await this.usersService.phoneVerification(name, phone);
  }

  @Post('change-password')
  @ApiOperation({ summary: '비밀번호 변경 인증 코드 요청' })
  @ApiResponse({
    status: 200,
  })
  async requestPasswordChangeCode(
    @Body() { name, phone }: FindUserByPhoneBodyDto,
  ) {
    await this.usersService.findOneByPhone(phone, name);

    return await this.usersService.phoneVerification(
      name,
      phone,
      VerificationType.FIND_PASSWORD,
    );
  }

  @Put('change-password')
  @ApiOperation({ summary: '비밀번호 변경' })
  @ApiResponse({
    status: 200,
  })
  async changePasswordByCodeRequest(@Body() dto: ChangePasswordByCodeDto) {
    return await this.usersService.changePasswordByCode(dto);
  }

  @Post()
  @ApiOperation({ summary: '회원가입' })
  @ApiResponse({
    status: 200,
    type: UserDto,
  })
  @Serialize(UserDto)
  async createUser(@Body() createUserBodyDto: CreateUserBodyDto) {
    return await this.usersService.createUser(createUserBodyDto);
  }

  @Auth()
  @Get('me')
  @ApiResponse({
    status: 200,
    type: UserMeDto,
  })
  @Serialize(UserMeDto)
  async getMe(@ReqUser() user: User) {
    return await this.usersService.getMe(user.id);
  }

  @Auth()
  @Patch('me')
  @ApiOperation({ summary: '내 정보 수정' })
  @ApiResponse({
    status: 200,
    type: UserDto,
  })
  @Serialize(UserDto)
  async updateMe(
    @Body() updateUserBodyDto: UpdateUserBodyDto,
    @ReqUser() user: User,
  ) {
    return await this.usersService.updateUserById(user.id, updateUserBodyDto);
  }

  @Auth()
  @Delete('me')
  @ApiOperation({ summary: '회원 탈퇴' })
  @ApiResponse({
    status: 200,
    type: UserDto,
  })
  @Serialize(UserDto)
  async deleteMe(@ReqUser() user: User) {
    return await this.usersService.deleteUserById(user.id);
  }
}

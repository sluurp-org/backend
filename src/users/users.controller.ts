import { Controller, Get, Delete, Patch, Post, Body } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { plainToInstance } from 'class-transformer';

import { ReqUser } from 'src/common/decorators/req-user.decorator';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { GetUserDto } from './dto/get-user.dto';
import { UsersService } from './users.service';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: '회원가입' })
  @ApiResponse({ type: GetUserDto })
  async createUser(@Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.createUser(createUserDto);
    return plainToInstance(GetUserDto, user);
  }

  @Auth()
  @Get('me')
  @ApiOperation({ summary: '내 정보 조회' })
  @ApiResponse({ type: GetUserDto })
  async getMe(@ReqUser() user: User) {
    return plainToInstance(GetUserDto, user);
  }

  @Auth()
  @Patch('me')
  @ApiOperation({ summary: '내 정보 수정' })
  @ApiResponse({ type: GetUserDto })
  async updateMe(@Body() updateUserDto: UpdateUserDto, @ReqUser() user: User) {
    const updatedUser = await this.usersService.updateUserById(
      user.id,
      updateUserDto,
    );
    return plainToInstance(GetUserDto, updatedUser);
  }

  @Auth()
  @Delete('me')
  @ApiOperation({ summary: '회원 탈퇴' })
  @ApiResponse({ type: GetUserDto })
  async deleteMe(@ReqUser() user: User) {
    const deletedUser = await this.usersService.deleteUserById(user.id);
    return plainToInstance(GetUserDto, deletedUser);
  }
}

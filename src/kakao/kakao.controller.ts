import {
  Body,
  Delete,
  Get,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { KakaoService } from './kakao.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { WorkspaceController } from 'src/common/decorators/workspace-controller.decorator';
import { ReqWorkspace } from 'src/common/decorators/req-workspace.decorator';
import { Workspace, WorkspaceRole } from '@prisma/client';
import { WorkspaceAuth } from 'src/workspace/decorator/workspace-auth.decorator';
import { KakaoDto } from './dto/res/kakao.dto';
import { Serialize } from 'src/common/decorators/serialize.decorator';
import { ConnectChannelBodyDto } from './dto/req/connect-channel-body.dto';
import { RequestChannelTokenBodyDto } from './dto/req/request-channel-token-body.dto';
import { KakaoCategoryDto } from './dto/res/kakao-categories.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('kakao')
@WorkspaceController('kakao')
export class KakaoController {
  constructor(private readonly kakaoService: KakaoService) {}

  @Get('category')
  @ApiOperation({
    summary: '카카오 채널 카테고리 조회',
  })
  @ApiResponse({
    status: 200,
    description: '카카오 채널 카테고리 조회 성공',
    type: KakaoCategoryDto,
  })
  @Serialize(KakaoCategoryDto)
  @WorkspaceAuth([WorkspaceRole.OWNER])
  async getKakaoCategories() {
    return {
      categories: await this.kakaoService.getKakaoCategories(),
    };
  }

  @Get('category/message')
  @ApiOperation({
    summary: '카카오 메세지 카테고리 조회',
  })
  @ApiResponse({
    status: 200,
    description: '카카오 메세지 카테고리 조회 성공',
    type: KakaoCategoryDto,
  })
  @Serialize(KakaoCategoryDto)
  @WorkspaceAuth([WorkspaceRole.OWNER])
  async getKakaoMessageCategories() {
    return {
      categories: await this.kakaoService.getKakaoMessageCategories(),
    };
  }

  @Get()
  @ApiOperation({
    summary: '워크스페이스 카카오 채널 정보 조회',
  })
  @ApiResponse({
    status: 200,
    description: '워크스페이스 카카오 채널 정보 조회 성공',
    type: KakaoDto,
  })
  @Serialize(KakaoDto)
  @WorkspaceAuth([WorkspaceRole.OWNER])
  async findWorkspaceKakao(@ReqWorkspace() { id }: Workspace) {
    return this.kakaoService.findWorkspaceKakao(id);
  }

  @Post('token')
  @ApiOperation({
    summary: '워크스페이스 카카오 채널 토큰 요청',
  })
  @ApiResponse({
    status: 200,
    description: '워크스페이스 카카오 채널 토큰 요청 성공',
    type: Boolean,
  })
  @WorkspaceAuth([WorkspaceRole.OWNER])
  async requestWorkspaceKakaoToken(@Body() dto: RequestChannelTokenBodyDto) {
    return this.kakaoService.requestKakaoChannelToken(dto);
  }

  @Post()
  @ApiOperation({
    summary: '워크스페이스 카카오 채널 정보 생성',
  })
  @ApiResponse({
    status: 200,
    description: '워크스페이스 카카오 채널 정보 생성 성공',
    type: KakaoDto,
  })
  @Serialize(KakaoDto)
  @WorkspaceAuth([WorkspaceRole.OWNER])
  async createWorkspaceKakao(
    @ReqWorkspace() { id }: Workspace,
    @Body() dto: ConnectChannelBodyDto,
  ) {
    return this.kakaoService.connectKakaoChannel(id, dto);
  }

  @Delete()
  @ApiOperation({
    summary: '워크스페이스 카카오 채널 정보 삭제',
  })
  @ApiResponse({
    status: 200,
    description: '워크스페이스 카카오 채널 정보 삭제 성공',
    type: KakaoDto,
  })
  @Serialize(KakaoDto)
  @WorkspaceAuth([WorkspaceRole.OWNER])
  async deleteWorkspaceKakao(@ReqWorkspace() { id }: Workspace) {
    return this.kakaoService.deleteKakaoChannel(id);
  }

  @Post('image')
  @ApiOperation({
    summary: '카카오 이미지 업로드',
  })
  @ApiResponse({
    status: 200,
    description: '카카오 이미지 업로드 성공',
    type: String,
  })
  @WorkspaceAuth([WorkspaceRole.OWNER, WorkspaceRole.MEMBER])
  @UseInterceptors(FileInterceptor('file'))
  async uploadKakaoImage(@UploadedFile() file: Express.Multer.File) {
    return this.kakaoService.uploadKakaoImage(file);
  }
}

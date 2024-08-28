import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  UseInterceptors,
} from '@nestjs/common';
import { KakaoService } from './kakao.service';
import { CategoriesResponseDto } from './dto/categories-response.dto';
import { plainToInstance } from 'class-transformer';

@Controller('kakao')
export class KakaoController {
  constructor(private readonly kakaoService: KakaoService) {}

  @Get('categories')
  @UseInterceptors(ClassSerializerInterceptor)
  async getCategories(): Promise<CategoriesResponseDto> {
    const categories = await this.kakaoService.getCategories();

    return plainToInstance(CategoriesResponseDto, {
      categories,
    });
  }
}

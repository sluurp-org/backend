import { applyDecorators, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { StrategyType } from '../enum/strategy.enum';

export function Auth() {
  return applyDecorators(
    ApiBearerAuth(`accessToken`),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    UseGuards(AuthGuard(StrategyType.ACCESS)),
  );
}

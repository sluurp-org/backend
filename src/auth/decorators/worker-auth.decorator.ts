import { applyDecorators, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBasicAuth, ApiResponse } from '@nestjs/swagger';
import { StrategyType } from '../enum/strategy.enum';

export function WorkerAuth() {
  return applyDecorators(
    ApiBasicAuth(`worker`),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    UseGuards(AuthGuard(StrategyType.WORKER)),
  );
}

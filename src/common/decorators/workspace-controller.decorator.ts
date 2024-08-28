import { applyDecorators, Controller, ControllerOptions } from '@nestjs/common';
import { ApiParam } from '@nestjs/swagger';
import { isObject } from 'class-validator';

export function WorkspaceController(
  controllerOptions: string | ControllerOptions,
) {
  const path =
    'workspace/:workspaceId/' +
    (typeof controllerOptions === 'string'
      ? controllerOptions
      : controllerOptions.path);

  const options = isObject(controllerOptions)
    ? { ...controllerOptions, path }
    : { path };

  return applyDecorators(
    Controller(options),
    ApiParam({
      name: 'workspaceId',
      description: '워크스페이스 아이디',
      example: '1',
    }),
  );
}

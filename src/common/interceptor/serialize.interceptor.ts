import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import {
  instanceToPlain,
  plainToClassFromExist,
  plainToInstance,
} from 'class-transformer';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PaginatedResponseDto } from '../dto/res/paginated.dto';

export interface ClassConstructor {
  new (...args: any[]);
}

export class SerializeInterceptor implements NestInterceptor {
  constructor(
    private dto: ClassConstructor,
    private paginated: boolean = false,
  ) {}

  intercept(
    _: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    return next.handle().pipe(
      map((data: any) => {
        if (
          data instanceof this.dto ||
          (data instanceof Array && data[0] instanceof this.dto)
        ) {
          return instanceToPlain(data, {
            excludeExtraneousValues: true,
          });
        }

        if (this.paginated) {
          const inst = plainToClassFromExist(
            new PaginatedResponseDto<typeof this.dto>(this.dto),
            data,
          );

          return instanceToPlain(inst, {
            excludeExtraneousValues: true,
          });
        }

        const inst = plainToInstance(this.dto, data) as any;
        return instanceToPlain(inst, {
          excludeExtraneousValues: true,
        });
      }),
    );
  }
}

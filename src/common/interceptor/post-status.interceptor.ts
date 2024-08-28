import {
  CallHandler,
  ExecutionContext,
  Injectable,
  HttpStatus,
} from '@nestjs/common';
import { map } from 'rxjs/operators';

// POST 요청이 성공적으로 처리되면 200 상태 코드를 반환하도록 하는 인터셉터
@Injectable()
export class PostStatusInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    const ctx = context.switchToHttp();
    const req = ctx.getRequest();
    const res = ctx.getResponse();
    return next.handle().pipe(
      map((value) => {
        if (req.method === 'POST') {
          if (res.statusCode === HttpStatus.CREATED) {
            res.status(HttpStatus.OK);
          }
        }
        return value;
      }),
    );
  }
}

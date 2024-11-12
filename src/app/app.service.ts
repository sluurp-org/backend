import { Injectable } from '@nestjs/common';
import { KakaoService } from '../kakao/kakao.service';
import { RequestSampleMessageBodyDto } from './dto/req/request-sample-message-body.dto';

@Injectable()
export class AppService {
  constructor(private readonly kakaoService: KakaoService) {}

  getHello(): string {
    return 'Hello World!';
  }

  public async sendAlimtalk(dto: RequestSampleMessageBodyDto) {
    const { to } = dto;

    const currentDate = new Date().getTime().toString();
    await this.kakaoService.sendKakaoMessage([
      {
        to,
        templateId: 'KA01TP241103124654882WqEe2U0zQkI',
        variables: {
          '#{구매자명}': '홍길동',
          '#{주문번호}': currentDate,
          '#{상품주문번호}': currentDate,
          '#{상품명}': '스르륵 테스트 상품',
          '#{상품옵션명}': '1개월 무료 체험권',
          '#{상품안내}':
            '스르륵에서 주문 수집 시 발송되는 알림톡 입니다!\n\n메시지에 디지털 컨텐츠를 첨부하거나 구매확정 또는 리뷰 작성 요청을 할 수 있습니다 ☺️',
          '#{이벤트아이디}': 'test',
        },
      },
    ]);
  }
}

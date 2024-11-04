import { HttpService } from '@nestjs/axios';
import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { isAxiosError } from 'axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class PortoneService {
  private readonly logger = new Logger(PortoneService.name);
  private channelKey: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.channelKey = this.configService.getOrThrow('PORTONE_CHANNEL_KEY');
  }

  public async createBillingKey(
    number: string,
    expiryYear: string,
    expiryMonth: string,
    birthOrBusinessRegistrationNumber: string,
    passwordTwoDigits: string,
    customData?: string,
  ) {
    try {
      const billingKeyResponse = await firstValueFrom(
        this.httpService.post('/billing-keys', {
          channelKey: this.channelKey,
          method: {
            card: {
              credential: {
                number,
                expiryYear,
                expiryMonth,
                birthOrBusinessRegistrationNumber,
                passwordTwoDigits,
              },
            },
          },
          customData,
        }),
      );

      const { billingKeyInfo } = billingKeyResponse.data;
      if (!billingKeyInfo || !billingKeyInfo.billingKey) {
        throw new InternalServerErrorException('카드 등록에 실패했습니다.');
      }

      return billingKeyInfo.billingKey;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('카드 등록에 실패했습니다.');
    }
  }

  public async deleteBillingKey(billingKey: string) {
    try {
      await firstValueFrom(
        this.httpService.delete(`/billing-keys/${billingKey}`),
      );

      return true;
    } catch (error) {
      throw new InternalServerErrorException('카드 삭제에 실패했습니다.');
    }
  }

  public async getPayment(paymentId: string) {
    try {
      const paymentResponse = await firstValueFrom(
        this.httpService.get(`/payments/${paymentId}`),
      );

      if (!paymentResponse.data) {
        throw new InternalServerErrorException(
          '결제 정보를 가져오는데 실패했습니다.',
        );
      }

      return paymentResponse.data;
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 404) {
        throw new NotFoundException('결제 정보를 찾을 수 없습니다.');
      }

      throw new InternalServerErrorException(
        '결제 정보를 가져오는데 실패했습니다.',
      );
    }
  }

  public async requestPayment(
    paymentKey: string,
    billingKey: string,
    orderDetail: {
      orderName: string;
      ordererId: string;
      ordererName: string;
      amount: number;
    },
    customData?: string,
  ) {
    const { orderName, ordererId, ordererName, amount } = orderDetail;

    try {
      const paymentResponse = await firstValueFrom(
        this.httpService.post(
          `/payments/${encodeURIComponent(paymentKey)}/billing-key`,
          {
            billingKey,
            orderName,
            currency: 'KRW',
            customer: {
              id: ordererId,
              name: { full: ordererName },
            },
            amount: { total: amount },
            customData,
          },
        ),
      );

      const { payment } = paymentResponse.data;
      if (!payment || !payment.paidAt) {
        throw new InternalServerErrorException('결제 요청에 실패했습니다.');
      }

      return payment.paidAt;
    } catch (error) {
      if (isAxiosError(error)) {
        if (error.response?.status === 409) {
          throw new ConflictException('결제가 이미 완료되었습니다.');
        }

        console.log(error?.response?.data);
      }

      throw new InternalServerErrorException('결제 요청에 실패했습니다.');
    }
  }

  public async requestScheduledPayment(
    paymentKey: string,
    billingKey: string,
    timeToPay: Date,
    orderDetail: {
      orderName: string;
      ordererId: string;
      ordererName: string;
      amount: number;
    },
    customData?: string,
  ) {
    const { orderName, ordererId, ordererName, amount } = orderDetail;

    try {
      const paymentResponse = await firstValueFrom(
        this.httpService.post(
          `/payments/${encodeURIComponent(paymentKey)}/schedule`,
          {
            payment: {
              billingKey,
              orderName,
              currency: 'KRW',
              customer: {
                id: ordererId,
                name: { full: ordererName },
              },
              amount: { total: amount },
            },
            timeToPay,
            customData,
          },
        ),
      );

      const { schedule } = paymentResponse.data;
      if (!schedule || !schedule.id) {
        throw new InternalServerErrorException('결제 요청에 실패했습니다.');
      }

      return schedule.id;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('결제 요청에 실패했습니다.');
    }
  }

  public async getPaymentSchedule(scheduleId: string) {
    try {
      const paymentSchedule = await firstValueFrom(
        this.httpService.get(`/payment-schedules/${scheduleId}`),
      );

      return paymentSchedule.data;
    } catch (error) {
      throw new InternalServerErrorException(
        '결제 예약건 조회에 실패했습니다.',
      );
    }
  }

  public async cancelScheduledPayment({
    scheduleIds,
  }: {
    scheduleIds: string[];
  }) {
    try {
      const paymentSchedules = await Promise.all(
        scheduleIds.map((scheduleId) => this.getPaymentSchedule(scheduleId)),
      );

      const paymentScheduleIds = paymentSchedules
        .filter((paymentSchedule) => paymentSchedule.status === 'SCHEDULED')
        .map((paymentSchedule) => paymentSchedule.id);

      const cancelScheduledPayment = await firstValueFrom(
        this.httpService.delete(`/payment-schedules`, {
          data: {
            scheduleIds: paymentScheduleIds,
          },
        }),
      );

      const { revokedScheduleIds } = cancelScheduledPayment.data;
      if (!revokedScheduleIds) {
        throw new InternalServerErrorException('결제 취소에 실패했습니다.');
      }

      return revokedScheduleIds;
    } catch (error) {
      throw new InternalServerErrorException('결제 취소에 실패했습니다.');
    }
  }
}

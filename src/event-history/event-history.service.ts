import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  ContentStatus,
  ContentType,
  EventStatus,
  StoreType,
} from '@prisma/client';
import { AwsService } from 'src/aws/aws.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class EventHistoryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly awsService: AwsService,
  ) {}

  private async validateDownloadAvailable(eventHistoryId: string) {
    const eventHistory = await this.prisma.eventHistory.findUnique({
      where: { id: eventHistoryId },
      include: {
        order: true,
        content: { include: { contentGroup: true } },
      },
    });

    const {
      content,
      expiredAt,
      downloadCount,
      status,
      disableDownload,
      order: { status: orderStatus },
    } = eventHistory;
    if (!content) throw new NotFoundException('다운로드 할 콘텐츠가 없습니다.');

    const { contentGroup, status: contentStatus } = content;
    const { downloadLimit } = contentGroup;

    if (disableDownload)
      // 판매자가 상품을 다운 불가능하도록 변경함
      throw new ForbiddenException('다운로드가 제한된 주문 입니다.');

    if (expiredAt && expiredAt < new Date())
      // 만료된 콘텐츠
      throw new ForbiddenException('만료된 콘텐츠입니다.');

    if (downloadLimit > 0 && downloadCount >= downloadLimit)
      // 다운로드 횟수가 초과됨
      throw new ForbiddenException('다운로드 횟수가 초과되었습니다.');

    if (!orderStatus)
      throw new ForbiddenException('접근할 수 없는 컨텐츠 입니다.');

    const validateOrderStatus = [
      'PAYED',
      'DELIVERED',
      'DELIVERING',
      'PURCHASE_CONFIRM',
    ].includes(orderStatus);
    if (!validateOrderStatus)
      throw new ForbiddenException('접근할 수 없는 주문 입니다.');

    if (status !== EventStatus.SUCCESS)
      // 접근할 수 없는 컨텐츠, 상품 발송 실패 또는 취소된 컨텐츠
      throw new ForbiddenException(
        '접근할 수 없는 주문 입니다. 판매자에게 문의하세요.',
      );

    if (contentStatus !== ContentStatus.READY)
      // 준비되지 않은 주문 입니다.
      throw new ForbiddenException(
        '준비되지 않은 주문 입니다. 판매자에게 문의하세요.',
      );

    return eventHistory;
  }

  public async findOne(eventHistoryId: string) {
    const eventHistory = await this.prisma.eventHistory.findUnique({
      where: { id: eventHistoryId },
    });
    if (!eventHistory)
      throw new NotFoundException('존재하지 않는 주문 입니다.');

    try {
      await this.validateDownloadAvailable(eventHistoryId);
    } catch (error) {
      return {
        ...eventHistory,
        downloadAvailable: false,
        downloadError: error.message,
      };
    }

    return {
      ...eventHistory,
      downloadAvailable: true,
      downloadError: null,
    };
  }

  public async downloadEventHistory(eventHistoryId: string) {
    const eventHistory = await this.validateDownloadAvailable(eventHistoryId);
    const { content } = eventHistory;
    const {
      id: contentId,
      name,
      text,
      extension,
      contentGroup: { type, id: contentGroupId },
    } = content;

    if (type === ContentType.FILE) {
      const key = `${contentGroupId}/${contentId}`;
      const encodedName = encodeURIComponent(name);
      const url = await this.awsService.createDownloadPresignedUrl(
        key,
        encodedName,
        extension,
      );

      return { url, type };
    }

    return { text, type };
  }

  public async getPurchaseConfirmRedirectUrl(eventHistoryId: string) {
    const eventHistory = await this.prisma.eventHistory.findUnique({
      where: { id: eventHistoryId },
      include: {
        order: {
          include: { store: true },
        },
      },
    });
    if (!eventHistory)
      throw new NotFoundException('존재하지 않는 주문 입니다.');

    const {
      order: {
        orderId,
        productOrderId,
        store: { type: storeType },
      },
    } = eventHistory;

    if (storeType !== StoreType.SMARTSTORE)
      throw new ForbiddenException('접근할 수 없는 주문 입니다.');

    const url = `https://orders.pay.naver.com/order/purchaseDecision/${orderId}?backUrl=${encodeURIComponent('https://orders.pay.naver.com/order/status/' + orderId)}&clickedId=${productOrderId}`;
    return url;
  }

  public async getReviewRedirectUrl(eventHistoryId: string) {
    const eventHistory = await this.prisma.eventHistory.findUnique({
      where: { id: eventHistoryId },
      include: {
        order: {
          include: { store: true },
        },
      },
    });
    if (!eventHistory)
      throw new NotFoundException('존재하지 않는 주문 입니다.');

    const {
      order: {
        orderId,
        productOrderId,
        store: { type: storeType },
      },
    } = eventHistory;

    if (storeType !== StoreType.SMARTSTORE)
      throw new ForbiddenException('접근할 수 없는 주문 입니다.');

    const returnUrl =
      'https://orders.pay.naver.com/order/purchaseDecision/bridge/reviewCompleted/success';
    const url = `https://shopping.naver.com/popup/reviews/form?orderNo=${orderId}&productOrderNos=${productOrderId}&returnUrl=${encodeURIComponent(returnUrl)}`;
    return url;
  }
}

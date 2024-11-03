import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ContentType, Prisma, StoreType } from '@prisma/client';
import { AwsService } from 'src/aws/aws.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class EventHistoryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly awsService: AwsService,
  ) {}

  private async validateContent(
    contentConnection: Prisma.EventHistoryContentConnectionGetPayload<{
      include: {
        content: true;
      };
    }>,
  ) {
    const {
      id,
      content,
      disableDownload,
      expiredAt,
      downloadLimit,
      downloadCount,
    } = contentConnection;
    if (disableDownload)
      return {
        downloadAvailable: false,
        error: '다운로드가 제한된 주문 입니다.\n판매자에게 문의하세요.',
      };

    if (expiredAt && expiredAt < new Date())
      return {
        downloadAvailable: false,
        error: '만료된 콘텐츠입니다.',
      };

    if (downloadLimit && downloadLimit > 0 && downloadCount >= downloadLimit)
      return {
        downloadAvailable: false,
        error: '다운로드 횟수가 초과되었습니다.',
      };

    if (!content)
      return {
        downloadAvailable: false,
        error: '다운로드 할 콘텐츠가 없습니다.',
      };

    return {
      downloadAvailable: true,
      content: { ...content, connectionId: id },
    };
  }

  public async findOne(eventHistoryId: string) {
    const eventHistory = await this.prisma.eventHistory.findUnique({
      where: { id: eventHistoryId },
      include: {
        order: {
          include: {
            product: true,
            productVariant: true,
          },
        },
        contents: {
          include: {
            content: true,
          },
        },
      },
    });
    if (!eventHistory || !eventHistory.order)
      throw new NotFoundException('존재하지 않는 주문 입니다.');

    const contents = await Promise.all(
      eventHistory.contents.map(async (contentItem) => {
        const { content, downloadAvailable, error } =
          await this.validateContent(contentItem);

        if (error) return { error };
        return { ...content, downloadAvailable };
      }),
    );

    return {
      ...eventHistory,
      order: {
        productName: eventHistory.order.product.name,
        productVariantName: eventHistory.order.productVariant?.name,
        ...eventHistory.order,
      },
      contents,
    };
  }

  public async downloadEventHistory(
    eventHistoryId: string,
    eventHistoryContentId: number,
  ) {
    const contentConnection =
      await this.prisma.eventHistoryContentConnection.findUnique({
        where: { id: eventHistoryContentId, eventHistoryId },
        include: {
          content: true,
        },
      });

    if (!contentConnection || !contentConnection.content)
      throw new NotFoundException('존재하지 않는 콘텐츠 입니다.');

    const { error } = await this.validateContent(contentConnection);
    if (error) throw new ForbiddenException(error);

    const {
      id: contentId,
      name,
      text,
      extension,
      contentGroupId,
      type,
    } = contentConnection.content;

    if (type === ContentType.FILE) {
      const key = `${contentGroupId}/${contentId}`;
      const encodedName = encodeURIComponent(name || '주문 파일');
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
    if (!eventHistory || !eventHistory.order)
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
    if (!eventHistory || !eventHistory.order)
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

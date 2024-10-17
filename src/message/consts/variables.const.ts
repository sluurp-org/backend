import { OrderStatus } from '@prisma/client';

export type AvailableVariables =
  | 'id'
  | 'eventId'
  | 'productOrderId'
  | 'orderId'
  | 'status'
  | 'ordererName'
  | 'ordererPhone'
  | 'receiverName'
  | 'receiverPhone'
  | 'price'
  | 'quantity'
  | 'orderAt'
  | 'deliveryAddress'
  | 'deliveryMessage'
  | 'deliveryCompany'
  | 'deliveryTrackingNumber';

export interface Variables {
  id: number;
  eventId: string;
  productOrderId: string;
  orderId: string;
  status: OrderStatus;
  ordererName: string;
  ordererPhone: string;
  receiverName: string;
  receiverPhone: string;
  price: number;
  quantity: number;
  orderAt: Date;
  deliveryAddress: string;
  deliveryMessage: string;
  deliveryCompany: string;
  deliveryTrackingNumber: string;
}

export const variablesMapping: Record<string, AvailableVariables> = {
  '{자체주문번호}': 'id',
  '{자체이벤트아이디}': 'eventId',
  '{상품주문번호}': 'productOrderId',
  '{주문번호}': 'orderId',
  '{주문상태}': 'status',
  '{주문자이름}': 'ordererName',
  '{주문자전화번호}': 'ordererPhone',
  '{수신자이름}': 'receiverName',
  '{수신자전화번호}': 'receiverPhone',
  '{가격}': 'price',
  '{수량}': 'quantity',
  '{주문일시}': 'orderAt',
  '{배송주소}': 'deliveryAddress',
  '{배송메모}': 'deliveryMessage',
  '{배송사}': 'deliveryCompany',
  '{송장번호}': 'deliveryTrackingNumber',
};

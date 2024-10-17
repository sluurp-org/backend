export interface ProductResponse {
  contents: Content[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  sort: Sort;
  first: boolean;
  last: boolean;
}

export interface Content {
  groupProductNo: number;
  originProductNo: number;
  channelProducts: ChannelProduct[];
}

interface ChannelProduct {
  groupProductNo: number;
  originProductNo: number;
  channelProductNo: number;
  channelServiceType: string;
  '수급 상품번호': number; // 수급 상품번호는 영어로 바꾸거나, key를 string으로 유지해야 합니다.
  categoryId: string;
  name: string;
  sellerManagementCode: string;
  statusType: string;
  channelProductDisplayStatusType: string;
  salePrice: number;
  discountedPrice: number;
  mobileDiscountedPrice: number;
  stockQuantity: number;
  knowledgeShoppingProductRegistration: boolean;
  deliveryAttributeType: string;
  deliveryFee: number;
  returnFee: number;
  exchangeFee: number;
  multiPurchaseDiscount: number;
  multiPurchaseDiscountUnitType: string;
  sellerPurchasePoint: number;
  sellerPurchasePointUnitType: string;
  managerPurchasePoint: number;
  textReviewPoint: number;
  photoVideoReviewPoint: number;
  regularCustomerPoint: number;
  freeInterest: number;
  gift: string;
  saleStartDate: string; // ISO 형식의 날짜이므로 string으로 지정
  saleEndDate: string; // ISO 형식의 날짜이므로 string으로 지정
  wholeCategoryName: string;
  wholeCategoryId: string;
  representativeImage: RepresentativeImage;
  modelId: number;
  modelName: string;
  brandName: string;
  manufacturerName: string;
  sellerTags: SellerTag[];
  regDate: string; // ISO 형식의 날짜이므로 string으로 지정
  modifiedDate: string; // ISO 형식의 날짜이므로 string으로 지정
}

interface RepresentativeImage {
  url: string;
}

interface SellerTag {
  code: number;
  text: string;
}

interface Sort {
  sorted: boolean;
  fields: SortField[];
}

interface SortField {
  name: string;
  direction: string;
}

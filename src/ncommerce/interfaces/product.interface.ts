export interface ProductDetails {
  groupProduct: GroupProduct;
  originProduct: OriginProduct;
  windowChannelProduct: ChannelProduct;
  smartstoreChannelProduct: ChannelProduct;
}

interface GroupProduct {
  groupProductNo: number;
  leafCategoryId: string;
  groupProductName: string;
}

interface OriginProduct {
  statusType: string;
  saleType: string;
  leafCategoryId: string;
  name: string;
  detailContent: string;
  images: Images;
  saleStartDate: string;
  saleEndDate: string;
  salePrice: number;
  stockQuantity: number;
  deliveryInfo: DeliveryInfo;
  productLogistics: ProductLogistic[];
  detailAttribute: DetailAttribute;
  customerBenefit: CustomerBenefit;
}

interface Images {
  representativeImage: Image;
  optionalImages: Image[];
}

interface Image {
  url: string;
}

interface DeliveryInfo {
  deliveryType: string;
  deliveryAttributeType: string;
  deliveryCompany: string;
  outboundLocationId: string;
  deliveryBundleGroupUsable: boolean;
  deliveryBundleGroupId: number;
  quickServiceAreas: string[];
  visitAddressId: number;
  deliveryFee: DeliveryFee;
  claimDeliveryInfo: ClaimDeliveryInfo;
  installationFee: boolean;
  expectedDeliveryPeriodType: string;
  expectedDeliveryPeriodDirectInput: string;
  todayStockQuantity: number;
  customProductAfterOrderYn: boolean;
  hopeDeliveryGroupId: number;
  businessCustomsClearanceSaleYn: boolean;
}

interface DeliveryFee {
  deliveryFeeType: string;
  baseFee: number;
  freeConditionalAmount: number;
  repeatQuantity: number;
  secondBaseQuantity: number;
  secondExtraFee: number;
  thirdBaseQuantity: number;
  thirdExtraFee: number;
  deliveryFeePayType: string;
  deliveryFeeByArea: DeliveryFeeByArea;
  differentialFeeByArea: string;
}

interface DeliveryFeeByArea {
  deliveryAreaType: string;
  area2extraFee: number;
  area3extraFee: number;
}

interface ClaimDeliveryInfo {
  returnDeliveryCompanyPriorityType: string;
  returnDeliveryFee: number;
  exchangeDeliveryFee: number;
  shippingAddressId: number;
  returnAddressId: number;
  freeReturnInsuranceYn: boolean;
}

interface ProductLogistic {
  logisticsCompanyId: string;
  logisticsCenterId: string;
}

interface DetailAttribute {
  naverShoppingSearchInfo: NaverShoppingSearchInfo;
  afterServiceInfo: AfterServiceInfo;
  purchaseQuantityInfo: PurchaseQuantityInfo;
  originAreaInfo: OriginAreaInfo;
  sellerCodeInfo: SellerCodeInfo;
  optionInfo: OptionInfo;
  supplementProductInfo: SupplementProductInfo;
  purchaseReviewInfo: PurchaseReviewInfo;
  isbnInfo: IsbnInfo;
  bookInfo: BookInfo;
  eventPhraseCont: string;
  manufactureDate: string;
  releaseDate: string;
  validDate: string;
  taxType: string;
  productCertificationInfos: ProductCertificationInfo[];
  certificationTargetExcludeContent: CertificationTargetExcludeContent;
  sellerCommentContent: string;
  sellerCommentUsable: boolean;
  minorPurchasable: boolean;
  ecoupon: Ecoupon;
  productInfoProvidedNotice: ProductInfoProvidedNotice;
  productAttributes: ProductAttribute[];
  cultureCostIncomeDeductionYn: boolean;
  customProductYn: boolean;
  itselfProductionProductYn: boolean;
  brandCertificationYn: boolean;
  seoInfo: SeoInfo;
}

interface NaverShoppingSearchInfo {
  modelId: number;
  modelName: string;
  manufacturerName: string;
  brandId: number;
  brandName: string;
  catalogMatchingYn: boolean;
}

interface AfterServiceInfo {
  afterServiceTelephoneNumber: string;
  afterServiceGuideContent: string;
}

interface PurchaseQuantityInfo {
  minPurchaseQuantity: number;
  maxPurchaseQuantityPerId: number;
  maxPurchaseQuantityPerOrder: number;
}

interface OriginAreaInfo {
  originAreaCode: string;
  importer: string;
  content: string;
  plural: boolean;
}

interface SellerCodeInfo {
  sellerManagementCode: string;
  sellerBarcode: string;
  sellerCustomCode1: string;
  sellerCustomCode2: string;
}

interface OptionInfo {
  simpleOptionSortType: string;
  optionSimple: OptionSimple[];
  optionCustom: OptionCustom[];
  optionCombinationSortType: string;
  optionCombinationGroupNames: OptionCombinationGroupNames;
  optionCombinations: OptionCombination[];
  standardOptionGroups: StandardOptionGroup[];
  optionStandards: OptionStandard[];
  useStockManagement: boolean;
  optionDeliveryAttributes: string[];
}

interface OptionSimple {
  id: number;
  groupName: string;
  name: string;
  usable: boolean;
}

interface OptionCustom {
  id: number;
  groupName: string;
  name: string;
  usable: boolean;
}

interface OptionCombinationGroupNames {
  optionGroupName1: string;
  optionGroupName2: string;
  optionGroupName3: string;
  optionGroupName4: string;
}

interface OptionCombination {
  id: number;
  optionName1: string;
  optionName2: string;
  optionName3: string;
  optionName4: string;
  stockQuantity: number;
  price: number;
  sellerManagerCode: string;
  usable: boolean;
}

interface StandardOptionGroup {
  groupName: string;
  standardOptionAttributes: StandardOptionAttribute[];
}

interface StandardOptionAttribute {
  attributeId: number;
  attributeValueId: number;
  attributeValueName: string;
  imageUrls: string[];
}

interface OptionStandard {
  id: number;
  optionName1: string;
  optionName2: string;
  stockQuantity: number;
  sellerManagerCode: string;
  usable: boolean;
}

interface SupplementProductInfo {
  sortType: string;
  supplementProducts: SupplementProduct[];
}

interface SupplementProduct {
  id: number;
  groupName: string;
  name: string;
  price: number;
  stockQuantity: number;
  sellerManagementCode: string;
  usable: boolean;
}

interface PurchaseReviewInfo {
  purchaseReviewExposure: boolean;
  reviewUnExposeReason: string;
}

interface IsbnInfo {
  isbn13: string;
  issn: string;
  independentPublicationYn: boolean;
}

interface BookInfo {
  publishDay: string;
  publisher: CodeTextPair;
  authors: CodeTextPair[];
  illustrators: CodeTextPair[];
  translators: CodeTextPair[];
}

interface CodeTextPair {
  code: string;
  text: string;
}

interface ProductCertificationInfo {
  certificationInfoId: number;
  certificationKindType: string;
  name: string;
  certificationNumber: string;
  certificationMark: boolean;
  companyName: string;
  certificationDate: string;
}

interface CertificationTargetExcludeContent {
  childCertifiedProductExclusionYn: boolean;
  kcExemptionType: string;
  kcCertifiedProductExclusionYn: string;
  greenCertifiedProductExclusionYn: boolean;
}

interface Ecoupon {
  periodType: string;
  validStartDate: string;
  validEndDate: string;
  periodDays: number;
  publicInformationContents: string;
  contactInformationContents: string;
  usePlaceType: string;
  usePlaceContents: string;
  restrictCart: boolean;
  siteName: string;
}

interface ProductInfoProvidedNotice {
  productInfoProvidedNoticeType: string;
  wear?: WearInfo;
  shoes?: ShoesInfo;
  bag?: BagInfo;
  fashionItems?: FashionItemInfo;
  sleepingGear?: SleepingGearInfo;
  furniture?: FurnitureInfo;
  imageAppliances?: ImageApplianceInfo;
  homeAppliances?: HomeApplianceInfo;
  seasonAppliances?: SeasonApplianceInfo;
  officeAppliances?: OfficeApplianceInfo;
  opticsAppliances?: OpticsApplianceInfo;
  microElectronics?: MicroElectronicInfo;
  navigation?: NavigationInfo;
  carArticles?: CarArticleInfo;
  medicalAppliances?: MedicalApplianceInfo;
  kitchenUtensils?: KitchenUtensilInfo;
  cosmetic?: CosmeticInfo;
  jewellery?: JewelleryInfo;
  food?: FoodInfo;
  generalFood?: GeneralFoodInfo;
  dietFood?: DietFoodInfo;
  kids?: KidsInfo;
  musicalInstrument?: MusicalInstrumentInfo;
  sportsEquipment?: SportsEquipmentInfo;
  books?: BookInfo;
  rentalEtc?: RentalEtcInfo;
  digitalContents?: DigitalContentInfo;
  giftCard?: GiftCardInfo;
  mobileCoupon?: MobileCouponInfo;
  movieShow?: MovieShowInfo;
  etcService?: EtcServiceInfo;
  biochemistry?: BiochemistryInfo;
  biocidal?: BiocidalInfo;
  cellPhone?: CellPhoneInfo;
  etc?: EtcInfo;
}

interface WearInfo {
  returnCostReason: string;
  noRefundReason: string;
  qualityAssuranceStandard: string;
  compensationProcedure: string;
  troubleShootingContents: string;
  material: string;
  color: string;
  size: string;
  manufacturer: string;
  caution: string;
  packDate: string;
  packDateText: string;
  warrantyPolicy: string;
  afterServiceDirector: string;
}

interface ShoesInfo extends WearInfo {}
interface BagInfo extends WearInfo {}
interface FashionItemInfo extends WearInfo {}
interface SleepingGearInfo extends WearInfo {}
interface FurnitureInfo extends WearInfo {}
interface ImageApplianceInfo extends WearInfo {}
interface HomeApplianceInfo extends WearInfo {}
interface SeasonApplianceInfo extends WearInfo {}
interface OfficeApplianceInfo extends WearInfo {}
interface OpticsApplianceInfo extends WearInfo {}
interface MicroElectronicInfo extends WearInfo {}
interface NavigationInfo extends WearInfo {}
interface CarArticleInfo extends WearInfo {}
interface MedicalApplianceInfo extends WearInfo {}
interface KitchenUtensilInfo extends WearInfo {}
interface CosmeticInfo extends WearInfo {}
interface JewelleryInfo extends WearInfo {}
interface FoodInfo extends WearInfo {}
interface GeneralFoodInfo extends WearInfo {}
interface DietFoodInfo extends WearInfo {}
interface KidsInfo extends WearInfo {}
interface MusicalInstrumentInfo extends WearInfo {}
interface SportsEquipmentInfo extends WearInfo {}
interface RentalEtcInfo extends WearInfo {}
interface DigitalContentInfo extends WearInfo {}
interface GiftCardInfo extends WearInfo {}
interface MobileCouponInfo extends WearInfo {}
interface MovieShowInfo extends WearInfo {}
interface EtcServiceInfo extends WearInfo {}
interface BiochemistryInfo extends WearInfo {}
interface BiocidalInfo extends WearInfo {}
interface CellPhoneInfo extends WearInfo {}
interface EtcInfo extends WearInfo {}

interface ProductAttribute {
  attributeSeq: number;
  attributeValueSeq: number;
  attributeRealValue: string;
  attributeRealValueUnitCode: string;
}

interface SeoInfo {
  pageTitle: string;
  metaDescription: string;
  sellerTags: SellerTag[];
}

interface SellerTag {
  code: number;
  text: string;
}

interface CustomerBenefit {
  immediateDiscountPolicy: DiscountPolicy;
  purchasePointPolicy: PointPolicy;
  reviewPointPolicy: ReviewPointPolicy;
  freeInterestPolicy: FreeInterestPolicy;
  giftPolicy: GiftPolicy;
  multiPurchaseDiscountPolicy: MultiPurchaseDiscountPolicy;
  reservedDiscountPolicy: DiscountPolicy;
}

interface DiscountPolicy {
  discountMethod: DiscountMethod;
}

interface DiscountMethod {
  value: number;
  unitType: string;
  startDate: string;
  endDate: string;
}

interface PointPolicy {
  value: number;
  unitType: string;
  startDate: string;
  endDate: string;
}

interface ReviewPointPolicy {
  textReviewPoint: number;
  photoVideoReviewPoint: number;
  afterUseTextReviewPoint: number;
  afterUsePhotoVideoReviewPoint: number;
  storeMemberReviewPoint: number;
  startDate: string;
  endDate: string;
}

interface FreeInterestPolicy {
  value: number;
  startDate: string;
  endDate: string;
}

interface GiftPolicy {
  presentContent: string;
}

interface MultiPurchaseDiscountPolicy {
  discountMethod: DiscountMethod;
  orderValue: number;
  orderValueUnitType: string;
}

interface ChannelProduct {
  channelProductName: string;
  bbsSeq: number;
  storeKeepExclusiveProduct: boolean;
  naverShoppingRegistration: boolean;
  channelNo?: number;
  best?: boolean;
  channelProductDisplayStatusType: string;
}

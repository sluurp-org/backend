-- CreateTable
CREATE TABLE `PhoneVerification` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `phone` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `type` ENUM('REGISTER', 'FIND_PASSWORD') NOT NULL,
    `expiredAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `PhoneVerification_phone_type_key`(`phone`, `type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NULL,
    `loginId` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `salt` VARCHAR(191) NOT NULL,
    `refreshToken` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `deletedAt` DATETIME(3) NULL,
    `provider` ENUM('LOCAL', 'NAVER') NOT NULL DEFAULT 'LOCAL',
    `providerId` VARCHAR(191) NULL,

    UNIQUE INDEX `User_loginId_key`(`loginId`),
    UNIQUE INDEX `User_phone_key`(`phone`),
    UNIQUE INDEX `User_provider_providerId_key`(`provider`, `providerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `WorkspaceUser` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `workspaceId` INTEGER NOT NULL,
    `role` ENUM('OWNER', 'MEMBER') NOT NULL DEFAULT 'MEMBER',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `WorkspaceUser_userId_workspaceId_key`(`userId`, `workspaceId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Workspace` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `deletedAt` DATETIME(3) NULL,
    `lastPurchaseAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `nextPurchaseAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Billing` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `workspaceId` INTEGER NOT NULL,
    `cardNumber` VARCHAR(191) NOT NULL,
    `billingKey` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Billing_billingKey_key`(`billingKey`),
    UNIQUE INDEX `Billing_workspaceId_key`(`workspaceId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `KakaoCredential` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `workspaceId` INTEGER NOT NULL,
    `channelId` VARCHAR(191) NOT NULL,
    `searchId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `KakaoCredential_workspaceId_key`(`workspaceId`),
    UNIQUE INDEX `KakaoCredential_channelId_key`(`channelId`),
    UNIQUE INDEX `KakaoCredential_searchId_key`(`searchId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Store` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `workspaceId` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `type` ENUM('SMARTSTORE') NOT NULL,
    `enabled` BOOLEAN NOT NULL DEFAULT true,
    `lastProductSyncAt` DATETIME(3) NULL,
    `lastOrderSyncAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `deletedAt` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SmartStoreCredentials` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `storeId` INTEGER NOT NULL,
    `channelId` INTEGER NOT NULL,
    `applicationId` VARCHAR(191) NOT NULL,
    `applicationSecret` VARCHAR(191) NOT NULL,
    `emailParseable` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `deletedAt` DATETIME(3) NULL,

    UNIQUE INDEX `SmartStoreCredentials_storeId_key`(`storeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SmartStoreToken` (
    `applicationId` VARCHAR(191) NOT NULL,
    `applicationSecret` VARCHAR(191) NOT NULL,
    `accessToken` VARCHAR(191) NULL,
    `expiresAt` DATETIME(3) NULL,

    PRIMARY KEY (`applicationId`, `applicationSecret`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Product` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `productImageUrl` VARCHAR(191) NULL,
    `productId` VARCHAR(191) NOT NULL,
    `storeId` INTEGER NOT NULL,
    `workspaceId` INTEGER NOT NULL,
    `disableGlobalEvent` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `deletedAt` DATETIME(3) NULL,

    UNIQUE INDEX `Product_productId_storeId_key`(`productId`, `storeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProductVariant` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `productId` INTEGER NOT NULL,
    `variantId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `deletedAt` DATETIME(3) NULL,

    UNIQUE INDEX `ProductVariant_variantId_productId_key`(`variantId`, `productId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Order` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `productOrderId` VARCHAR(191) NOT NULL,
    `orderId` VARCHAR(191) NOT NULL,
    `status` ENUM('PAY_WAITING', 'PAYED', 'PRODUCT_PREPARE', 'DELIVERING', 'DELIVERED', 'PURCHASE_CONFIRM', 'EXCHANGE', 'CANCEL', 'REFUND', 'CANCEL_NOPAY') NOT NULL DEFAULT 'PAY_WAITING',
    `storeId` INTEGER NOT NULL,
    `productId` INTEGER NOT NULL,
    `productVariantId` INTEGER NULL,
    `workspaceId` INTEGER NOT NULL,
    `ordererName` VARCHAR(191) NOT NULL,
    `ordererEmail` VARCHAR(191) NULL,
    `ordererPhone` VARCHAR(191) NULL,
    `receiverName` VARCHAR(191) NULL,
    `receiverEmail` VARCHAR(191) NULL,
    `receiverPhone` VARCHAR(191) NULL,
    `price` MEDIUMINT UNSIGNED NULL,
    `quantity` MEDIUMINT UNSIGNED NULL,
    `orderAt` DATETIME(3) NULL,
    `deliveryAddress` VARCHAR(191) NULL,
    `deliveryMessage` VARCHAR(191) NULL,
    `deliveryCompany` VARCHAR(191) NULL,
    `deliveryTrackingNumber` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `deletedAt` DATETIME(3) NULL,

    INDEX `Order_productOrderId_idx`(`productOrderId`),
    UNIQUE INDEX `Order_orderId_productId_productOrderId_storeId_key`(`orderId`, `productId`, `productOrderId`, `storeId`),
    UNIQUE INDEX `Order_orderId_productOrderId_storeId_key`(`orderId`, `productOrderId`, `storeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OrderHistory` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `type` ENUM('STATUS_CHANGE', 'EVENT', 'MESSAGE') NOT NULL,
    `changedStatus` ENUM('PAY_WAITING', 'PAYED', 'PRODUCT_PREPARE', 'DELIVERING', 'DELIVERED', 'PURCHASE_CONFIRM', 'EXCHANGE', 'CANCEL', 'REFUND', 'CANCEL_NOPAY') NULL,
    `message` VARCHAR(191) NULL,
    `orderId` INTEGER NOT NULL,
    `eventHistoryId` VARCHAR(191) NULL,
    `storeId` INTEGER NOT NULL,
    `workspaceId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `OrderHistory_orderId_workspaceId_idx`(`orderId`, `workspaceId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ContentGroup` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `workspaceId` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `type` ENUM('FILE', 'TEXT', 'URL', 'QRCODE', 'BARCODE') NOT NULL DEFAULT 'TEXT',
    `oneTime` BOOLEAN NOT NULL DEFAULT false,
    `expireMinute` INTEGER NULL,
    `downloadLimit` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `deletedAt` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Content` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `workspaceId` INTEGER NOT NULL,
    `contentGroupId` INTEGER NOT NULL,
    `used` BOOLEAN NOT NULL DEFAULT false,
    `text` VARCHAR(191) NULL,
    `type` ENUM('FILE', 'TEXT', 'URL', 'QRCODE', 'BARCODE') NOT NULL DEFAULT 'TEXT',
    `status` ENUM('PENDING', 'READY') NOT NULL DEFAULT 'PENDING',
    `name` VARCHAR(191) NULL,
    `key` VARCHAR(191) NULL,
    `size` INTEGER NULL,
    `mimeType` VARCHAR(191) NULL,
    `extension` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `deletedAt` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Event` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `workspaceId` INTEGER NOT NULL,
    `productId` INTEGER NULL,
    `productVariantId` INTEGER NULL,
    `messageId` INTEGER NOT NULL,
    `isGlobal` BOOLEAN NOT NULL DEFAULT false,
    `type` ENUM('PAY_WAITING', 'PAYED', 'PRODUCT_PREPARE', 'DELIVERING', 'DELIVERED', 'PURCHASE_CONFIRM', 'EXCHANGE', 'CANCEL', 'REFUND', 'CANCEL_NOPAY') NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Event_productId_productVariantId_messageId_type_key`(`productId`, `productVariantId`, `messageId`, `type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EventHistoryContentConnection` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `eventHistoryId` VARCHAR(191) NOT NULL,
    `contentId` INTEGER NOT NULL,
    `downloadCount` INTEGER NOT NULL DEFAULT 0,
    `downloadLimit` INTEGER NULL,
    `disableDownload` BOOLEAN NOT NULL DEFAULT false,
    `lastDownloadAt` DATETIME(3) NULL,
    `firstDownloadAt` DATETIME(3) NULL,
    `expiredAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EventHistory` (
    `id` VARCHAR(191) NOT NULL,
    `workspaceId` INTEGER NOT NULL,
    `eventId` INTEGER NULL,
    `orderId` INTEGER NULL,
    `messageId` INTEGER NULL,
    `receiverPhone` VARCHAR(191) NULL,
    `receiverEmail` VARCHAR(191) NULL,
    `messageContent` LONGTEXT NULL,
    `messageVariables` JSON NULL,
    `status` ENUM('PENDING', 'CONTENT_READY', 'READY', 'PROCESSING', 'SUCCESS', 'FAILED') NOT NULL,
    `message` VARCHAR(191) NULL,
    `processedAt` DATETIME(3) NULL,
    `externalMessageId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MessageTemplate` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `completeDelivery` BOOLEAN NOT NULL DEFAULT false,
    `sendType` ENUM('KAKAO') NOT NULL,
    `type` ENUM('GLOBAL', 'CUSTOM', 'FULLY_CUSTOM') NOT NULL DEFAULT 'FULLY_CUSTOM',
    `workspaceId` INTEGER NULL,
    `kakaoTemplateId` INTEGER NULL,
    `contentGroupId` INTEGER NULL,
    `target` ENUM('BUYER', 'RECEIVER', 'CUSTOM') NULL,
    `customPhone` VARCHAR(191) NULL,
    `customEmail` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `KakaoTemplate` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `templateId` VARCHAR(191) NOT NULL,
    `status` ENUM('UPLOADED', 'PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `isSimpleCustom` BOOLEAN NOT NULL DEFAULT false,
    `categoryCode` VARCHAR(191) NOT NULL,
    `content` LONGTEXT NOT NULL,
    `isGlobal` BOOLEAN NOT NULL DEFAULT false,
    `buttons` JSON NULL,
    `imageId` VARCHAR(191) NULL,
    `imageUrl` VARCHAR(191) NULL,
    `extra` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `KakaoTemplate_templateId_key`(`templateId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Variables` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `key` VARCHAR(191) NOT NULL,
    `value` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `example` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Variables_key_key`(`key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PurchaseHistory` (
    `id` VARCHAR(191) NOT NULL,
    `workspaceId` INTEGER NOT NULL,
    `amount` INTEGER NULL,
    `discountAmount` INTEGER NULL DEFAULT 0,
    `totalAmount` INTEGER NULL,
    `reason` VARCHAR(191) NULL,
    `status` ENUM('CANCELLED', 'FAILED', 'PAID', 'PARTIAL_CANCELLED', 'PAY_PENDING', 'READY', 'VIRTUAL_ACCOUNT_ISSUED') NOT NULL,
    `purchasedAt` DATETIME(3) NULL,
    `retry` INTEGER NOT NULL DEFAULT 0,
    `scheduledId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `billingId` INTEGER NULL,

    INDEX `PurchaseHistory_workspaceId_idx`(`workspaceId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Config` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `defaultPrice` INTEGER NOT NULL DEFAULT 5000,
    `alimtalkSendPrice` INTEGER NOT NULL DEFAULT 100,
    `emailSendPrice` INTEGER NOT NULL DEFAULT 150,
    `contentSendPrice` INTEGER NOT NULL DEFAULT 100,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DailyStoreStatistics` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `storeId` INTEGER NOT NULL,
    `orderDate` DATE NOT NULL,
    `totalOrders` INTEGER NOT NULL,
    `totalQuantity` INTEGER NOT NULL,
    `totalSales` INTEGER NOT NULL,
    `totalRefund` INTEGER NOT NULL,
    `totalCancelled` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `DailyStoreStatistics_storeId_orderDate_key`(`storeId`, `orderDate`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MonthlyStoreStatistics` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `storeId` INTEGER NOT NULL,
    `orderMonth` DATE NOT NULL,
    `totalOrders` INTEGER NOT NULL,
    `totalQuantity` INTEGER NOT NULL,
    `totalSales` INTEGER NOT NULL,
    `totalRefund` INTEGER NOT NULL,
    `totalCancelled` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `MonthlyStoreStatistics_storeId_orderMonth_key`(`storeId`, `orderMonth`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DailyWorkspaceStatistics` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `workspaceId` INTEGER NOT NULL,
    `orderDate` DATE NOT NULL,
    `totalOrders` INTEGER NOT NULL,
    `totalQuantity` INTEGER NOT NULL,
    `totalSales` INTEGER NOT NULL,
    `totalRefund` INTEGER NOT NULL,
    `totalCancelled` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `DailyWorkspaceStatistics_workspaceId_orderDate_key`(`workspaceId`, `orderDate`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MonthlyWorkspaceStatistics` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `workspaceId` INTEGER NOT NULL,
    `orderMonth` DATE NOT NULL,
    `totalOrders` INTEGER NOT NULL,
    `totalQuantity` INTEGER NOT NULL,
    `totalSales` INTEGER NOT NULL,
    `totalRefund` INTEGER NOT NULL,
    `totalCancelled` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `MonthlyWorkspaceStatistics_workspaceId_orderMonth_key`(`workspaceId`, `orderMonth`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `WorkspaceUser` ADD CONSTRAINT `WorkspaceUser_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WorkspaceUser` ADD CONSTRAINT `WorkspaceUser_workspaceId_fkey` FOREIGN KEY (`workspaceId`) REFERENCES `Workspace`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Billing` ADD CONSTRAINT `Billing_workspaceId_fkey` FOREIGN KEY (`workspaceId`) REFERENCES `Workspace`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `KakaoCredential` ADD CONSTRAINT `KakaoCredential_workspaceId_fkey` FOREIGN KEY (`workspaceId`) REFERENCES `Workspace`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Store` ADD CONSTRAINT `Store_workspaceId_fkey` FOREIGN KEY (`workspaceId`) REFERENCES `Workspace`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SmartStoreCredentials` ADD CONSTRAINT `SmartStoreCredentials_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `Store`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `Store`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_workspaceId_fkey` FOREIGN KEY (`workspaceId`) REFERENCES `Workspace`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductVariant` ADD CONSTRAINT `ProductVariant_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_productVariantId_fkey` FOREIGN KEY (`productVariantId`) REFERENCES `ProductVariant`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `Store`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_workspaceId_fkey` FOREIGN KEY (`workspaceId`) REFERENCES `Workspace`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderHistory` ADD CONSTRAINT `OrderHistory_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderHistory` ADD CONSTRAINT `OrderHistory_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `Store`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderHistory` ADD CONSTRAINT `OrderHistory_workspaceId_fkey` FOREIGN KEY (`workspaceId`) REFERENCES `Workspace`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderHistory` ADD CONSTRAINT `OrderHistory_eventHistoryId_fkey` FOREIGN KEY (`eventHistoryId`) REFERENCES `EventHistory`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ContentGroup` ADD CONSTRAINT `ContentGroup_workspaceId_fkey` FOREIGN KEY (`workspaceId`) REFERENCES `Workspace`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Content` ADD CONSTRAINT `Content_contentGroupId_fkey` FOREIGN KEY (`contentGroupId`) REFERENCES `ContentGroup`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Content` ADD CONSTRAINT `Content_workspaceId_fkey` FOREIGN KEY (`workspaceId`) REFERENCES `Workspace`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Event` ADD CONSTRAINT `Event_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Event` ADD CONSTRAINT `Event_productVariantId_fkey` FOREIGN KEY (`productVariantId`) REFERENCES `ProductVariant`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Event` ADD CONSTRAINT `Event_workspaceId_fkey` FOREIGN KEY (`workspaceId`) REFERENCES `Workspace`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Event` ADD CONSTRAINT `Event_messageId_fkey` FOREIGN KEY (`messageId`) REFERENCES `MessageTemplate`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EventHistoryContentConnection` ADD CONSTRAINT `EventHistoryContentConnection_eventHistoryId_fkey` FOREIGN KEY (`eventHistoryId`) REFERENCES `EventHistory`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EventHistoryContentConnection` ADD CONSTRAINT `EventHistoryContentConnection_contentId_fkey` FOREIGN KEY (`contentId`) REFERENCES `Content`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EventHistory` ADD CONSTRAINT `EventHistory_workspaceId_fkey` FOREIGN KEY (`workspaceId`) REFERENCES `Workspace`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EventHistory` ADD CONSTRAINT `EventHistory_eventId_fkey` FOREIGN KEY (`eventId`) REFERENCES `Event`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EventHistory` ADD CONSTRAINT `EventHistory_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EventHistory` ADD CONSTRAINT `EventHistory_messageId_fkey` FOREIGN KEY (`messageId`) REFERENCES `MessageTemplate`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MessageTemplate` ADD CONSTRAINT `MessageTemplate_kakaoTemplateId_fkey` FOREIGN KEY (`kakaoTemplateId`) REFERENCES `KakaoTemplate`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MessageTemplate` ADD CONSTRAINT `MessageTemplate_workspaceId_fkey` FOREIGN KEY (`workspaceId`) REFERENCES `Workspace`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MessageTemplate` ADD CONSTRAINT `MessageTemplate_contentGroupId_fkey` FOREIGN KEY (`contentGroupId`) REFERENCES `ContentGroup`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseHistory` ADD CONSTRAINT `PurchaseHistory_workspaceId_fkey` FOREIGN KEY (`workspaceId`) REFERENCES `Workspace`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseHistory` ADD CONSTRAINT `PurchaseHistory_billingId_fkey` FOREIGN KEY (`billingId`) REFERENCES `Billing`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DailyStoreStatistics` ADD CONSTRAINT `DailyStoreStatistics_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `Store`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MonthlyStoreStatistics` ADD CONSTRAINT `MonthlyStoreStatistics_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `Store`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DailyWorkspaceStatistics` ADD CONSTRAINT `DailyWorkspaceStatistics_workspaceId_fkey` FOREIGN KEY (`workspaceId`) REFERENCES `Workspace`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MonthlyWorkspaceStatistics` ADD CONSTRAINT `MonthlyWorkspaceStatistics_workspaceId_fkey` FOREIGN KEY (`workspaceId`) REFERENCES `Workspace`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

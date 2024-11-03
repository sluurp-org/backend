/*
  Warnings:

  - Made the column `nextPurchaseAt` on table `Workspace` required. This step will fail if there are existing NULL values in that column.
  - Made the column `lastPurchaseAt` on table `Workspace` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `Workspace` MODIFY `nextPurchaseAt` DATETIME(3) NOT NULL,
    MODIFY `lastPurchaseAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- CreateTable
CREATE TABLE `DailyStoreStatistics` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `storeId` INTEGER NOT NULL,
    `orderDate` DATETIME(3) NOT NULL,
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
    `orderMonth` DATETIME(3) NOT NULL,
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
    `orderDate` DATETIME(3) NOT NULL,
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
    `orderMonth` DATETIME(3) NOT NULL,
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
ALTER TABLE `DailyStoreStatistics` ADD CONSTRAINT `DailyStoreStatistics_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `Store`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MonthlyStoreStatistics` ADD CONSTRAINT `MonthlyStoreStatistics_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `Store`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DailyWorkspaceStatistics` ADD CONSTRAINT `DailyWorkspaceStatistics_workspaceId_fkey` FOREIGN KEY (`workspaceId`) REFERENCES `Workspace`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MonthlyWorkspaceStatistics` ADD CONSTRAINT `MonthlyWorkspaceStatistics_workspaceId_fkey` FOREIGN KEY (`workspaceId`) REFERENCES `Workspace`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

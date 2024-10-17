/*
  Warnings:

  - You are about to drop the column `type` on the `SubscriptionModel` table. All the data in the column will be lost.
  - You are about to drop the `Subscription` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `PurchaseHistory` DROP FOREIGN KEY `PurchaseHistory_subscriptionId_fkey`;

-- DropForeignKey
ALTER TABLE `Subscription` DROP FOREIGN KEY `Subscription_subscriptionModelId_fkey`;

-- DropForeignKey
ALTER TABLE `Subscription` DROP FOREIGN KEY `Subscription_workspaceId_fkey`;

-- AlterTable
ALTER TABLE `PurchaseHistory` ADD COLUMN `endedAt` DATETIME(3) NULL,
    ADD COLUMN `startedAt` DATETIME(3) NULL,
    MODIFY `type` ENUM('CREDIT', 'SUBSCRIPTION', 'SUBSCRIPTION_FREE') NOT NULL;

-- AlterTable
ALTER TABLE `SubscriptionModel` DROP COLUMN `type`;

-- DropTable
DROP TABLE `Subscription`;

-- AddForeignKey
ALTER TABLE `PurchaseHistory` ADD CONSTRAINT `PurchaseHistory_subscriptionId_fkey` FOREIGN KEY (`subscriptionId`) REFERENCES `SubscriptionModel`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

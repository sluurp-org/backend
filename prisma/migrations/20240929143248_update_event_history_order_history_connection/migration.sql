/*
  Warnings:

  - You are about to drop the column `completeDelivery` on the `Event` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `EventHistory` DROP FOREIGN KEY `EventHistory_orderHistoryId_fkey`;

-- AlterTable
ALTER TABLE `Event` DROP COLUMN `completeDelivery`;

-- AlterTable
ALTER TABLE `MessageTemplate` ADD COLUMN `completeDelivery` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `OrderHistory` ADD COLUMN `eventHistoryId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `OrderHistory` ADD CONSTRAINT `OrderHistory_eventHistoryId_fkey` FOREIGN KEY (`eventHistoryId`) REFERENCES `EventHistory`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

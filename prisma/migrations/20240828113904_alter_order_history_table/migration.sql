/*
  Warnings:

  - You are about to alter the column `orderId` on the `OrderHistory` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - Added the required column `changedStatus` to the `OrderHistory` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `OrderHistory_orderId_storeId_key` ON `OrderHistory`;

-- AlterTable
ALTER TABLE `OrderHistory` ADD COLUMN `changedStatus` ENUM('PAY_WAITING', 'PAYED', 'PRODUCT_PREPARE', 'DELIVERING', 'DELIVERED', 'PURCHASE_CONFIRM', 'EXCHANGE', 'CANCEL', 'REFUND', 'CANCEL_NOPAY') NOT NULL,
    ADD COLUMN `eventId` INTEGER NULL,
    MODIFY `orderId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `SmartStoreCredentials` ADD COLUMN `emailParseable` BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX `OrderHistory_orderId_workspaceId_idx` ON `OrderHistory`(`orderId`, `workspaceId`);

-- AddForeignKey
ALTER TABLE `OrderHistory` ADD CONSTRAINT `OrderHistory_eventId_fkey` FOREIGN KEY (`eventId`) REFERENCES `Event`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderHistory` ADD CONSTRAINT `OrderHistory_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

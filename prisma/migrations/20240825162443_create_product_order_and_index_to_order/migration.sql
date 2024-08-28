/*
  Warnings:

  - A unique constraint covering the columns `[orderId,productId,storeId]` on the table `Order` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `productOrderId` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `Order_orderId_storeId_key` ON `Order`;

-- AlterTable
ALTER TABLE `Order` ADD COLUMN `productOrderId` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE INDEX `Order_productOrderId_storeId_idx` ON `Order`(`productOrderId`, `storeId`);

-- CreateIndex
CREATE UNIQUE INDEX `Order_orderId_productId_storeId_key` ON `Order`(`orderId`, `productId`, `storeId`);

/*
  Warnings:

  - The values [SHIPPING,SHIPPED,CONFIRMED,CANCELED,REFUNDED,EXCHANGED] on the enum `Event_type` will be removed. If these variants are still used in the database, this will fail.
  - You are about to alter the column `status` on the `Order` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(2))` to `Enum(EnumId(7))`.
  - A unique constraint covering the columns `[orderId,productId,productOrderId,storeId]` on the table `Order` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `Order_orderId_productId_storeId_key` ON `Order`;

-- AlterTable
ALTER TABLE `Event` MODIFY `type` ENUM('PAY_WAITING', 'PAYED', 'PRODUCT_PREPARE', 'DELIVERING', 'DELIVERED', 'PURCHASE_CONFIRM', 'EXCHANGE', 'CANCLE', 'REFUND', 'CANCEL_NOPAY') NOT NULL;

-- AlterTable
ALTER TABLE `Order` MODIFY `status` ENUM('PAY_WAITING', 'PAYED', 'PRODUCT_PREPARE', 'DELIVERING', 'DELIVERED', 'PURCHASE_CONFIRM', 'EXCHANGE', 'CANCLE', 'REFUND', 'CANCEL_NOPAY') NOT NULL DEFAULT 'PAY_WAITING';

-- CreateIndex
CREATE UNIQUE INDEX `Order_orderId_productId_productOrderId_storeId_key` ON `Order`(`orderId`, `productId`, `productOrderId`, `storeId`);

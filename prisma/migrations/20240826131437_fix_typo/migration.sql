/*
  Warnings:

  - The values [CANCLE] on the enum `Event_type` will be removed. If these variants are still used in the database, this will fail.
  - The values [CANCLE] on the enum `Event_type` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `Event` MODIFY `type` ENUM('PAY_WAITING', 'PAYED', 'PRODUCT_PREPARE', 'DELIVERING', 'DELIVERED', 'PURCHASE_CONFIRM', 'EXCHANGE', 'CANCEL', 'REFUND', 'CANCEL_NOPAY') NOT NULL;

-- AlterTable
ALTER TABLE `Order` MODIFY `status` ENUM('PAY_WAITING', 'PAYED', 'PRODUCT_PREPARE', 'DELIVERING', 'DELIVERED', 'PURCHASE_CONFIRM', 'EXCHANGE', 'CANCEL', 'REFUND', 'CANCEL_NOPAY') NOT NULL DEFAULT 'PAY_WAITING';

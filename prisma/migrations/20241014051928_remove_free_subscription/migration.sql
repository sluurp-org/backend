/*
  Warnings:

  - The values [SUBSCRIPTION_FREE] on the enum `PurchaseHistory_type` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `PurchaseHistory` MODIFY `type` ENUM('CREDIT', 'SUBSCRIPTION') NOT NULL;

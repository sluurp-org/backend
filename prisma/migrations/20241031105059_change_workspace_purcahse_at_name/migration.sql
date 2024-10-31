/*
  Warnings:

  - You are about to drop the column `purchaseAt` on the `Workspace` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Workspace` DROP COLUMN `purchaseAt`,
    ADD COLUMN `nextPurchaseAt` DATETIME(3) NULL;

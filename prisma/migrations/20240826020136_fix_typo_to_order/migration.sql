/*
  Warnings:

  - You are about to drop the column `reciverName` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `reciverPhone` on the `Order` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Order` DROP COLUMN `reciverName`,
    DROP COLUMN `reciverPhone`,
    ADD COLUMN `receiverName` VARCHAR(191) NULL,
    ADD COLUMN `receiverPhone` VARCHAR(191) NULL;

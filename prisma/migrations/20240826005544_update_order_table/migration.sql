/*
  Warnings:

  - You are about to drop the column `email` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `memo` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `Order` table. All the data in the column will be lost.
  - Added the required column `orderAt` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ordererName` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `price` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quantity` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Order` DROP COLUMN `email`,
    DROP COLUMN `memo`,
    DROP COLUMN `name`,
    DROP COLUMN `phone`,
    ADD COLUMN `deliveryAddress` VARCHAR(191) NULL,
    ADD COLUMN `deliveryCompany` VARCHAR(191) NULL,
    ADD COLUMN `deliveryMessage` VARCHAR(191) NULL,
    ADD COLUMN `deliveryTrackingNumber` VARCHAR(191) NULL,
    ADD COLUMN `orderAt` DATETIME(3) NOT NULL,
    ADD COLUMN `ordererEmail` VARCHAR(191) NULL,
    ADD COLUMN `ordererName` VARCHAR(191) NOT NULL,
    ADD COLUMN `ordererPhone` VARCHAR(191) NULL,
    ADD COLUMN `price` INTEGER NOT NULL,
    ADD COLUMN `quantity` INTEGER NOT NULL,
    ADD COLUMN `reciverName` VARCHAR(191) NULL,
    ADD COLUMN `reciverPhone` VARCHAR(191) NULL;

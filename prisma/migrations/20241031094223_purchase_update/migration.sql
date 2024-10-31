/*
  Warnings:

  - You are about to drop the column `creditId` on the `EventHistory` table. All the data in the column will be lost.
  - You are about to drop the column `credit` on the `Workspace` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `EventHistory` DROP COLUMN `creditId`;

-- AlterTable
ALTER TABLE `PurchaseHistory` ADD COLUMN `discountAmount` INTEGER NULL DEFAULT 0,
    ADD COLUMN `totalAmount` INTEGER NULL;

-- AlterTable
ALTER TABLE `Workspace` DROP COLUMN `credit`;

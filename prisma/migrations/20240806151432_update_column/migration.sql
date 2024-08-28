/*
  Warnings:

  - You are about to drop the column `emailId` on the `EmailCredential` table. All the data in the column will be lost.
  - Added the required column `userId` to the `EmailCredential` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Event` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Content` ADD COLUMN `downloadLimit` INTEGER NULL,
    ADD COLUMN `expireMinute` INTEGER NULL,
    ADD COLUMN `oneTime` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `EmailCredential` DROP COLUMN `emailId`,
    ADD COLUMN `userId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `Event` ADD COLUMN `type` ENUM('PAYED', 'SHIPPING', 'SHIPPED', 'CONFIRMED', 'CANCELED', 'REFUNDED', 'EXCHANGED') NOT NULL;

-- AlterTable
ALTER TABLE `Order` MODIFY `status` ENUM('PAYED', 'SHIPPING', 'SHIPPED', 'CONFIRMED', 'CANCELED', 'REFUNDED', 'EXCHANGED') NOT NULL DEFAULT 'PAYED';

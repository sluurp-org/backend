/*
  Warnings:

  - You are about to drop the column `type` on the `Subscription` table. All the data in the column will be lost.
  - Added the required column `subscriptionModelId` to the `Subscription` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Subscription` DROP COLUMN `type`,
    ADD COLUMN `subscriptionModelId` INTEGER NOT NULL;

-- CreateTable
CREATE TABLE `SubscriptionModel` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `price` INTEGER NOT NULL,
    `type` ENUM('FREE', 'PAID') NOT NULL,
    `availableFeatures` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Subscription` ADD CONSTRAINT `Subscription_subscriptionModelId_fkey` FOREIGN KEY (`subscriptionModelId`) REFERENCES `SubscriptionModel`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

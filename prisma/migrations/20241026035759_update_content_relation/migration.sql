/*
  Warnings:

  - You are about to drop the column `contentId` on the `EventHistory` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `EventHistory` DROP FOREIGN KEY `EventHistory_contentId_fkey`;

-- AlterTable
ALTER TABLE `EventHistory` DROP COLUMN `contentId`;

-- CreateTable
CREATE TABLE `EventHistoryContentConnection` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `eventHistoryId` VARCHAR(191) NOT NULL,
    `contentId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `EventHistoryContentConnection` ADD CONSTRAINT `EventHistoryContentConnection_eventHistoryId_fkey` FOREIGN KEY (`eventHistoryId`) REFERENCES `EventHistory`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EventHistoryContentConnection` ADD CONSTRAINT `EventHistoryContentConnection_contentId_fkey` FOREIGN KEY (`contentId`) REFERENCES `Content`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

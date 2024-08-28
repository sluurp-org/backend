/*
  Warnings:

  - Added the required column `provider` to the `Content` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Content` ADD COLUMN `provider` ENUM('LOCAL', 'EXTERNAL') NOT NULL;

-- CreateTable
CREATE TABLE `ContentExternal` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `contentId` INTEGER NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `headers` JSON NULL,
    `type` ENUM('TEXT', 'FILE') NOT NULL,

    UNIQUE INDEX `ContentExternal_contentId_key`(`contentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ContentExternal` ADD CONSTRAINT `ContentExternal_contentId_fkey` FOREIGN KEY (`contentId`) REFERENCES `Content`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

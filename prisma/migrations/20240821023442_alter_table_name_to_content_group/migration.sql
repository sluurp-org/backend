/*
  Warnings:

  - You are about to drop the column `downloadLimit` on the `Content` table. All the data in the column will be lost.
  - You are about to drop the column `expireMinute` on the `Content` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Content` table. All the data in the column will be lost.
  - You are about to drop the column `oneTime` on the `Content` table. All the data in the column will be lost.
  - You are about to drop the column `provider` on the `Content` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Content` table. All the data in the column will be lost.
  - You are about to drop the `ContentData` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `contentId` to the `Content` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Content` DROP FOREIGN KEY `Content_workspaceId_fkey`;

-- DropForeignKey
ALTER TABLE `ContentData` DROP FOREIGN KEY `ContentData_contentId_fkey`;

-- DropForeignKey
ALTER TABLE `ContentExternal` DROP FOREIGN KEY `ContentExternal_contentId_fkey`;

-- DropForeignKey
ALTER TABLE `MessageTemplate` DROP FOREIGN KEY `MessageTemplate_contentId_fkey`;

-- AlterTable
ALTER TABLE `Content` DROP COLUMN `downloadLimit`,
    DROP COLUMN `expireMinute`,
    DROP COLUMN `name`,
    DROP COLUMN `oneTime`,
    DROP COLUMN `provider`,
    DROP COLUMN `type`,
    ADD COLUMN `contentId` INTEGER NOT NULL,
    ADD COLUMN `data` VARCHAR(191) NULL,
    ADD COLUMN `file` VARCHAR(191) NULL,
    MODIFY `workspaceId` INTEGER NULL;

-- DropTable
DROP TABLE `ContentData`;

-- CreateTable
CREATE TABLE `ContentGroup` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `workspaceId` INTEGER NOT NULL,
    `type` ENUM('LINK', 'CODE', 'FILE', 'TEXT') NOT NULL,
    `provider` ENUM('LOCAL', 'EXTERNAL') NOT NULL,
    `oneTime` BOOLEAN NOT NULL DEFAULT false,
    `expireMinute` INTEGER NULL,
    `downloadLimit` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `deletedAt` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ContentGroup` ADD CONSTRAINT `ContentGroup_workspaceId_fkey` FOREIGN KEY (`workspaceId`) REFERENCES `Workspace`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ContentExternal` ADD CONSTRAINT `ContentExternal_contentId_fkey` FOREIGN KEY (`contentId`) REFERENCES `ContentGroup`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Content` ADD CONSTRAINT `Content_contentId_fkey` FOREIGN KEY (`contentId`) REFERENCES `ContentGroup`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Content` ADD CONSTRAINT `Content_workspaceId_fkey` FOREIGN KEY (`workspaceId`) REFERENCES `Workspace`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MessageTemplate` ADD CONSTRAINT `MessageTemplate_contentId_fkey` FOREIGN KEY (`contentId`) REFERENCES `ContentGroup`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

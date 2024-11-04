/*
  Warnings:

  - You are about to drop the column `message` on the `EventHistory` table. All the data in the column will be lost.
  - You are about to drop the column `isSimpleCustom` on the `KakaoTemplate` table. All the data in the column will be lost.
  - You are about to drop the `MessageTemplate` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `Event` DROP FOREIGN KEY `Event_messageId_fkey`;

-- DropForeignKey
ALTER TABLE `EventHistory` DROP FOREIGN KEY `EventHistory_messageId_fkey`;

-- DropForeignKey
ALTER TABLE `MessageTemplate` DROP FOREIGN KEY `MessageTemplate_contentGroupId_fkey`;

-- DropForeignKey
ALTER TABLE `MessageTemplate` DROP FOREIGN KEY `MessageTemplate_kakaoTemplateId_fkey`;

-- DropForeignKey
ALTER TABLE `MessageTemplate` DROP FOREIGN KEY `MessageTemplate_workspaceId_fkey`;

-- AlterTable
ALTER TABLE `EventHistory` DROP COLUMN `message`,
    ADD COLUMN `rawMessage` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `KakaoTemplate` DROP COLUMN `isSimpleCustom`,
    ADD COLUMN `isCustomAvailable` BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE `MessageTemplate`;

-- CreateTable
CREATE TABLE `Message` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `completeDelivery` BOOLEAN NOT NULL DEFAULT false,
    `sendType` ENUM('KAKAO') NOT NULL,
    `type` ENUM('GLOBAL', 'CUSTOM', 'FULLY_CUSTOM') NOT NULL DEFAULT 'FULLY_CUSTOM',
    `content` VARCHAR(191) NULL,
    `workspaceId` INTEGER NULL,
    `kakaoTemplateId` INTEGER NULL,
    `contentGroupId` INTEGER NULL,
    `target` ENUM('BUYER', 'RECEIVER', 'CUSTOM') NULL,
    `customPhone` VARCHAR(191) NULL,
    `customEmail` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Event` ADD CONSTRAINT `Event_messageId_fkey` FOREIGN KEY (`messageId`) REFERENCES `Message`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EventHistory` ADD CONSTRAINT `EventHistory_messageId_fkey` FOREIGN KEY (`messageId`) REFERENCES `Message`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Message` ADD CONSTRAINT `Message_kakaoTemplateId_fkey` FOREIGN KEY (`kakaoTemplateId`) REFERENCES `KakaoTemplate`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Message` ADD CONSTRAINT `Message_workspaceId_fkey` FOREIGN KEY (`workspaceId`) REFERENCES `Workspace`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Message` ADD CONSTRAINT `Message_contentGroupId_fkey` FOREIGN KEY (`contentGroupId`) REFERENCES `ContentGroup`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

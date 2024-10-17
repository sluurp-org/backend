-- AlterTable
ALTER TABLE `KakaoTemplate` ADD COLUMN `imageId` VARCHAR(191) NULL,
    MODIFY `content` LONGTEXT NOT NULL;

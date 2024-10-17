-- AlterTable
ALTER TABLE `EventHistory` ADD COLUMN `processedAt` DATETIME(3) NULL,
    ADD COLUMN `solapiMessageId` VARCHAR(191) NULL,
    ADD COLUMN `solapiStatusCode` VARCHAR(191) NULL;

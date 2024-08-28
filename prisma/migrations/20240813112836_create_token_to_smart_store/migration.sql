-- AlterTable
ALTER TABLE `SmartStoreCredentials` ADD COLUMN `accessToken` VARCHAR(191) NULL,
    ADD COLUMN `expiresAt` DATETIME(3) NULL;

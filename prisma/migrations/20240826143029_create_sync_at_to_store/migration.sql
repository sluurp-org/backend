-- AlterTable
ALTER TABLE `Store` ADD COLUMN `lastOrderSyncAt` DATETIME(3) NULL,
    ADD COLUMN `lastProductSyncAt` DATETIME(3) NULL;

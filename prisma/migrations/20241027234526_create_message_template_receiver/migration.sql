-- AlterTable
ALTER TABLE `MessageTemplate` ADD COLUMN `customEmail` VARCHAR(191) NULL,
    ADD COLUMN `customPhone` VARCHAR(191) NULL,
    ADD COLUMN `target` ENUM('BUYER', 'RECEIVER', 'CUSTOM') NULL;

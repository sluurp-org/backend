-- AlterTable
ALTER TABLE `Event` ADD COLUMN `isGlobal` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `Product` ADD COLUMN `disableGlobalEvent` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `ContentGroup` ADD COLUMN `readonly` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `MessageTemplate` ADD COLUMN `readonly` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `Store` ADD COLUMN `readonly` BOOLEAN NOT NULL DEFAULT false;

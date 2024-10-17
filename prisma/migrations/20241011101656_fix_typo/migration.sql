/*
  Warnings:

  - You are about to drop the column `extention` on the `Content` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Content` DROP COLUMN `extention`,
    ADD COLUMN `extension` VARCHAR(191) NULL;

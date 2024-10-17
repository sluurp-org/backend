/*
  Warnings:

  - You are about to drop the column `imageId` on the `KakaoTemplate` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `KakaoTemplate` DROP COLUMN `imageId`,
    ADD COLUMN `imageUrl` VARCHAR(191) NULL;

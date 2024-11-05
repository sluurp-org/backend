/*
  Warnings:

  - You are about to drop the column `isGlobal` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `isGlobal` on the `KakaoTemplate` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Event` DROP COLUMN `isGlobal`;

-- AlterTable
ALTER TABLE `KakaoTemplate` DROP COLUMN `isGlobal`;

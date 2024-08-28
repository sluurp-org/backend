/*
  Warnings:

  - You are about to drop the column `accessToken` on the `SmartStoreCredentials` table. All the data in the column will be lost.
  - You are about to drop the column `expiresAt` on the `SmartStoreCredentials` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `SmartStoreCredentials` DROP COLUMN `accessToken`,
    DROP COLUMN `expiresAt`;

-- CreateTable
CREATE TABLE `SmartStoreToken` (
    `applicationId` VARCHAR(191) NOT NULL,
    `applicationSecret` VARCHAR(191) NOT NULL,
    `accessToken` VARCHAR(191) NULL,
    `expiresAt` DATETIME(3) NULL,

    UNIQUE INDEX `SmartStoreToken_applicationId_applicationSecret_key`(`applicationId`, `applicationSecret`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

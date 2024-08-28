/*
  Warnings:

  - A unique constraint covering the columns `[channelId]` on the table `SmartStoreCredentials` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `channelId` to the `SmartStoreCredentials` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `SmartStoreCredentials` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `SmartStoreCredentials` ADD COLUMN `channelId` INTEGER NOT NULL,
    ADD COLUMN `name` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `SmartStoreCredentials_channelId_key` ON `SmartStoreCredentials`(`channelId`);

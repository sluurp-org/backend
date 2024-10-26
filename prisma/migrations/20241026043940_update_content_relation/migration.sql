/*
  Warnings:

  - You are about to drop the column `disableDownload` on the `EventHistory` table. All the data in the column will be lost.
  - You are about to drop the column `downloadCount` on the `EventHistory` table. All the data in the column will be lost.
  - You are about to drop the column `expiredAt` on the `EventHistory` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `EventHistory` DROP COLUMN `disableDownload`,
    DROP COLUMN `downloadCount`,
    DROP COLUMN `expiredAt`;

-- AlterTable
ALTER TABLE `EventHistoryContentConnection` ADD COLUMN `disableDownload` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `downloadCount` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `expiredAt` DATETIME(3) NULL,
    ADD COLUMN `firstDownloadAt` DATETIME(3) NULL,
    ADD COLUMN `lastDownloadAt` DATETIME(3) NULL;

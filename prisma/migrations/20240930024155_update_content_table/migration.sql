/*
  Warnings:

  - You are about to drop the column `fileStatus` on the `Content` table. All the data in the column will be lost.
  - You are about to drop the column `originalName` on the `Content` table. All the data in the column will be lost.
  - Made the column `workspaceId` on table `Content` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `Content` DROP FOREIGN KEY `Content_workspaceId_fkey`;

-- AlterTable
ALTER TABLE `Content` DROP COLUMN `fileStatus`,
    DROP COLUMN `originalName`,
    ADD COLUMN `key` VARCHAR(191) NULL,
    ADD COLUMN `name` VARCHAR(191) NULL,
    ADD COLUMN `status` ENUM('PENDING', 'READY') NOT NULL DEFAULT 'PENDING',
    MODIFY `workspaceId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `Content` ADD CONSTRAINT `Content_workspaceId_fkey` FOREIGN KEY (`workspaceId`) REFERENCES `Workspace`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

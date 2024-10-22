/*
  Warnings:

  - Added the required column `workspaceId` to the `EventHistory` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `EventHistory` ADD COLUMN `messageContent` VARCHAR(191) NULL,
    ADD COLUMN `messageVariables` JSON NULL,
    ADD COLUMN `workspaceId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `EventHistory` ADD CONSTRAINT `EventHistory_workspaceId_fkey` FOREIGN KEY (`workspaceId`) REFERENCES `Workspace`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

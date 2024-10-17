-- AlterTable
ALTER TABLE `EventHistory` ADD COLUMN `creditId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `EventHistory` ADD CONSTRAINT `EventHistory_creditId_fkey` FOREIGN KEY (`creditId`) REFERENCES `WorkspaceCredit`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

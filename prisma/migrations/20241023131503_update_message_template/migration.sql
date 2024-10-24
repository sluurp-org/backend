-- DropForeignKey
ALTER TABLE `MessageTemplate` DROP FOREIGN KEY `MessageTemplate_workspaceId_fkey`;

-- AlterTable
ALTER TABLE `MessageTemplate` ADD COLUMN `isGlobal` BOOLEAN NOT NULL DEFAULT false,
    MODIFY `workspaceId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `MessageTemplate` ADD CONSTRAINT `MessageTemplate_workspaceId_fkey` FOREIGN KEY (`workspaceId`) REFERENCES `Workspace`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

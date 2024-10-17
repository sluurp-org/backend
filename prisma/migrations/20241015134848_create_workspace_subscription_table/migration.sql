-- AlterTable
ALTER TABLE `Workspace` ADD COLUMN `subscriptionId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Workspace` ADD CONSTRAINT `Workspace_subscriptionId_fkey` FOREIGN KEY (`subscriptionId`) REFERENCES `SubscriptionModel`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

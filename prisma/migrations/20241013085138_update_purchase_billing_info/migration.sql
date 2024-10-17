-- AlterTable
ALTER TABLE `PurchaseHistory` ADD COLUMN `billingId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `PurchaseHistory` ADD CONSTRAINT `PurchaseHistory_billingId_fkey` FOREIGN KEY (`billingId`) REFERENCES `WorkspaceBilling`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- RenameIndex
ALTER TABLE `PurchaseHistory` RENAME INDEX `PurchaseHistory_subscriptionId_fkey` TO `PurchaseHistory_subscriptionId_idx`;

-- RenameIndex
ALTER TABLE `PurchaseHistory` RENAME INDEX `PurchaseHistory_workspaceId_fkey` TO `PurchaseHistory_workspaceId_idx`;

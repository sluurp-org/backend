-- DropForeignKey
ALTER TABLE `Event` DROP FOREIGN KEY `Event_productId_fkey`;

-- AlterTable
ALTER TABLE `Event` MODIFY `productId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Event` ADD CONSTRAINT `Event_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

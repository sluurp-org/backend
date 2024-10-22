-- DropForeignKey
ALTER TABLE `EventHistory` DROP FOREIGN KEY `EventHistory_eventId_fkey`;

-- DropForeignKey
ALTER TABLE `EventHistory` DROP FOREIGN KEY `EventHistory_orderId_fkey`;

-- AlterTable
ALTER TABLE `EventHistory` ADD COLUMN `messageId` INTEGER NULL,
    MODIFY `eventId` INTEGER NULL,
    MODIFY `orderId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `EventHistory` ADD CONSTRAINT `EventHistory_eventId_fkey` FOREIGN KEY (`eventId`) REFERENCES `Event`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EventHistory` ADD CONSTRAINT `EventHistory_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EventHistory` ADD CONSTRAINT `EventHistory_messageId_fkey` FOREIGN KEY (`messageId`) REFERENCES `MessageTemplate`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

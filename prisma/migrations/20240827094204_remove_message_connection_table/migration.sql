/*
  Warnings:

  - You are about to drop the `EventMessageConnection` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `messageId` to the `Event` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `EventMessageConnection` DROP FOREIGN KEY `EventMessageConnection_eventId_fkey`;

-- DropForeignKey
ALTER TABLE `EventMessageConnection` DROP FOREIGN KEY `EventMessageConnection_messageTemplateId_fkey`;

-- AlterTable
ALTER TABLE `Event` ADD COLUMN `messageId` INTEGER NOT NULL;

-- DropTable
DROP TABLE `EventMessageConnection`;

-- AddForeignKey
ALTER TABLE `Event` ADD CONSTRAINT `Event_messageId_fkey` FOREIGN KEY (`messageId`) REFERENCES `MessageTemplate`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

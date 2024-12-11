/*
  Warnings:

  - You are about to drop the column `sendHour` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `completeDelivery` on the `Message` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Event` DROP COLUMN `sendHour`,
    ADD COLUMN `confirmDelivery` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `dateTarget` ENUM('ORDER', 'RESERVATION') NOT NULL DEFAULT 'ORDER',
    ADD COLUMN `delayHour` INTEGER NULL,
    ADD COLUMN `delayType` ENUM('PAST', 'FUTURE') NOT NULL DEFAULT 'FUTURE',
    ADD COLUMN `fixedHour` INTEGER NULL;

-- AlterTable
ALTER TABLE `Message` DROP COLUMN `completeDelivery`;

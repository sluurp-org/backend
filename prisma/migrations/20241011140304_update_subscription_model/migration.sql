/*
  Warnings:

  - You are about to drop the column `availableFeatures` on the `SubscriptionModel` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `SubscriptionModel` DROP COLUMN `availableFeatures`,
    ADD COLUMN `features` JSON NULL;

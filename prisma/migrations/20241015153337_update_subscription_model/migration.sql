/*
  Warnings:

  - You are about to drop the column `features` on the `SubscriptionModel` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `SubscriptionModel` DROP COLUMN `features`,
    ADD COLUMN `alimTalkCredit` INTEGER NOT NULL DEFAULT 20,
    ADD COLUMN `contentLimit` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `emailCredit` INTEGER NOT NULL DEFAULT 40,
    ADD COLUMN `isContentEnabled` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `messageLimit` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `storeLimit` INTEGER NOT NULL DEFAULT 0;

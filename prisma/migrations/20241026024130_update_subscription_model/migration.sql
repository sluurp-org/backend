-- AlterTable
ALTER TABLE `SubscriptionModel` ADD COLUMN `isMessageEnabled` BOOLEAN NOT NULL DEFAULT false,
    MODIFY `storeLimit` INTEGER NOT NULL DEFAULT 1;

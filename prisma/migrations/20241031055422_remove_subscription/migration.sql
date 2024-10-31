/*
  Warnings:

  - You are about to drop the column `subscriptionId` on the `PurchaseHistory` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `PurchaseHistory` table. All the data in the column will be lost.
  - You are about to drop the column `subscriptionEndedAt` on the `Workspace` table. All the data in the column will be lost.
  - You are about to drop the column `subscriptionId` on the `Workspace` table. All the data in the column will be lost.
  - You are about to drop the `SubscriptionModel` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `PurchaseHistory` DROP FOREIGN KEY `PurchaseHistory_subscriptionId_fkey`;

-- DropForeignKey
ALTER TABLE `Workspace` DROP FOREIGN KEY `Workspace_subscriptionId_fkey`;

-- AlterTable
ALTER TABLE `PurchaseHistory` DROP COLUMN `subscriptionId`,
    DROP COLUMN `type`;

-- AlterTable
ALTER TABLE `Workspace` DROP COLUMN `subscriptionEndedAt`,
    DROP COLUMN `subscriptionId`;

-- DropTable
DROP TABLE `SubscriptionModel`;

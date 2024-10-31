/*
  Warnings:

  - You are about to drop the column `creditId` on the `PurchaseHistory` table. All the data in the column will be lost.
  - You are about to drop the column `endedAt` on the `PurchaseHistory` table. All the data in the column will be lost.
  - You are about to drop the column `startedAt` on the `PurchaseHistory` table. All the data in the column will be lost.
  - You are about to drop the `WorkspaceCredit` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `EventHistory` DROP FOREIGN KEY `EventHistory_creditId_fkey`;

-- DropForeignKey
ALTER TABLE `PurchaseHistory` DROP FOREIGN KEY `PurchaseHistory_creditId_fkey`;

-- DropForeignKey
ALTER TABLE `WorkspaceCredit` DROP FOREIGN KEY `WorkspaceCredit_workspaceId_fkey`;

-- AlterTable
ALTER TABLE `PurchaseHistory` DROP COLUMN `creditId`,
    DROP COLUMN `endedAt`,
    DROP COLUMN `startedAt`;

-- DropTable
DROP TABLE `WorkspaceCredit`;

/*
  Warnings:

  - You are about to drop the column `hashedCardNumber` on the `WorkspaceBilling` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `WorkspaceBilling_workspaceId_hashedCardNumber_key` ON `WorkspaceBilling`;

-- AlterTable
ALTER TABLE `WorkspaceBilling` DROP COLUMN `hashedCardNumber`;

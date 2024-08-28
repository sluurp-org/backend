/*
  Warnings:

  - You are about to drop the column `deletedAt` on the `WorkspaceUser` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `WorkspaceUser` DROP COLUMN `deletedAt`;

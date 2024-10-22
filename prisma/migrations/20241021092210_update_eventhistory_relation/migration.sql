/*
  Warnings:

  - Made the column `orderHistoryId` on table `EventHistory` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `EventHistory` MODIFY `orderHistoryId` INTEGER NOT NULL;

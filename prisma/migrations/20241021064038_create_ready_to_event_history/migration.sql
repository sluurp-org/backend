/*
  Warnings:

  - The values [FAIL] on the enum `EventHistory_status` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `EventHistory` MODIFY `status` ENUM('PENDING', 'READY', 'PROCESSING', 'SUCCESS', 'FAILED') NOT NULL;

-- AlterTable
ALTER TABLE `EventHistory` MODIFY `status` ENUM('PENDING', 'CONTENT_READY', 'READY', 'PROCESSING', 'SUCCESS', 'FAILED') NOT NULL;

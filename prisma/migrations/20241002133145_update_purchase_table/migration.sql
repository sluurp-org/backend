/*
  Warnings:

  - You are about to drop the column `orderedAt` on the `PurchaseHistory` table. All the data in the column will be lost.
  - Added the required column `status` to the `PurchaseHistory` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `PurchaseHistory` DROP COLUMN `orderedAt`,
    ADD COLUMN `creditId` INTEGER NULL,
    ADD COLUMN `purchasedAt` DATETIME(3) NULL,
    ADD COLUMN `status` ENUM('CANCELLED', 'FAILED', 'PAID', 'PARTIAL_CANCELLED', 'PAY_PENDING', 'READY', 'VIRTUAL_ACCOUNT_ISSUED') NOT NULL;

-- AddForeignKey
ALTER TABLE `PurchaseHistory` ADD CONSTRAINT `PurchaseHistory_creditId_fkey` FOREIGN KEY (`creditId`) REFERENCES `WorkspaceCredit`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

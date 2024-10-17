/*
  Warnings:

  - You are about to drop the column `billingKey` on the `Workspace` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Workspace` DROP COLUMN `billingKey`;

-- CreateTable
CREATE TABLE `WorkspaceBilling` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `workspaceId` INTEGER NOT NULL,
    `cardNumber` VARCHAR(191) NOT NULL,
    `hashedCardNumber` VARCHAR(191) NOT NULL,
    `billingKey` VARCHAR(191) NOT NULL,
    `default` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `WorkspaceBilling_workspaceId_hashedCardNumber_key`(`workspaceId`, `hashedCardNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `WorkspaceBilling` ADD CONSTRAINT `WorkspaceBilling_workspaceId_fkey` FOREIGN KEY (`workspaceId`) REFERENCES `Workspace`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

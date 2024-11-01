/*
  Warnings:

  - Added the required column `type` to the `PhoneVerification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `recepitId` to the `PurchaseHistory` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `PhoneVerification` ADD COLUMN `type` ENUM('REGISTER', 'FIND_PASSWORD') NOT NULL;

-- AlterTable
ALTER TABLE `PurchaseHistory` ADD COLUMN `recepitId` INTEGER NOT NULL;

-- CreateTable
CREATE TABLE `Recepit` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `workspaceId` INTEGER NOT NULL,
    `emailSendCount` INTEGER NOT NULL DEFAULT 0,
    `alimtalkSendCount` INTEGER NOT NULL DEFAULT 0,
    `contentSendCount` INTEGER NOT NULL DEFAULT 0,
    `emailPrice` INTEGER NOT NULL DEFAULT 0,
    `alimtalkPrice` INTEGER NOT NULL DEFAULT 0,
    `contentPrice` INTEGER NOT NULL DEFAULT 0,
    `amount` INTEGER NOT NULL DEFAULT 0,
    `discountAmount` INTEGER NOT NULL DEFAULT 0,
    `totalAmount` INTEGER NOT NULL DEFAULT 0,
    `issuedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Recepit` ADD CONSTRAINT `Recepit_workspaceId_fkey` FOREIGN KEY (`workspaceId`) REFERENCES `Workspace`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseHistory` ADD CONSTRAINT `PurchaseHistory_recepitId_fkey` FOREIGN KEY (`recepitId`) REFERENCES `Recepit`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

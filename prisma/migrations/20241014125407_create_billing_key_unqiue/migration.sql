/*
  Warnings:

  - A unique constraint covering the columns `[billingKey]` on the table `WorkspaceBilling` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateTable
CREATE TABLE `InternalMailTemplate` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `WorkspaceBilling_billingKey_key` ON `WorkspaceBilling`(`billingKey`);

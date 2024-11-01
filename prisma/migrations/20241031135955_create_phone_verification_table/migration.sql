-- CreateTable
CREATE TABLE `PhoneVerification` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `phone` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `expiredAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `PhoneVerification_phone_key`(`phone`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

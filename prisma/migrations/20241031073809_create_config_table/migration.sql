-- DropIndex
DROP INDEX `EventHistory_creditId_fkey` ON `EventHistory`;

-- CreateTable
CREATE TABLE `Config` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `defaultPrice` INTEGER NOT NULL DEFAULT 5000,
    `customAlimtalkPrice` INTEGER NOT NULL DEFAULT 50,
    `alimtalkSendPrice` INTEGER NOT NULL DEFAULT 100,
    `emailSendPrice` INTEGER NOT NULL DEFAULT 150,
    `contentSendPrice` INTEGER NOT NULL DEFAULT 100,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

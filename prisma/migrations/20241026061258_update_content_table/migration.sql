-- AlterTable
ALTER TABLE `Content` ADD COLUMN `type` ENUM('FILE', 'TEXT', 'URL', 'QRCODE', 'BARCODE') NOT NULL DEFAULT 'TEXT';
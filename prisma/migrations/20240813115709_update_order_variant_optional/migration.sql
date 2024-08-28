-- DropForeignKey
ALTER TABLE `Order` DROP FOREIGN KEY `Order_productVariantId_fkey`;

-- AlterTable
ALTER TABLE `Order` MODIFY `productVariantId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_productVariantId_fkey` FOREIGN KEY (`productVariantId`) REFERENCES `ProductVariant`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

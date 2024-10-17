/*
  Warnings:

  - You are about to drop the column `internal` on the `Variables` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[productId,productVariantId,messageId,type]` on the table `Event` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `kakaoCredentialId` to the `KakaoTemplate` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `KakaoTemplate` ADD COLUMN `kakaoCredentialId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `MessageTemplate` MODIFY `variables` JSON NULL;

-- AlterTable
ALTER TABLE `Variables` DROP COLUMN `internal`;

-- CreateIndex
CREATE UNIQUE INDEX `Event_productId_productVariantId_messageId_type_key` ON `Event`(`productId`, `productVariantId`, `messageId`, `type`);

-- AddForeignKey
ALTER TABLE `KakaoTemplate` ADD CONSTRAINT `KakaoTemplate_kakaoCredentialId_fkey` FOREIGN KEY (`kakaoCredentialId`) REFERENCES `KakaoCredential`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

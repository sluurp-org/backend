/*
  Warnings:

  - You are about to drop the column `messageTemplateId` on the `KakaoTemplate` table. All the data in the column will be lost.
  - Added the required column `kakaoTemplateId` to the `MessageTemplate` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `KakaoTemplate` DROP FOREIGN KEY `KakaoTemplate_messageTemplateId_fkey`;

-- AlterTable
ALTER TABLE `KakaoTemplate` DROP COLUMN `messageTemplateId`,
    MODIFY `kakaoCredentialId` INTEGER NULL;

-- AlterTable
ALTER TABLE `MessageTemplate` ADD COLUMN `kakaoTemplateId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `MessageTemplate` ADD CONSTRAINT `MessageTemplate_kakaoTemplateId_fkey` FOREIGN KEY (`kakaoTemplateId`) REFERENCES `KakaoTemplate`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

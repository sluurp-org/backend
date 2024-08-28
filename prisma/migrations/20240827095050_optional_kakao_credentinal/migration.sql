-- DropForeignKey
ALTER TABLE `KakaoTemplate` DROP FOREIGN KEY `KakaoTemplate_credentialId_fkey`;

-- AlterTable
ALTER TABLE `KakaoTemplate` MODIFY `credentialId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `KakaoTemplate` ADD CONSTRAINT `KakaoTemplate_credentialId_fkey` FOREIGN KEY (`credentialId`) REFERENCES `KakaoCredential`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

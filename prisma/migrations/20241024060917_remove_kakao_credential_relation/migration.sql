/*
  Warnings:

  - You are about to drop the column `kakaoCredentialId` on the `KakaoTemplate` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `KakaoTemplate` DROP FOREIGN KEY `KakaoTemplate_kakaoCredentialId_fkey`;

-- AlterTable
ALTER TABLE `KakaoTemplate` DROP COLUMN `kakaoCredentialId`;

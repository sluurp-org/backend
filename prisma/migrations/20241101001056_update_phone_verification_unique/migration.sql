/*
  Warnings:

  - A unique constraint covering the columns `[phone,type]` on the table `PhoneVerification` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `PhoneVerification_phone_key` ON `PhoneVerification`;

-- CreateIndex
CREATE UNIQUE INDEX `PhoneVerification_phone_type_key` ON `PhoneVerification`(`phone`, `type`);

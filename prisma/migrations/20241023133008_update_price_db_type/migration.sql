/*
  Warnings:

  - You are about to alter the column `price` on the `Order` table. The data in that column could be lost. The data in that column will be cast from `Int` to `UnsignedMediumInt`.
  - You are about to alter the column `quantity` on the `Order` table. The data in that column could be lost. The data in that column will be cast from `Int` to `UnsignedMediumInt`.

*/
-- AlterTable
ALTER TABLE `Order` MODIFY `price` MEDIUMINT UNSIGNED NULL,
    MODIFY `quantity` MEDIUMINT UNSIGNED NULL;

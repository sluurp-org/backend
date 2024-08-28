/*
  Warnings:

  - A unique constraint covering the columns `[orderId,productOrderId,storeId]` on the table `Order` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `Order_productOrderId_storeId_idx` ON `Order`;

-- CreateIndex
CREATE UNIQUE INDEX `Order_orderId_productOrderId_storeId_key` ON `Order`(`orderId`, `productOrderId`, `storeId`);

/*
  Warnings:

  - A unique constraint covering the columns `[workspaceId]` on the table `WorkspaceBilling` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `WorkspaceBilling_workspaceId_key` ON `WorkspaceBilling`(`workspaceId`);

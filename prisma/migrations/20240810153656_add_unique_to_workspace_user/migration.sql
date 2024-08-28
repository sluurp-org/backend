/*
  Warnings:

  - A unique constraint covering the columns `[userId,workspaceId]` on the table `WorkspaceUser` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `WorkspaceUser_userId_workspaceId_key` ON `WorkspaceUser`(`userId`, `workspaceId`);

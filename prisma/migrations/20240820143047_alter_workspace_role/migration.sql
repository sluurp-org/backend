/*
  Warnings:

  - The values [ADMIN] on the enum `WorkspaceUser_role` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `WorkspaceUser` MODIFY `role` ENUM('OWNER', 'MEMBER') NOT NULL DEFAULT 'MEMBER';

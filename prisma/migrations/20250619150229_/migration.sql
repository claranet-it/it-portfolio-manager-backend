/*
  Warnings:

  - You are about to drop the column `encryptionCompleted` on the `CompanyKeys` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `CompanyKeys` DROP COLUMN `encryptionCompleted`,
    ADD COLUMN `encryptionStatus` ENUM('notEncrypted', 'pending', 'completed', 'failed') NOT NULL DEFAULT 'notEncrypted';

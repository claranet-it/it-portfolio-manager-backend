/*
  Warnings:

  - Added the required column `primary_contact` to the `Company` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Company` ADD COLUMN `primary_contact` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `Company` ADD COLUMN `company_master` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `primary_contact` VARCHAR(191) NULL;

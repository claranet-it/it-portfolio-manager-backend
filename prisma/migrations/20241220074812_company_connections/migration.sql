-- CreateTable
CREATE TABLE `CompanyConnections` (
    `requester_company_id` VARCHAR(191) NOT NULL,
    `correspondent_company_id` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `CompanyConnections_requester_company_id_correspondent_compan_key`(`requester_company_id`, `correspondent_company_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `CompanyConnections` ADD CONSTRAINT `CompanyConnections_requester_company_id_fkey` FOREIGN KEY (`requester_company_id`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CompanyConnections` ADD CONSTRAINT `CompanyConnections_correspondent_company_id_fkey` FOREIGN KEY (`correspondent_company_id`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

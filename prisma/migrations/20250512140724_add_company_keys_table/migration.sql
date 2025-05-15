-- CreateTable
CREATE TABLE `CompanyKeys` (
    `id` VARCHAR(191) NOT NULL,
    `company_id` VARCHAR(191) NOT NULL,
    `encryptedPrivateKey` TEXT NOT NULL,
    `encryptedAESKey` TEXT NOT NULL,
    `publicKey` TEXT NOT NULL,

    UNIQUE INDEX `CompanyKeys_company_id_key`(`company_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `CompanyKeys` ADD CONSTRAINT `CompanyKeys_company_id_fkey` FOREIGN KEY (`company_id`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

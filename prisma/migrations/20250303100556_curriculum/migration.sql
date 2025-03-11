-- CreateTable
CREATE TABLE `CurriculumVitae` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `role` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `summary` VARCHAR(191) NULL,
    `main_skills` VARCHAR(191) NULL,

    UNIQUE INDEX `CurriculumVitae_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Education` (
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `curriculum_id` VARCHAR(191) NOT NULL,
    `note` VARCHAR(191) NULL,
    `year_start` INTEGER NOT NULL,
    `year_end` INTEGER NULL,
    `institution` VARCHAR(191) NOT NULL,
    `current` BOOLEAN NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Work` (
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `curriculum_id` VARCHAR(191) NOT NULL,
    `note` VARCHAR(191) NULL,
    `year_start` INTEGER NOT NULL,
    `year_end` INTEGER NULL,
    `institution` VARCHAR(191) NOT NULL,
    `role` VARCHAR(191) NULL,
    `current` BOOLEAN NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Education` ADD CONSTRAINT `Education_curriculum_id_fkey` FOREIGN KEY (`curriculum_id`) REFERENCES `CurriculumVitae`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Work` ADD CONSTRAINT `Work_curriculum_id_fkey` FOREIGN KEY (`curriculum_id`) REFERENCES `CurriculumVitae`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE `CurriculumVitae` MODIFY `summary` VARCHAR(1000) NULL,
    MODIFY `main_skills` VARCHAR(1000) NULL;

-- AlterTable
ALTER TABLE `Education` MODIFY `note` VARCHAR(1000) NULL;

-- AlterTable
ALTER TABLE `Work` MODIFY `note` VARCHAR(1000) NULL;

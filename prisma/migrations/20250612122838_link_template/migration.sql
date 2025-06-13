-- AddForeignKey
ALTER TABLE `Template` ADD CONSTRAINT `Template_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `Customer`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Template` ADD CONSTRAINT `Template_project_id_fkey` FOREIGN KEY (`project_id`) REFERENCES `Project`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Template` ADD CONSTRAINT `Template_task_id_fkey` FOREIGN KEY (`task_id`) REFERENCES `ProjectTask`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

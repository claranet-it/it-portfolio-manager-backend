import { CompanyService } from "@src/core/Company/service/CompanyService";
import { CompanyConnectionsService } from "@src/core/CompanyConnections/service/CompanyConnectionsService";
import { EffortService } from "@src/core/Effort/service/EffortService";
import { JwtTokenType } from "@src/core/JwtToken/model/jwtToken.model";
import { SkillMatrixService } from "@src/core/SkillMatrix/service/SkillMatrixService";
import { TaskService } from "@src/core/Task/service/TaskService";
import { UserProfileService } from "@src/core/User/service/UserProfileService";
import { CompanyRepository } from "@src/infrastructure/Company/Repository/CompanyRepository";
import { ForbiddenException } from "@src/shared/exceptions/ForbiddenException";
import { NotFoundException } from "@src/shared/exceptions/NotFoundException";

export class UnsubscribeService {
    constructor(
        private readonly companyRepository: CompanyRepository,
        private readonly companyService: CompanyService,
        private readonly skillMatrixService: SkillMatrixService,
        private readonly taskService: TaskService,
        private readonly effortService: EffortService,
        private readonly companyConnectionsService: CompanyConnectionsService,
        private readonly userProfileService: UserProfileService,
    ) { }

    async unsubscribe(jwtToken: JwtTokenType, idCompany: string): Promise<void> {
        const company = await this.companyRepository.findById(idCompany)

        if (!company) {
            throw new NotFoundException('Company not found')
        }

        if (company.name !== jwtToken.company) {
            throw new ForbiddenException('Forbidden')
        }

        await this.taskService.deleteCustomersAndRelatedDataByCompany(idCompany)
        await this.effortService.deleteEffortByCompany(company.name)
        await this.skillMatrixService.deleteSkillMatrixByCompany(company.name)
        await this.companyConnectionsService.deleteConnections(idCompany)
        await this.userProfileService.deleteUsersByCompany(company.name)
        await this.companyService.deleteCompany(idCompany)
    }
}

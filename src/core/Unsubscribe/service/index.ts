import { CompanyService } from "@src/core/Company/service/CompanyService";
import { CompanyConnectionsService } from "@src/core/CompanyConnections/service/CompanyConnectionsService";
import { EffortService } from "@src/core/Effort/service/EffortService";
import { JwtTokenType } from "@src/core/JwtToken/model/jwtToken.model";
import { SkillMatrixService } from "@src/core/SkillMatrix/service/SkillMatrixService";
import { TaskService } from "@src/core/Task/service/TaskService";
import { UserProfileService } from "@src/core/User/service/UserProfileService";
import { sendEmail } from "@src/handlers/sendEmail";
import { CompanyRepository } from "@src/infrastructure/Company/Repository/CompanyRepository";
import { SesConnection } from "@src/infrastructure/mailer/sesConnection";
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
        const sesClient = SesConnection.getClient()
        const company = await this.companyRepository.findById(idCompany)
        /* const companyMaster = await this.companyRepository.findCompanyMaster() */

        if (!company) {
            throw new NotFoundException('Company not found')
        }

        if (company.name !== jwtToken.company) {
            throw new ForbiddenException('Forbidden')
        }

        const from = `${company.name}@unsubscribe.com`;
        const to = "marteresa28@gmail.com" /* companyMaster.primary_contact */
        const body = `Mail created automatically. The company ${company.domain} has just submitted an unsubscription request at ${new Date()}.`
        console.log("##### mail")
        console.log("##### from", from)
        console.log("##### to", to)
        console.log("##### body", body)
        sendEmail(sesClient, from, to, "Unsubscribe Company", body)

        /*  await this.taskService.deleteCustomersAndRelatedDataByCompany(idCompany)
         await this.effortService.deleteEffortByCompany(company.name)
         await this.skillMatrixService.deleteSkillMatrixByCompany(company.name)
         await this.companyConnectionsService.deleteConnections(idCompany)
         await this.userProfileService.deleteUsersByCompany(company.name)
         await this.companyService.deleteCompany(idCompany) */
    }
}

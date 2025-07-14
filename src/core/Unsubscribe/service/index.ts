import { CompanyService } from "@src/core/Company/service/CompanyService";
import { CompanyConnectionsService } from "@src/core/CompanyConnections/service/CompanyConnectionsService";
import { EffortService } from "@src/core/Effort/service/EffortService";
import { JwtTokenType } from "@src/core/JwtToken/model/jwtToken.model";
import { SkillMatrixService } from "@src/core/SkillMatrix/service/SkillMatrixService";
import { TaskService } from "@src/core/Task/service/TaskService";
import { UserProfileService } from "@src/core/User/service/UserProfileService";
import { CompanyRepository } from "@src/infrastructure/Company/Repository/CompanyRepository";
import { Mailer } from "@src/infrastructure/mailer/Mailer";
import { ForbiddenException } from "@src/shared/exceptions/ForbiddenException";
import { NotFoundException } from "@src/shared/exceptions/NotFoundException";
import { getTestMessageUrl } from "nodemailer";
import { BadRequestException } from '@src/shared/exceptions/BadRequestException'

export class UnsubscribeService {
    constructor(
        private readonly companyRepository: CompanyRepository,
        private readonly companyService: CompanyService,
        private readonly skillMatrixService: SkillMatrixService,
        private readonly taskService: TaskService,
        private readonly effortService: EffortService,
        private readonly companyConnectionsService: CompanyConnectionsService,
        private readonly userProfileService: UserProfileService,
        private readonly mailer: Mailer
    ) { }

    async unsubscribe(jwtToken: JwtTokenType, idCompany: string): Promise<void> {
        const company = await this.companyRepository.findById(idCompany)

        if (!company) {
            throw new NotFoundException('Company not found')
        }

        if (company.name !== jwtToken.company) {
            throw new ForbiddenException('Forbidden')
        }

        const from = process.env.SENDER_EMAIL;
        const to = process.env.RECEIVER_EMAIL;
        const subject = `Unsubscription Request for ${company.domain}`;
        const body = `Mail created automatically.
        Unsubscription request has been submitted for ${company.name} (domain: ${company.domain}) on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}.
        Please verify that all associated data for this company has been successfully and completely removed from our database in accordance with our data retention policies and relevant regulations.`

        if (!(from && to)) {
            throw new NotFoundException("Sending or Reciver email not found!");
        }

        try {
            const info = await this.mailer.sendEmail(from, to, subject, body)
            if (info) {
                console.log("Preview URL: %s", getTestMessageUrl(info));
                console.log('Email sent:', info.response);
            }
        } catch (err) {
            console.error("Error while sending mail", err);
            throw new Error("Error while sending mail")
        }

        /* TODO: unica transaction al passaggio completo su MariaDB */
        await this.taskService.deleteCustomersAndRelatedDataByCompany(idCompany)
        await this.effortService.deleteEffortByCompany(company.name)
        await this.skillMatrixService.deleteSkillMatrixByCompany(company.name)
        await this.companyConnectionsService.deleteConnections(idCompany)
        await this.userProfileService.deleteUsersByCompany(company.name)
        await this.companyService.deleteCompany(idCompany)
    }
}

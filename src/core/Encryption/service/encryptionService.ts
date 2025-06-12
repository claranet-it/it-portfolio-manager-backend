import { TaskRepositoryInterface } from '@src/core/Task/repository/TaskRepositoryInterface'
import { JwtTokenType } from '@src/core/JwtToken/model/jwtToken.model'
import { NotFoundException } from '@src/shared/exceptions/NotFoundException'
import { CompanyRepositoryInterface } from '@src/core/Company/repository/CompanyRepositoryInterface'
import { CustomerType, ProjectToEncryptType, TaskType } from '@src/core/Task/model/task.model'
import { TimeEntryRepositoryInterface } from '@src/core/TimeEntry/repository/TimeEntryRepositoryInterface'
import { TimeEntriesToEncryptType } from '@src/core/TimeEntry/model/timeEntry.model'
import { EffortRowType } from '@src/core/Effort/model/effort'
import { UserProfileRepository } from '@src/infrastructure/User/repository/UserProfileRepository'
import { EffortRepository } from '@src/infrastructure/Effort/repository/EffortRepository'
import { DynamoDBConnection } from '@src/infrastructure/db/DynamoDBConnection'
import { GetDataToEncryptReturnType } from '@src/core/Encryption/model/dataToEncrypt'
import { Prisma, PrismaClient } from '../../../../prisma/generated'
import { CompanyKeysRepositoryInterface } from '@src/core/Company/repository/CompanyKeysRepositoryInterface'
import { BadRequestException } from '@src/shared/exceptions/BadRequestException'
import { DefaultArgs } from 'prisma/generated/runtime/library'

export class EncryptionService {
  constructor(
    private taskRepository: TaskRepositoryInterface,
    private timeEntryRepository: TimeEntryRepositoryInterface,
    private companyRepository: CompanyRepositoryInterface,
    private effortRepository: EffortRepository = new EffortRepository(DynamoDBConnection.getClient(), false),
    private userRepository: UserProfileRepository = new UserProfileRepository(DynamoDBConnection.getClient()),
    private companyKeysRepository: CompanyKeysRepositoryInterface,
  ) {
  }

  async getDataToEncrypt(jwtToken: JwtTokenType) {
    const company = await this.companyRepository.findOne({
      name: jwtToken.company,
    })

    if (!company) {
      throw new NotFoundException('Company not found')
    }

    const customers: CustomerType[] = await this.taskRepository.getCustomersByCompany(company.name)
    const projects = await this.taskRepository.getProjectsByCompany(company.name)
    const tasks: TaskType[] = await this.taskRepository.getTasksByCompany(company.name)
    const timeEntries = await this.timeEntryRepository.getTimeEntriesByCompany(company.name)

    const companyUsers: string[] = (await this.userRepository.getByCompany(company.name)).map((u) => u.uid)
    const efforts = await this.effortRepository.getEffortsByUids(companyUsers)

    return this.aggregateDataToEncrypt(tasks, customers, projects, timeEntries, efforts)
  }

  async encryptData(jwtToken: JwtTokenType, dataToEncrypt: GetDataToEncryptReturnType) {
    const company = await this.companyRepository.findOne({
      name: jwtToken.company,
    })

    if (!company) {
      throw new NotFoundException('Company not found')
    }

    const companyKeys = await this.companyKeysRepository.findByCompany(company.id)

    if (!companyKeys) {
      throw new NotFoundException('Company keys not found')
    }

    if (companyKeys.encryptionCompleted) {
      throw new BadRequestException('Encryption already completed')
    }

    const prisma = new PrismaClient()

    const companyUsers: string[] = (await this.userRepository.getByCompany(company.name)).map((u) => u.uid)
    const previuoseEffort = await this.effortRepository.getEffortsByUids(companyUsers)

    try {
      await this.companyKeysRepository.updateEncryptionStatus(company.id, true)

      for (const effort of dataToEncrypt.efforts) {
        await this.effortRepository.saveEffort({
          uid: effort.id,
          month_year: effort.month_year,
          confirmedEffort: effort.confirmedEffort,
          tentativeEffort: effort.tentativeEffort,
          notes: effort.notes,
        })
      }

      const customers: Prisma.Prisma__CustomerClient<{ id: string; company_id: string; name: string; inactive: boolean; createdAt: Date; updatedAt: Date }, never, DefaultArgs>[] = []
      dataToEncrypt.customers.forEach((object) => {
        customers.push(prisma.customer.update({
          where: {
            id: object.id,
          },
          data: {
            name: object.name,
          },
        }))
      })

      const projects: Prisma.Prisma__ProjectClient<{ id: string; customer_id: string; name: string; project_type: string; is_inactive: boolean; plannedHours: number; createdAt: Date; updatedAt: Date; completed: boolean }, never, DefaultArgs>[] = [];
      dataToEncrypt.projects.forEach( (object) => {
        projects.push(prisma.project.update({
          where: {
            id: object.id
          },
          data: {
            name: object.name
          }
        }));
      })

      const tasks: Prisma.Prisma__ProjectTaskClient<{ id: string; project_id: string; name: string; is_completed: boolean; planned_hours: number; createdAt: Date; updatedAt: Date }, never, DefaultArgs>[] = [];
      dataToEncrypt.tasks.forEach( (object) => {
        tasks.push(prisma.projectTask.update({
          where: {
            id: object.id
          },
          data: {
            name: object.name
          }
        }));
      })

      const timeEntries: Prisma.Prisma__TimeEntryClient<{ id: string; time_entry_date: Date; task_id: string; hours: number; description: string | null; time_start: string | null; time_end: string | null; email: string; createdAt: Date; updatedAt: Date }, never, DefaultArgs>[] = [];
      dataToEncrypt.timeEntries.forEach( (object) => {
        timeEntries.push(prisma.timeEntry.update({
          where: {
            id: object.id
          },
          data: {
            description: object.description
          }
        }));
      })


      await prisma.$transaction([...customers, ...projects, ...tasks, ...timeEntries]);
    } catch (error) {
      console.log(error);
      console.log('Error encrypting data. Start rolling back dynamoDB table');
      for (const effort of previuoseEffort) {
        await this.effortRepository.saveEffort(effort);
      }
      await this.companyKeysRepository.updateEncryptionStatus(company.id, false);
      throw error;
    }

  }

  private aggregateDataToEncrypt(
    tasks: TaskType[],
    customers: CustomerType[],
    projects: ProjectToEncryptType[],
    timeEntries: TimeEntriesToEncryptType[],
    efforts: EffortRowType[]
  ): GetDataToEncryptReturnType {
    return {
      tasks: tasks.map((t) => ({
        id: t.id,
        name: t.name,
      })),
      customers: customers.map((c) => ({
        id: c.id,
        name: c.name,
      })),
      projects: projects.map((p) => ({ id: p.id, name: p.name })),
      timeEntries: timeEntries,
      efforts: efforts.map((e) => ({
        id: e.uid,
        month_year: e.month_year,
        confirmedEffort: e.confirmedEffort,
        tentativeEffort: e.tentativeEffort,
        notes: e.notes
      })),
    }
  }
}
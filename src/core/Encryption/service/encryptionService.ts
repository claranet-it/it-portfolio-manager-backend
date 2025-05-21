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
import { PrismaClient } from '../../../../prisma/generated'
import { CompanyKeysRepositoryInterface } from '@src/core/Company/repository/CompanyKeysRepositoryInterface'

export class EncryptionService {
  constructor(
    private taskRepository: TaskRepositoryInterface,
    private timeEntryRepository: TimeEntryRepositoryInterface,
    private companyRepository: CompanyRepositoryInterface,
    private effortRepository: EffortRepository = new EffortRepository(DynamoDBConnection.getClient(), false),
    private userRepository: UserProfileRepository = new UserProfileRepository(DynamoDBConnection.getClient()),
    private companyKeysRepository: CompanyKeysRepositoryInterface
  ) {}

  async getDataToEncrypt(jwtToken: JwtTokenType) {
    const company = await this.companyRepository.findOne({
      name: jwtToken.company,
    })

    if (!company) {
      throw new NotFoundException('Company not found')
    }

    const customers: CustomerType[] = await this.taskRepository.getCustomersByCompany(company.name);
    const projects = await this.taskRepository.getProjectsByCompany(company.name);
    const tasks: TaskType[] = await this.taskRepository.getTasksByCompany(company.name);
    const timeEntries = await this.timeEntryRepository.getTimeEntriesByCompany(company.name);

    const companyUsers: string[] = (await this.userRepository.getByCompany(company.name)).map((u) => u.uid);
    const efforts = await this.effortRepository.getEffortsByUids(companyUsers);

    return this.aggregateDataToEncrypt(tasks, customers, projects, timeEntries, efforts);
  }

  async encryptData(jwtToken: JwtTokenType, dataToEncrypt: GetDataToEncryptReturnType) {
    const company = await this.companyRepository.findOne({
      name: jwtToken.company,
    })

    if (!company) {
      throw new NotFoundException('Company not found')
    }

    const prisma = new PrismaClient();

    const companyUsers: string[] = (await this.userRepository.getByCompany(company.name)).map((u) => u.uid);
    const previuoseEffort = await this.effortRepository.getEffortsByUids(companyUsers);

    try {
      for (const effort of dataToEncrypt.efforts) {
        await this.effortRepository.saveEffort({
          uid: effort.id,
          month_year: effort.month_year,
          confirmedEffort: effort.confirmedEffort,
          tentativeEffort: effort.tentativeEffort,
          notes: effort.notes
        })
      }

      const customers: any[] = [];
      dataToEncrypt.customers.forEach( (object) => {
        customers.push(prisma.customer.update({
          where: {
            id: object.id
          },
          data: {
            name: object.name
          }
        }));
      })

      const projects: any[] = [];
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

      const tasks: any[] = [];
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

      const timeEntries: any[] = [];
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
      await this.companyKeysRepository.updateEncryptionStatus(company.id, true);
    } catch (error) {
      console.log(error);
      console.log('Error encrypting data. Start rolling back dynamoDB table');
      for (const effort of previuoseEffort) {
        await this.effortRepository.saveEffort(effort);
      }
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
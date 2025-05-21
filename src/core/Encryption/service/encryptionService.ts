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

export class EncryptionService {
  constructor(
    private taskRepository: TaskRepositoryInterface,
    private timeEntryRepository: TimeEntryRepositoryInterface,
    private companyRepository: CompanyRepositoryInterface,
    private effortRepository: EffortRepository = new EffortRepository(DynamoDBConnection.getClient(), false),
    private userRepository: UserProfileRepository = new UserProfileRepository(DynamoDBConnection.getClient()),
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
      efforts: efforts.map((e) => ({ id: e.uid, notes: e.notes }))
    }
  }
}
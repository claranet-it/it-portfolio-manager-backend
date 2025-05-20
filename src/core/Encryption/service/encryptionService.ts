import { TaskRepositoryInterface } from '@src/core/Task/repository/TaskRepositoryInterface'
import { JwtTokenType } from '@src/core/JwtToken/model/jwtToken.model'
import { NotFoundException } from '@src/shared/exceptions/NotFoundException'
import { CompanyRepositoryInterface } from '@src/core/Company/repository/CompanyRepositoryInterface'
import { CustomerType, ProjectToEncryptType, TaskType } from '@src/core/Task/model/task.model'
import { TimeEntryRepositoryInterface } from '@src/core/TimeEntry/repository/TimeEntryRepositoryInterface'
import { TimeEntriesToEncryptType } from '@src/core/TimeEntry/model/timeEntry.model'
import { EffortRepositoryInterface } from '@src/core/Effort/repository/EffortRepositoryInterface'
import { UserProfileRepositoryInterface } from '@src/core/User/repository/UserProfileRepositoryInterface'
import { EffortRowType } from '@src/core/Effort/model/effort'

export class EncryptionService {
  constructor(
    private taskRepository: TaskRepositoryInterface,
    private timeEntryRepository: TimeEntryRepositoryInterface,
    private effortRepository: EffortRepositoryInterface,
    private userRepository: UserProfileRepositoryInterface,
    private companyRepository: CompanyRepositoryInterface
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


    const users = (await this.userRepository.getByCompany(company.name)).map((u) => u.uid)
    const effort = await this.effortRepository.getEffortByCompany(users);

    return this.aggregateDataToEncrypt(tasks, customers, projects, timeEntries, effort);
  }

  private aggregateDataToEncrypt(
    tasks: TaskType[],
    customers: CustomerType[],
    projects: ProjectToEncryptType[],
    timeEntries: TimeEntriesToEncryptType[],
    effort: EffortRowType[]
  ): any {
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
      effort: effort.map((e) => ({
        id: e.uid,
        notes: e.notes,
      }))
    }
  }
}
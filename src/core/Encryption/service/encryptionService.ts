import { TaskRepositoryInterface } from '@src/core/Task/repository/TaskRepositoryInterface'
import { JwtTokenType } from '@src/core/JwtToken/model/jwtToken.model'
import { NotFoundException } from '@src/shared/exceptions/NotFoundException'
import { CompanyRepositoryInterface } from '@src/core/Company/repository/CompanyRepositoryInterface'
import { CustomerType, ProjectToEncryptType, TaskType } from '@src/core/Task/model/task.model'

export class EncryptionService {
  constructor(
    private taskRepository: TaskRepositoryInterface,
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
    const projects = await this.taskRepository.getProjectsByCompany(company.id);
    const tasks: TaskType[] = await this.taskRepository.getTasksByCompany(company.name);

    return this.aggregateDataToEncrypt(tasks, customers, projects);
  }

  private aggregateDataToEncrypt(tasks: TaskType[], customers: CustomerType[], projects: ProjectToEncryptType[]): any {
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
    }
  }
}
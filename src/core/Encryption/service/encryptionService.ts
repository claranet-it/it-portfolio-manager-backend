import { TaskRepositoryInterface } from '@src/core/Task/repository/TaskRepositoryInterface'
import { JwtTokenType } from '@src/core/JwtToken/model/jwtToken.model'
import { NotFoundException } from '@src/shared/exceptions/NotFoundException'
import { CompanyRepositoryInterface } from '@src/core/Company/repository/CompanyRepositoryInterface'
import { TaskType } from '@src/core/Task/model/task.model'

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

    //const customers = await this.taskRepository.getCustomersByCompany(company.id);
    //const projects = await this.taskRepository.getProjectsByCompany(company.id);
    const tasks: TaskType[] = await this.taskRepository.getTasksByCompany(company.name);

    console.log(tasks);

    return this.aggregateDataToEncrypt(tasks);
  }

  private aggregateDataToEncrypt(tasks: TaskType[]): any {
    return {
      tasks: tasks.map((t) => ({
        id: t.id,
        name: t.name,
      })),
      customers: [],
      projects: [],
    }



  }
}
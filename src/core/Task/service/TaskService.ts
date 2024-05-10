import { TaskRepositoryInterface } from '@src/core/Task/repository/TaskRepositoryInterface'

export class TaskService {
  constructor(private taskRepository: TaskRepositoryInterface) {}


  async getCustomers(company: string): Promise<string[]>{
    return this.taskRepository.getCustomers(company)
  }
}

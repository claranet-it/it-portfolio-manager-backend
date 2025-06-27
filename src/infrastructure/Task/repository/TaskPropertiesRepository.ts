import { TaskPropertiesUpdateParamsType } from '@src/core/Task/model/task.model'
import { TaskPropertiesRepositoryInterface } from '@src/core/Task/repository/TaskPropertiesRepositoryInterface'
import { PrismaDBConnection } from '@src/infrastructure/db/PrismaDBConnection'

export class TaskPropertiesRepository
  implements TaskPropertiesRepositoryInterface
{
  constructor(private readonly prismaDBConnection: PrismaDBConnection) {}

  async updateTaskProperties(
    params: TaskPropertiesUpdateParamsType,
  ): Promise<void> {
    const task = await this.prismaDBConnection.getClient().projectTask.findUniqueOrThrow({
      where: {
        id: params.task,
      },
    })

    await this.prismaDBConnection.getClient().projectTask.update({
      where: {
        id: task.id,
      },
      data: {
        is_completed: params.completed ?? false,
        planned_hours: params.plannedHours ?? 0,
      },
    })
  }
}

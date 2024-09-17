import { TaskPropertiesUpdateParamsType } from '@src/core/Task/model/task.model'
import { TaskPropertiesRepositoryInterface } from '@src/core/Task/repository/TaskPropertiesRepositoryInterface'
import { PrismaClient } from '../../../../prisma/generated'

export class TaskPropertiesRepository
  implements TaskPropertiesRepositoryInterface
{
  async updateTaskProperties(
    params: TaskPropertiesUpdateParamsType,
  ): Promise<void> {
    const prisma = new PrismaClient()
    const task = await prisma.projectTask.findFirstOrThrow({
      where: {
        name: params.task,
        project: {
          name: params.project,
          customer: {
            name: params.customer,
            company_id: params.company,
          },
        },
      },
    })

    await prisma.projectTask.update({
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

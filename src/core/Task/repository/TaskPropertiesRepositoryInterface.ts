import { TaskPropertiesUpdateParamsType } from '../model/task.model'

export interface TaskPropertiesRepositoryInterface {
  updateTaskProperties(params: TaskPropertiesUpdateParamsType): Promise<void>
}

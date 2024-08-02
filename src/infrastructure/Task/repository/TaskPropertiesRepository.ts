import { DynamoDBClient, UpdateItemCommand } from '@aws-sdk/client-dynamodb'
import { TaskPropertiesUpdateParamsType } from '@src/core/Task/model/task.model'
import { getTableName } from '@src/core/db/TableName'
import { TaskPropertiesRepositoryInterface } from '@src/core/Task/repository/TaskPropertiesRepositoryInterface'

export class TaskPropertiesRepository
  implements TaskPropertiesRepositoryInterface
{
  constructor(private dynamoDBClient: DynamoDBClient) {}

  async updateTaskProperties(
    params: TaskPropertiesUpdateParamsType,
  ): Promise<void> {
    //    const customerProject = `${params.customer}#${params.project}`

    //    const command = new QueryCommand({
    //      TableName: getTableName('TaskProperties'),
    //      IndexName: 'project',
    //      KeyConditionExpression: 'task = :task',
    //      ExpressionAttributeValues: {
    //        ':task': { S: params.task },
    //      },
    //    })
    //    const result = await this.dynamoDBClient.send(command)
    //    const taskProperties = result.Items;

    const updateParams = {
      TableName: getTableName('TaskProperties'),
      Key: {
        project: { S: `${params.customer}#${params.project}` },
        task: { S: params.task },
      },
      UpdateExpression:
        'SET completed = :completed, plannedHours = :plannedHours',
      ExpressionAttributeValues: {
        ':completed': {
          BOOL: params.completed ?? false,
        },
        ':plannedHours': {
          N: (params.plannedHours ?? 0).toString(),
        },
      },
    }

    await this.dynamoDBClient.send(new UpdateItemCommand(updateParams))
  }
}

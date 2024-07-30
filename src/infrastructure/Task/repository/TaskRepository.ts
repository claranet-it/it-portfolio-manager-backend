import {
  AttributeValue,
  DynamoDBClient,
  QueryCommand,
  TransactWriteItemsCommand,
  TransactWriteItemsCommandInput,
  UpdateItemCommand,
} from '@aws-sdk/client-dynamodb'
import {
  CustomerProjectDeleteParamsType,
  CustomerProjectUpdateParamsType,
  ProjectListType,
  ProjectReadParamsType,
  ProjectTypeUpdateParamsType,
  TaskCreateReadParamsType,
  TaskReadParamsType,
  TaskUpdateParamsType,
} from '@src/core/Task/model/task.model'
import { TaskRepositoryInterface } from '@src/core/Task/repository/TaskRepositoryInterface'
import { InvalidCharacterError } from '@src/core/customExceptions/InvalidCharacterError'
import { getTableName } from '@src/core/db/TableName'
import { TimeEntryRowType } from '@src/core/TimeEntry/model/timeEntry.model'
import { TaskError } from '@src/core/customExceptions/TaskError'

export class TaskRepository implements TaskRepositoryInterface {
  constructor(private dynamoDBClient: DynamoDBClient) {}

  async getCustomers(company: string): Promise<string[]> {
    const command = new QueryCommand({
      TableName: getTableName('Task'),
      KeyConditionExpression: 'company = :company',
      FilterExpression: 'inactive = :inactive',
      ExpressionAttributeValues: {
        ':company': { S: company },
        ':inactive': { BOOL: false },
      },
    })
    const result = await this.dynamoDBClient.send(command)
    return Array.from(
      new Set(
        result.Items?.map(
          (item) => item.customerProject?.S?.split('#')[0] ?? '',
        ) ?? [],
      ),
    ).sort()
  }

  async getProjects(params: ProjectReadParamsType): Promise<ProjectListType> {
    const command = new QueryCommand({
      TableName: getTableName('Task'),
      KeyConditionExpression:
        'company = :company and begins_with(customerProject, :customer)',
      FilterExpression: 'inactive = :inactive',
      ExpressionAttributeValues: {
        ':company': { S: params.company },
        ':customer': { S: params.customer },
        ':inactive': { BOOL: false },
      },
    })
    const result = await this.dynamoDBClient.send(command)
    return (
      result.Items?.map((item) => {
        if (
          item.customerProject?.S?.split('#')[1] &&
          item.customerProject?.S?.split('#')[0] === params.customer
        ) {
          return {
            name: item.customerProject?.S?.split('#')[1],
            type: item.projectType?.S ?? '',
          }
        } else {
          return {
            name: '',
            type: '',
          }
        }
      }).sort() ?? []
    ).filter((item) => item.name != '')
  }

  async getTasks(params: TaskReadParamsType): Promise<string[]> {
    const command = new QueryCommand({
      TableName: getTableName('Task'),
      KeyConditionExpression:
        'company = :company and customerProject = :customerProject',
      FilterExpression: 'inactive = :inactive',
      ExpressionAttributeValues: {
        ':company': { S: params.company },
        ':customerProject': { S: `${params.customer}#${params.project}` },
        ':inactive': { BOOL: false },
      },
    })
    const result = await this.dynamoDBClient.send(command)
    return (
      result.Items?.map((item) => item.tasks?.SS ?? [])
        .flat()
        .sort() ?? []
    )
  }

  async getTasksWithProjectType(
    params: TaskReadParamsType,
  ): Promise<{ tasks: string[]; projectType: string }> {
    const command = new QueryCommand({
      TableName: getTableName('Task'),
      KeyConditionExpression:
        'company = :company and customerProject = :customerProject',
      FilterExpression: 'inactive = :inactive',
      ExpressionAttributeValues: {
        ':company': { S: params.company },
        ':customerProject': { S: `${params.customer}#${params.project}` },
        ':inactive': { BOOL: false },
      },
    })
    const result = await this.dynamoDBClient.send(command)

    if (result.Items) {
      const tasks =
        result.Items.map((item) => item.tasks?.SS ?? [])
          .flat()
          .sort() ?? []
      const projectType = result.Items[0].projectType?.S ?? ''
      return {
        tasks,
        projectType,
      }
    }

    return {
      tasks: [],
      projectType: '', //TODO
    }
  }

  async createTask(params: TaskCreateReadParamsType): Promise<void> {
    const company = params.company
    const project = params.project
    const projectType = params.projectType
    const customer = params.customer
    const task = params.task

    if (customer.includes('#') || project.includes('#')) {
      throw new InvalidCharacterError(
        '# is not a valid character for customer or project',
      )
    }

    if (!params.projectType) {
      throw new TaskError('Project type missing')
    }

    const customerProject = `${customer}#${project}`
    const updateParams = {
      TableName: getTableName('Task'),
      Key: {
        customerProject: { S: customerProject },
        company: { S: company },
      },
      UpdateExpression:
        'SET projectType = :projectType, inactive = :inactive ADD tasks :task',
      ExpressionAttributeValues: {
        ':task': {
          SS: [task],
        },
        ':projectType': { S: projectType },
        ':inactive': { BOOL: false },
      },
    }
    await this.dynamoDBClient.send(new UpdateItemCommand(updateParams))
  }

  async updateCustomerProject(
    params: CustomerProjectUpdateParamsType,
  ): Promise<void> {
    const company = params.company
    const project = params.project
    const customer = params.customer

    let newValue
    let existingCustomerProject
    const oldCustomerProject = `${customer}#${project}`
    let newCustomerProject

    if (params.newCustomer && params.newProject) {
      throw new TaskError('New customer OR new Project must be valorized')
    }
    if (params.newCustomer) {
      newValue = params.newCustomer
      existingCustomerProject = await this.getTasks({
        company,
        project,
        customer: newValue,
      })
      newCustomerProject = `${newValue}#${project}`
    } else if (params.newProject) {
      newValue = params.newProject
      existingCustomerProject = await this.getTasks({
        company,
        project: newValue,
        customer,
      })
      newCustomerProject = `${customer}#${newValue}`
    } else {
      throw new TaskError('New customer OR new Project must be valorized')
    }

    if (newValue.includes('#')) {
      throw new InvalidCharacterError(
        '# is not a valid character for customer or project',
      )
    }

    if (existingCustomerProject.length > 0) {
      //ADD check
      throw new TaskError('Customer project already exists')
    }

    const command = new QueryCommand({
      TableName: getTableName('TimeEntry'),
      IndexName: 'companyIndex',
      KeyConditionExpression: 'company = :company',
      ExpressionAttributeValues: {
        ':company': { S: params.company },
      },
    })
    const result = await this.dynamoDBClient.send(command)
    const timeEntries =
      result.Items?.map((item) => {
        return this.getTimeEntry(item)
      }).flat() ?? []

    const projectAlreadyAssigned = timeEntries.some(
      (entry) =>
        entry.customer === params.customer && entry.project === params.project,
    )
    if (projectAlreadyAssigned) {
      throw new TaskError('Customer project already assigned')
    }

    const oldTasks = await this.getTasksWithProjectType({
      company,
      project,
      customer,
    })

    const input: TransactWriteItemsCommandInput = {
      TransactItems: [
        {
          Delete: {
            Key: {
              company: { S: params.company },
              customerProject: { S: oldCustomerProject },
            },
            TableName: getTableName('Task'),
          },
        },
        {
          Update: {
            Key: {
              company: { S: params.company },
              customerProject: { S: newCustomerProject },
            },
            TableName: getTableName('Task'),
            UpdateExpression:
              'SET #tasks = :tasks, #projectType = :projectType, #inactive = :inactive',
            ExpressionAttributeNames: {
              '#tasks': 'tasks',
              '#projectType': 'projectType',
              '#inactive': 'inactive',
            },
            ExpressionAttributeValues: {
              ':tasks': {
                SS: oldTasks.tasks,
              },
              ':projectType': {
                S: oldTasks.projectType,
              },
              ':inactive': {
                BOOL: false,
              },
            },
          },
        },
      ],
    }

    const transactCommand = new TransactWriteItemsCommand(input)
    await this.dynamoDBClient.send(transactCommand)
  }

  async updateTask(params: TaskUpdateParamsType): Promise<void> {
    const company = params.company
    const project = params.project
    const customer = params.customer

    const customerProject = `${customer}#${project}`

    if (!params.newTask) {
      throw new TaskError('New task must be valorized')
    }

    const command = new QueryCommand({
      TableName: getTableName('TimeEntry'),
      IndexName: 'companyIndex',
      KeyConditionExpression: 'company = :company',
      ExpressionAttributeValues: {
        ':company': { S: params.company },
      },
    })
    const result = await this.dynamoDBClient.send(command)
    const timeEntries =
      result.Items?.map((item) => {
        return this.getTimeEntry(item)
      }).flat() ?? []

    const projectAlreadyAssigned = timeEntries.some(
      (entry) =>
        entry.customer === params.customer &&
        entry.project === params.project &&
        entry.task.includes(params.task),
    )
    if (projectAlreadyAssigned) {
      throw new TaskError('Task already assigned')
    }

    const oldTasksWithProjectType = await this.getTasksWithProjectType({
      company,
      project,
      customer,
    })
    const oldTasks = oldTasksWithProjectType.tasks

    if (oldTasks.includes(params.newTask)) {
      throw new TaskError('Task already exists')
    }

    const newTasks = oldTasks.filter((task) => task !== params.task)
    newTasks.push(params.newTask)

    const updateParams = {
      TableName: getTableName('Task'),
      Key: {
        customerProject: { S: customerProject },
        company: { S: company },
      },
      UpdateExpression: 'SET tasks = :task',
      ExpressionAttributeValues: {
        ':task': {
          SS: newTasks,
        },
      },
    }

    await this.dynamoDBClient.send(new UpdateItemCommand(updateParams))
  }

  async updateProjectType(params: ProjectTypeUpdateParamsType): Promise<void> {
    const company = params.company
    const project = params.project
    const customer = params.customer
    const projectType = params.newProjectType

    const customerProject = `${customer}#${project}`

    if (!params.newProjectType) {
      throw new TaskError('New project type must be valorized')
    }

    const updateParams = {
      TableName: getTableName('Task'),
      Key: {
        customerProject: { S: customerProject },
        company: { S: company },
      },
      UpdateExpression: 'SET projectType = :projectType',
      ExpressionAttributeValues: {
        ':projectType': {
          S: projectType,
        },
      },
    }

    await this.dynamoDBClient.send(new UpdateItemCommand(updateParams))
  }

  async deleteCustomerProject(
    params: CustomerProjectDeleteParamsType,
  ): Promise<void> {
    const company = params.company
    const project = params.project
    const customer = params.customer
    const inactive = params.inactive || true

    const customerProject = `${customer}#${project}`

    const updateParams = {
      TableName: getTableName('Task'),
      Key: {
        customerProject: { S: customerProject },
        company: { S: company },
      },
      UpdateExpression: 'SET inactive = :inactive',
      ExpressionAttributeValues: {
        ':inactive': {
          BOOL: inactive,
        },
      },
    }
    await this.dynamoDBClient.send(new UpdateItemCommand(updateParams))
  }

  private getTimeEntry(
    item: Record<string, AttributeValue>,
  ): TimeEntryRowType[] {
    const resultForCompany: TimeEntryRowType[] = []

    item.tasks?.SS?.forEach((taskItem) => {
      const [customer, project, task, hours] = taskItem.split('#')
      resultForCompany.push({
        user: item.uid?.S ?? '',
        date: item.timeEntryDate?.S ?? '',
        company: item.company?.S ?? '',
        customer: customer,
        project: project,
        task: task,
        hours: parseFloat(hours),
        description: item.description?.S ?? '',
        startHour: item.startHour?.S ?? '',
        endHour: item.endHour?.S ?? '',
      })
    })
    return resultForCompany
  }
}

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
  TaskCreateReadParamsType,
  TaskReadParamsType,
  TaskUpdateParamsType,
  TaskType,
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
            plannedHours: item.plannedHours?.N
              ? Number(item.plannedHours?.N)
              : 0,
          }
        } else {
          return {
            name: '',
            type: '',
            plannedHours: 0,
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

  async getTasksWithProperties(
    params: TaskReadParamsType,
  ): Promise<TaskType[]> {
    const tasks = await this.getTasks(params)

    const propertiesCommand = new QueryCommand({
      TableName: getTableName('TaskProperties'),
      KeyConditionExpression: 'projectId = :customerProject',
      ExpressionAttributeValues: {
        ':customerProject': {
          S: `${params.company}#${params.customer}#${params.project}`,
        },
      },
    })
    const propertiesResult = await this.dynamoDBClient.send(propertiesCommand)
    const properties = propertiesResult.Items
    let filteredProperties: Record<string, AttributeValue>[] = []
    if (properties && properties.length > 0) {
      filteredProperties = properties.filter((item) =>
        tasks.includes(item.task?.S ?? ''),
      )
    }

    const mappedProperties = filteredProperties.map((item) => {
      return {
        name: item.task.S ?? '',
        completed: item.completed.BOOL ?? false,
        plannedHours: parseInt(item.plannedHours.N ?? '0'),
      }
    })

    return tasks.map((task) => {
      const taskProperties = mappedProperties.filter(
        (property) => property.name === task,
      )

      if (!taskProperties || taskProperties.length === 0) {
        return {
          name: task,
          completed: false,
          plannedHours: 0,
        }
      }

      return {
        name: taskProperties[0].name,
        completed: taskProperties[0].completed,
        plannedHours: taskProperties[0].plannedHours,
      }
    })
  }

  async getTasksWithProjectDetails(
    params: TaskReadParamsType,
  ): Promise<{ tasks: string[]; projectType: string; plannedHours: number }> {
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
      const plannedHours = Number(result.Items[0].plannedHours?.N ?? 0)
      return {
        tasks,
        projectType,
        plannedHours,
      }
    }

    return {
      tasks: [],
      projectType: '',
      plannedHours: 0,
    }
  }

  async createTask(params: TaskCreateReadParamsType): Promise<void> {
    const company = params.company
    const project = params.project
    const customer = params.customer
    const task = params.task

    if (customer.includes('#') || project.name.includes('#')) {
      throw new InvalidCharacterError(
        '# is not a valid character for customer or project',
      )
    }

    if (!params.project.type) {
      throw new TaskError('Project type missing')
    }

    const customerProject = `${customer}#${project.name}`
    const updateParams = {
      TableName: getTableName('Task'),
      Key: {
        customerProject: { S: customerProject },
        company: { S: company },
      },
      UpdateExpression:
        'SET projectType = :projectType, inactive = :inactive, plannedHours = :plannedHours ADD tasks :task',
      ExpressionAttributeValues: {
        ':task': {
          SS: [task],
        },
        ':projectType': { S: project.type },
        ':plannedHours': { N: project.plannedHours?.toString() ?? '0' },
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
    const oldCustomerProject = `${customer}#${project.name}`
    let newCustomerProject

    if (!params.project.name) {
      throw new TaskError('Project name must be valorized')
    }

    if (params.newCustomer && params.newProject) {
      throw new TaskError(
        'Only one between new customer and new project must be valorized',
      )
    }

    if (
      params.newProject &&
      params.newProject.name === params.project.name &&
      (params.newProject.type || params.newProject.plannedHours)
    ) {
      const projectType = params.newProject.type
        ? params.newProject.type
        : params.project.type
      const plannedHours = params.newProject.plannedHours
        ? params.newProject.plannedHours
        : params.project.plannedHours

      const customerProject = `${customer}#${project.name}`

      const updateParams = {
        TableName: getTableName('Task'),
        Key: {
          customerProject: { S: customerProject },
          company: { S: company },
        },
        UpdateExpression:
          'SET projectType = :projectType, plannedHours = :plannedHours',
        ExpressionAttributeValues: {
          ':projectType': {
            S: projectType,
          },
          ':plannedHours': {
            N: plannedHours?.toString(),
          },
        },
      }

      await this.dynamoDBClient.send(new UpdateItemCommand(updateParams))
    } else {
      if (params.newCustomer) {
        newValue = params.newCustomer
        existingCustomerProject = await this.getTasks({
          company,
          project: project.name,
          customer: newValue,
        })
        newCustomerProject = `${newValue}#${project.name}`

        if (newValue.includes('#')) {
          throw new InvalidCharacterError(
            '# is not a valid character for a customer',
          )
        }
      } else if (params.newProject) {
        newValue = params.newProject
        existingCustomerProject = await this.getTasks({
          company,
          project: newValue.name,
          customer,
        })
        newCustomerProject = `${customer}#${newValue.name}`

        if (newValue.name.includes('#')) {
          throw new InvalidCharacterError(
            '# is not a valid character for a project',
          )
        }
      } else {
        throw new TaskError(
          'At least one between new customer and new project must be valorized',
        )
      }

      if (existingCustomerProject.length > 0) {
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
          entry.customer === params.customer &&
          entry.project === params.project.name,
      )
      if (projectAlreadyAssigned) {
        throw new TaskError('Customer project already assigned')
      }

      const oldTasks = await this.getTasksWithProjectDetails({
        company,
        project: project.name,
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
                'SET #tasks = :tasks, #projectType = :projectType, #inactive = :inactive, #plannedHours = :plannedHours',
              ExpressionAttributeNames: {
                '#tasks': 'tasks',
                '#projectType': 'projectType',
                '#inactive': 'inactive',
                '#plannedHours': 'plannedHours',
              },
              ExpressionAttributeValues: {
                ':tasks': {
                  SS: oldTasks.tasks,
                },
                ':projectType': {
                  S:
                    params.newProject && params.newProject.type
                      ? params.newProject.type
                      : oldTasks.projectType,
                },
                ':inactive': {
                  BOOL: false,
                },
                ':plannedHours': {
                  N:
                    params.newProject && params.newProject.plannedHours
                      ? params.newProject.plannedHours.toString()
                      : oldTasks.plannedHours
                        ? oldTasks.plannedHours.toString()
                        : '0',
                },
              },
            },
          },
        ],
      }

      const transactCommand = new TransactWriteItemsCommand(input)
      await this.dynamoDBClient.send(transactCommand)
    }
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

    const oldTasksWithProjectType = await this.getTasksWithProjectDetails({
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

  async deleteCustomerProject(
    params: CustomerProjectDeleteParamsType,
  ): Promise<void> {
    const company = params.company
    const project = params.project
    const customer = params.customer
    const inactive = params.inactive || true

    const customerProject = `${customer}#${project}`

    const command = new QueryCommand({
      TableName: getTableName('TimeEntry'),
      IndexName: 'companyIndex',
      KeyConditionExpression: 'company = :company',
      ExpressionAttributeValues: {
        ':company': { S: company },
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

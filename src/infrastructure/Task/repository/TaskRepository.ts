import {
    AttributeValue,
    DynamoDBClient,
    QueryCommand, TransactWriteItemsCommand, TransactWriteItemsCommandInput,
    UpdateItemCommand,
} from '@aws-sdk/client-dynamodb'
import {
    CustomerProjectDeleteParamsType,
    CustomerProjectUpdateParamsType,
    ProjectReadParamsType,
    TaskCreateReadParamsType,
    TaskReadParamsType, TaskUpdateParamsType,
} from '@src/core/Task/model/task.model'
import {TaskRepositoryInterface} from '@src/core/Task/repository/TaskRepositoryInterface'
import {InvalidCharacterError} from '@src/core/customExceptions/InvalidCharacterError'
import {getTableName} from '@src/core/db/TableName'
import {TimeEntryRowType} from "@src/core/TimeEntry/model/timeEntry.model";

export class TaskRepository implements TaskRepositoryInterface {
    constructor(private dynamoDBClient: DynamoDBClient) {
    }

    async getCustomers(company: string): Promise<string[]> {
        const command = new QueryCommand({
            TableName: getTableName('Task'),
            KeyConditionExpression: 'company = :company',
            ExpressionAttributeValues: {':company': {S: company}},
        })
        const result = await this.dynamoDBClient.send(command)
        //TODO se tutti project inactive rimuovere dalla lista (filter)
        return Array.from(
            new Set(
                result.Items?.map(
                    (item) => item.customerProject?.S?.split('#')[0] ?? '',
                ) ?? [],
            ),
        ).sort()
    }

    async getProjects(params: ProjectReadParamsType): Promise<string[]> {
        const command = new QueryCommand({
            TableName: getTableName('Task'),
            KeyConditionExpression:
                'company = :company and begins_with(customerProject, :customer)',
            ExpressionAttributeValues: {
                ':company': {S: params.company},
                ':customer': {S: params.customer},
            },
        })
        const result = await this.dynamoDBClient.send(command)
        return (
            result.Items?.map(
                (item) => item.customerProject?.S?.split('#')[1] ?? '',
            ).sort() ?? []
        )
    }

    async getTasks(params: TaskReadParamsType): Promise<string[]> {
        const command = new QueryCommand({
            TableName: getTableName('Task'),
            KeyConditionExpression:
                'company = :company and customerProject = :customerProject',
            ExpressionAttributeValues: {
                ':company': {S: params.company},
                ':customerProject': {S: `${params.customer}#${params.project}`},
            },
        })
        const result = await this.dynamoDBClient.send(command)
        return (
            result.Items?.map((item) => item.tasks?.SS ?? [])
                .flat()
                .sort() ?? []
        )
    }

    async getTasksWithProjectType(params: TaskReadParamsType): Promise<{ tasks: string[], projectType: string }> {
        const command = new QueryCommand({
            TableName: getTableName('Task'),
            KeyConditionExpression:
                'company = :company and customerProject = :customerProject',
            ExpressionAttributeValues: {
                ':company': {S: params.company},
                ':customerProject': {S: `${params.customer}#${params.project}`},
            },
        })
        const result = await this.dynamoDBClient.send(command)

        if (result.Items) {
            const tasks =
                (result.Items.map((item) => item.tasks?.SS ?? [])
                    .flat()
                    .sort() ?? [])
            const projectType = result.Items[0].projectType?.S ?? ''
            return {
                tasks,
                projectType
            }
        }

        return {
            tasks: [],
            projectType: '' //TODO
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
        const customerProject = `${customer}#${project}`
        const updateParams = {
            TableName: getTableName('Task'),
            Key: {
                customerProject: {S: customerProject},
                company: {S: company},
            },
            UpdateExpression: 'SET projectType = :projectType, inactive = :inactive ADD tasks :task',
            ExpressionAttributeValues: {
                ':task': {
                    SS: [task],
                },
                ':projectType': {S: projectType},
                ':inactive': {BOOL: false},
            },
        }
        await this.dynamoDBClient.send(new UpdateItemCommand(updateParams))
    }

    async updateCustomerProject(params: CustomerProjectUpdateParamsType): Promise<void> {
        const company = params.company
        const project = params.project
        const customer = params.customer

        let newValue
        let existingCustomerProject
        const oldCustomerProject = `${customer}#${project}`
        let newCustomerProject

        if(params.newCustomer && params.newProject) {
            throw Error('New customer OR new Project must be valorized') //TODO
        }
        if(params.newCustomer) {
            newValue = params.newCustomer
            existingCustomerProject = await this.getTasks({company, project, customer: newValue})
            newCustomerProject = `${newValue}#${project}`
        } else if(params.newProject){
            newValue = params.newProject
            existingCustomerProject = await this.getTasks({company, project: newValue, customer})
            newCustomerProject = `${customer}#${newValue}`
        } else {
            throw Error('New customer OR new Project must be valorized') //TODO
        }

        if (newValue.includes('#')) {
            throw new InvalidCharacterError(
                '# is not a valid character for customer or project',
            )
        }

        if (existingCustomerProject.length > 0) { //ADD check
            throw Error('Customer project already exists') //TODO
        }

        const command = new QueryCommand({
            TableName: getTableName('TimeEntry'),
            IndexName: 'companyIndex',
            KeyConditionExpression:
                'company = :company',
            ExpressionAttributeValues: {
                ':company': {S: params.company},
            },
        })
        const result = await this.dynamoDBClient.send(command)
        const timeEntries = result.Items?.map((item) => {
            return this.getTimeEntry(item)
        }).flat() ?? []

        const projectAlreadyAssigned = timeEntries.some(entry => entry.customer === params.customer && entry.project === params.project)
        if (projectAlreadyAssigned) {
            throw Error('Customer project already assigned')
        }

        const oldTasks = await this.getTasksWithProjectType({company, project, customer})

        const input: TransactWriteItemsCommandInput = {
            TransactItems: [{
                Delete: {
                    Key: {
                        company: {S: params.company},
                        customerProject: {S: oldCustomerProject},
                    },
                    TableName: getTableName('Task'),
                }
            },
                {
                    Update: {
                        Key: {
                            company: {S: params.company},
                            customerProject: {S: newCustomerProject},
                        },
                        TableName: getTableName('Task'),
                        UpdateExpression:
                            'SET #tasks = :tasks, #projectType = :projectType',
                        ExpressionAttributeNames: {
                            '#tasks': 'tasks',
                            '#projectType': 'projectType',
                           },
                        ExpressionAttributeValues: {
                            ':tasks': {
                                SS: oldTasks.tasks
                            },
                            ':projectType': {
                                S: oldTasks.projectType,
                            },
                        },
                    },
                }
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

        if(!params.newTask) {
            throw Error('New task must be valorized') //TODO
        }

       const command = new QueryCommand({
            TableName: getTableName('TimeEntry'),
            IndexName: 'companyIndex',
            KeyConditionExpression:
                'company = :company',
            ExpressionAttributeValues: {
                ':company': {S: params.company},
            },
        })
        const result = await this.dynamoDBClient.send(command)
        const timeEntries = result.Items?.map((item) => {
            return this.getTimeEntry(item)
        }).flat() ?? []

        const projectAlreadyAssigned = timeEntries.some(entry => entry.customer === params.customer && entry.project === params.project && entry.task.includes(params.task))
        if (projectAlreadyAssigned) {
            throw Error('Task already assigned') //TODO
        }

        const oldTasksWithProjectType = await this.getTasksWithProjectType({company, project, customer})
        const oldTasks = oldTasksWithProjectType.tasks

        if(oldTasks.includes(params.newTask)) {
            throw Error('Task already exists') //TODO
        }

        const newTasks = oldTasks.filter(task => task !== params.task)
        newTasks.push(params.newTask)

        const updateParams = {
            TableName: getTableName('Task'),
            Key: {
                customerProject: {S: customerProject},
                company: {S: company},
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

    async deleteCustomerProject(params: CustomerProjectDeleteParamsType): Promise<void> {
        const company = params.company
        const project = params.project
        const customer = params.customer
        const inactive = params.inactive || false

        const customerProject = `${customer}#${project}`

        const updateParams = {
            TableName: getTableName('Task'),
            Key: {
                customerProject: {S: customerProject},
                company: {S: company},
            },
            UpdateExpression: 'SET inactive :inactive',
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
            })
        })
        return resultForCompany
    }

}


import { DynamoDBClient, ScanCommand } from '@aws-sdk/client-dynamodb'
import { PrismaClient } from '../prisma/generated'

const dynamodbClient = new DynamoDBClient({ region: 'eu-south-1' })
const prismaClient = new PrismaClient()
let [customersCreated, projectsCreated, tasksCreated] = [0, 0, 0]

const importTasks = async function () {
  const command = new ScanCommand({
    TableName: 'ItPortfolioManager-Task-prod',
  })
  const taskResult = await dynamodbClient.send(command)
  for (const item of taskResult.Items ?? []) {
    const customer = await findOrCreateCustomer(
      item.customerProject?.S?.split('#')[0] ?? '',
      item.company.S ?? '',
    )

    const project = await findOrCreateProject(
      item.customerProject?.S?.split('#')[1] ?? '',
      customer.id,
      item.projectType.S ?? 'billable',
      item.inactive.BOOL ?? false,
      parseInt(item.plannedHours?.N ?? '0') ?? 0,
    )

    for (const task of item.tasks.SS ?? []) {
      tasksCreated++
      await prismaClient.projectTask.create({
        data: {
          name: task,
          project_id: project.id,
        },
      })
    }
  }

  console.log(`${customersCreated} customers created`)
  console.log(`${projectsCreated} projects created`)
  console.log(`${tasksCreated} tasks created`)
}

const findOrCreateCustomer = async function (name: string, company: string) {
  const customer = await prismaClient.customer.findFirst({
    where: {
      name: name,
      company_id: company,
    },
  })

  if (customer) {
    return customer
  }

  customersCreated++
  return prismaClient.customer.create({
    data: {
      name: name,
      company_id: company,
    },
  })
}

const findOrCreateProject = async function (
  name: string,
  customer: string,
  projectType: string,
  inactive: boolean,
  plannedHours: number,
) {
  const project = await prismaClient.project.findFirst({
    where: {
      name: name,
      customer_id: customer,
    },
  })

  if (project) {
    return project
  }

  projectsCreated++
  return prismaClient.project.create({
    data: {
      name: name,
      customer: {
        connect: {
          id: customer,
        },
      },
      project_type: projectType,
      is_inactive: inactive,
      plannedHours: plannedHours,
    },
  })
}

const importTaskProperties = async function () {
  console.warn('Check if there is any task property on prod')
}

const importTimeEntries = async function () {
  let timeEntryResult
  let lastEvaluatedKey = undefined
  let timeEntriesCreated = 0
  do {
    const command: ScanCommand = new ScanCommand({
      TableName: 'ItPortfolioManager-TimeEntry-prod',
      ExclusiveStartKey: lastEvaluatedKey,
    })
    timeEntryResult = await dynamodbClient.send(command)
    lastEvaluatedKey = timeEntryResult.LastEvaluatedKey

    for (const timeEntry of timeEntryResult.Items ?? []) {
      for (const data of timeEntry.tasks.SS ?? []) {
        const [
          customer,
          project,
          taskName,
          hours,
          description,
          timeStart,
          timeEnd,
        ] = data.split('#')

        const task = await prismaClient.projectTask.findFirst({
          where: {
            name: taskName,
            project: {
              name: project,
              customer: {
                name: customer,
                company_id: timeEntry.company.S ?? '',
              },
            },
          },
        })

        if (!task) {
          continue
        }

        timeEntriesCreated++
        await prismaClient.timeEntry.create({
          data: {
            email: timeEntry.uid.S ?? '',
            time_entry_date: new Date(timeEntry.timeEntryDate.S ?? ''),
            task_id: task.id,
            hours: parseFloat(hours),
            description: description,
            time_start: timeStart && timeStart.length > 20 ? null : timeStart,
            time_end: timeEnd && timeEnd.length > 20 ? null : timeEnd,
          },
        })
      }
    }
  } while (lastEvaluatedKey)
  console.log(`${timeEntriesCreated} time entries created`)
}

importTasks()
importTaskProperties()
importTimeEntries()

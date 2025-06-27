import { FastifyInstance } from 'fastify'
import { test, before, after } from 'tap'
import createApp from '@src/app'
import { TaskService } from '@src/core/Task/service/TaskService'
import { TaskRepository } from '@src/infrastructure/Task/repository/TaskRepository'
import { TaskPropertiesRepository } from '@src/infrastructure/Task/repository/TaskPropertiesRepository'
import { ProjectType } from '@src/core/Report/model/productivity.model'
import { PrismaDBConnection } from '@src/infrastructure/db/PrismaDBConnection'

let app: FastifyInstance
const prisma = new PrismaDBConnection()

let taskService: TaskService

const MY_COMPANY_ID = "MyCompanyId"

before(async () => {
    app = createApp({ logger: false })
    await app.ready()

    const myCustomer = await prisma.getClient().customer.create({
        data: {
            name: 'MyCustomer',
            company_id: MY_COMPANY_ID,
        }
    })
    const otherCustomer = await prisma.getClient().customer.create({
        data: {
            name: 'OtherCustomer',
            company_id: 'OtherCompany',
        }
    })
    const assenze = await prisma.getClient().project.create({
        data: {
            name: 'Assenze',
            customer_id: myCustomer.id,
            project_type: ProjectType.ABSENCE,
        }
    })
    const slackTime = await prisma.getClient().project.create({
        data: {
            name: 'Slack time',
            customer_id: myCustomer.id,
            project_type: ProjectType.SLACK_TIME,
        }
    })
    const funzionale = await prisma.getClient().project.create({
        data: {
            name: 'Funzionale',
            customer_id: otherCustomer.id,
            project_type: ProjectType.NON_BILLABLE,
        }
    })

    const festivita = await prisma.getClient().projectTask.create({
        data: {
            name: 'FESTIVITA',
            project_id: assenze.id,
        }
    })

    const formazione = await prisma.getClient().projectTask.create({
        data: {
            name: 'FORMAZIONE',
            project_id: slackTime.id,
        }
    })

    const brickly = await prisma.getClient().projectTask.create({
        data: {
            name: 'Brickly',
            project_id: funzionale.id,
        }
    })

    await prisma.getClient().timeEntry.create({
        data: {
            task_id: festivita.id,
            hours: 1,
            email: 'marytex@email.com',
            time_entry_date: new Date('2024-01-01'),
        }
    })
    await prisma.getClient().timeEntry.create({
        data: {
            task_id: brickly.id,
            hours: 1,
            email: 'marytex@email.com',
            time_entry_date: new Date('2024-01-01'),
        }
    })

    await prisma.getClient().timeEntry.create({
        data: {
            task_id: formazione.id,
            hours: 1,
            email: 'marytex@email.com',
            time_entry_date: new Date('2024-01-01'),
        }
    })

    await prisma.getClient().template.create({
        data: {
            timehours: 8,
            customer_id: myCustomer.id,
            project_id: slackTime.id,
            daytime: "1, 3, 5",
            date_start: new Date('2025-01-02'),
            date_end: new Date('2025-02-02'),
            email: 'marytex@email.com'
        }
    })

    const taskRepository = new TaskRepository(prisma)
    const taskPropertiesRepository = new TaskPropertiesRepository(prisma)
    taskService = new TaskService(taskRepository, taskPropertiesRepository)
})

after(async () => {
    const deleteCustomer = prisma.getClient().customer.deleteMany()
    const deleteProj = prisma.getClient().project.deleteMany()
    const deleteTask = prisma.getClient().projectTask.deleteMany()
    const deleteTimeEntries = prisma.getClient().timeEntry.deleteMany()
    const deleteTemplate = prisma.getClient().template.deleteMany()

    await prisma.getClient().$transaction([deleteTemplate,
        deleteTimeEntries, deleteTask, deleteProj, deleteCustomer,
    ])
    prisma.getClient().$disconnect()
    await app.close()
})

test('Delete all customers and related data by company id', async (t) => {
    await taskService.deleteCustomersAndRelatedDataByCompany(MY_COMPANY_ID)
    const responseCustomer = await prisma.getClient().customer.findMany()
    const responseProj = await prisma.getClient().project.findMany()
    const responseTask = await prisma.getClient().projectTask.findMany()
    const responseTimeEntries = await prisma.getClient().timeEntry.findMany()
    const responseTemplate = await prisma.getClient().template.findMany()
    t.equal(responseCustomer.length, 1)
    t.equal(responseProj.length, 1)
    t.equal(responseTask.length, 1)
    t.equal(responseTimeEntries.length, 1)
    t.equal(responseTemplate.length, 0)
})


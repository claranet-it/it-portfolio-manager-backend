import { FastifyInstance } from 'fastify'
import { test, before, after } from 'tap'
import createApp from '@src/app'
import { PrismaClient } from 'prisma/generated'
import { TaskService } from '@src/core/Task/service/TaskService'
import { TaskRepository } from '@src/infrastructure/Task/repository/TaskRepository'
import { TaskPropertiesRepository } from '@src/infrastructure/Task/repository/TaskPropertiesRepository'
import { ProjectType } from '@src/core/Report/model/productivity.model'

let app: FastifyInstance
const prisma = new PrismaClient()

let taskService: TaskService

const MY_COMPANY_ID = "MyCompanyId"

before(async () => {
    app = createApp({ logger: false })
    await app.ready()

    const myCustomer = await prisma.customer.create({
        data: {
            name: 'MyCustomer',
            company_id: MY_COMPANY_ID,
        }
    })
    const otherCustomer = await prisma.customer.create({
        data: {
            name: 'OtherCustomer',
            company_id: 'OtherCompany',
        }
    })
    const assenze = await prisma.project.create({
        data: {
            name: 'Assenze',
            customer_id: myCustomer.id,
            project_type: ProjectType.ABSENCE,
        }
    })
    const slackTime = await prisma.project.create({
        data: {
            name: 'Slack time',
            customer_id: myCustomer.id,
            project_type: ProjectType.SLACK_TIME,
        }
    })
    const funzionale = await prisma.project.create({
        data: {
            name: 'Funzionale',
            customer_id: otherCustomer.id,
            project_type: ProjectType.NON_BILLABLE,
        }
    })

    const festivita = await prisma.projectTask.create({
        data: {
            name: 'FESTIVITA',
            project_id: assenze.id,
        }
    })

    const formazione = await prisma.projectTask.create({
        data: {
            name: 'FORMAZIONE',
            project_id: slackTime.id,
        }
    })

    const brickly = await prisma.projectTask.create({
        data: {
            name: 'Brickly',
            project_id: funzionale.id,
        }
    })

    await prisma.timeEntry.create({
        data: {
            task_id: festivita.id,
            hours: 1,
            email: 'marytex@email.com',
            time_entry_date: new Date('2024-01-01'),
        }
    })
    await prisma.timeEntry.create({
        data: {
            task_id: brickly.id,
            hours: 1,
            email: 'marytex@email.com',
            time_entry_date: new Date('2024-01-01'),
        }
    })

    await prisma.timeEntry.create({
        data: {
            task_id: formazione.id,
            hours: 1,
            email: 'marytex@email.com',
            time_entry_date: new Date('2024-01-01'),
        }
    })

    const taskRepository = new TaskRepository()
    const taskPropertiesRepository = new TaskPropertiesRepository()
    taskService = new TaskService(taskRepository, taskPropertiesRepository)
})

after(async () => {
    const deleteCustomer = prisma.customer.deleteMany()
    const deleteProj = prisma.project.deleteMany()
    const deleteTask = prisma.projectTask.deleteMany()
    const deleteTimeEntries = prisma.timeEntry.deleteMany()

    await prisma.$transaction([
        deleteTimeEntries, deleteTask, deleteProj, deleteCustomer,
    ])
    prisma.$disconnect()
    await app.close()
})

test('Delete all customers and related data by company id', async (t) => {
    await taskService.deleteCustomersAndRelatedDataByCompanyId(MY_COMPANY_ID)
    const responseCustomer = await prisma.customer.findMany()
    const responseProj = await prisma.project.findMany()
    const responseTask = await prisma.projectTask.findMany()
    const responseTimeEntries = await prisma.timeEntry.findMany()
    t.equal(responseCustomer.length, 1)
    t.equal(responseProj.length, 1)
    t.equal(responseTask.length, 1)
    t.equal(responseTimeEntries.length, 1)
})


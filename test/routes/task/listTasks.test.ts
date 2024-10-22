import { afterEach, beforeEach, test } from 'tap'
import createApp from '@src/app'
import { FastifyInstance } from 'fastify'
import { TaskStructureListType } from '@src/core/Task/model/task.model'
import { PrismaClient } from '../../../prisma/generated'
import { ProjectType } from '@src/core/Report/model/productivity.model'
let app: FastifyInstance

beforeEach(async () => {
  app = createApp({ logger: false })
  await app.ready()
})

afterEach(async () => {
  const prisma = new PrismaClient()
  const deleteCustomer = prisma.customer.deleteMany()
  const deleteProject = prisma.project.deleteMany()
  const deleteTask = prisma.projectTask.deleteMany()

  await prisma.$transaction([
    deleteTask,
    deleteProject,
    deleteCustomer,
  ])
  await prisma.$disconnect()

  await app.close()
})

test('list tasks without authentication', async (t) => {
  const response = await app.inject({
    method: 'GET',
    url: '/api/task/task-list',
  })

  t.equal(response.statusCode, 401)
})

test('list tasks', async (t) => {
  const input = {
    company: 'it',
    customer: 'Claranet',
    project: 'Slack time',
  }

  const token = getToken(input.company)

  await postTask('customer', input.company, 'project', ProjectType.BILLABLE, 'task')

  const response = await app.inject({
    method: 'GET',
    url: `/api/task/task-list`,
    headers: {
      authorization: `Bearer ${token}`,
    },
  })

  t.equal(response.statusCode, 200)

  const tasks = response.json<TaskStructureListType>()
  t.equal(tasks.length, 1)
  tasks.forEach((task) => {
    t.same(Object.keys(task), ['customer', 'project', 'task'])
  })
})

function getToken(company: string) {
  return app.createTestJwt({
    email: 'nicholas.crow@email.com',
    name: 'Nicholas Crow',
    picture: 'https://test.com/nicholas.crow.jpg',
    company: company,
    role: "ADMIN",
  })
}


async function postTask(customer: string, company: string, project: string, projectType: string, task: string, plannedHours?: string) {
  return await app.inject({
    method: 'POST',
    url: '/api/task/task/',
    headers: {
      authorization: `Bearer ${getToken(company)}`,
    },
    payload: {
      customer: customer,
      project: { name: project, type: projectType, plannedHours },
      task: task
    }
  })
}
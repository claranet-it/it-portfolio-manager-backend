import { test, before, after } from 'tap'
import createApp from '@src/app'
import { FastifyInstance } from 'fastify'
import { PrismaClient } from '../../../prisma/generated'


let app: FastifyInstance
const prisma = new PrismaClient()

/* eslint-disable */
let testCustomer: any;
/* eslint-disable */
let claranet: any;
let taskWithEntry: any;
let taskWithoutEntry: any;


before(async () => {
  app = createApp({ logger: false })
  await app.ready()

  claranet = await prisma.customer.create({
    data: {
      name: 'Claranet',
      company_id: 'it',
    }
  })
  const slackTime = await prisma.project.create({
    data: {
      name: 'Slack time',
      customer_id: claranet.id
    }
  })

  taskWithEntry = await prisma.projectTask.create({
    data: {
      name: 'Task with time entry',
      is_completed: true,
      project_id: slackTime.id,
    }
  })

  await prisma.timeEntry.create({
    data: {
      time_entry_date: new Date("2024-06-10T10:00:00Z"),
      task_id: taskWithEntry.id,
      hours: 2,
      email: "user@mail.it"
    }
  })

  taskWithoutEntry = await prisma.projectTask.create({
    data: {
      name: 'Task without time entry',
      project_id: slackTime.id,
    }
  })
})

after(async () => {
  const deleteCustomer = prisma.customer.deleteMany()
  const deleteProject = prisma.project.deleteMany()
  const deleteTask = prisma.projectTask.deleteMany()
  const deleteTimeEntry = prisma.timeEntry.deleteMany()

  await prisma.$transaction([
    deleteTimeEntry,
    deleteTask,
    deleteProject,
    deleteCustomer,
  ])
  await prisma.$disconnect()
  await app.close()
})

test('should return 401 deleting task without authentication', async (t) => {
  const response = await app.inject({
    method: 'DELETE',
    url: '/api/task/task/1 ',
  })

  t.equal(response.statusCode, 401)
})

test('shoulde return 403 deleting task without role', async (t) => {
  const token = app.createTestJwt({
    email: "FAKE_EMAIL@mail.it",
    name: 'Marytex',
    picture: 'https:test.com/marytex.jpg',
    company: "it",
    role: 'USER',
  })

  const response = await app.inject({
    method: 'DELETE',
    url: `api/task/task/${taskWithoutEntry.id}`,
    headers: {
      authorization: `Bearer ${token}`,
    }
  })

  t.equal(response.statusCode, 403)
})

test('should return 500 deleting task with entry', async (t) => {
  const token = app.createTestJwt({
    email: "user@mail.it",
    name: 'Marytex',
    picture: 'https:test.com/marytex.jpg',
    company: "it",
    role: 'SUPERADMIN',
  })

  const response = await app.inject({
    method: 'DELETE',
    url: `api/task/task/${taskWithEntry.id}`,
    headers: {
      authorization: `Bearer ${token}`,
    }
  })

  t.equal(response.statusCode, 500)
})

test('shoulde return 204 deleting task without entry', async (t) => {
  const token = app.createTestJwt({
    email: "FAKE_EMAIL@mail.it",
    name: 'Marytex',
    picture: 'https:test.com/marytex.jpg',
    company: "it",
    role: 'ADMIN',
  })

  const response = await app.inject({
    method: 'DELETE',
    url: `api/task/task/${taskWithoutEntry.id}`,
    headers: {
      authorization: `Bearer ${token}`,
    }
  })

  t.equal(response.statusCode, 204)
})

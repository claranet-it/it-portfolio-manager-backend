import { test, beforeEach, afterEach } from 'tap'
import createApp from '@src/app'
import { FastifyInstance } from 'fastify'
import { TaskListType} from '@src/core/Task/model/task.model'
import { PrismaClient } from '../../../prisma/generated'

let app: FastifyInstance
const prisma = new PrismaClient()

let testCustomer: any;
let claranet: any;

const inputs = [
  {
    company: 'it',
    customer: 'Claranet',
    project: 'Funzionale',
    expectedTasks: [{name: 'Attività di portfolio', completed: false, plannedHours: 0}, {name: "Management", completed: false, plannedHours: 0},],
  },
  {
    company: 'it',
    customer: 'Claranet',
    project: 'Slack time',
    expectedTasks: [{name: 'formazione', completed: false, plannedHours: 0}],
  },
  {
    company: 'it',
    customer: 'test customer',
    project: 'SOR Sviluppo',
    expectedTasks: [{name: 'Iterazione 1', completed: true, plannedHours: 0}, {name: 'Iterazione 2', completed: false, plannedHours: 0}, {name: 'Iterazione 3', completed: false, plannedHours: 0}],
  }
]

beforeEach(async () => {
  app = createApp({ logger: false })
  await app.ready()

  claranet = await prisma.customer.create({
    data: {
      name: 'Claranet',
      company_id: 'it',
    }
  })
  testCustomer = await prisma.customer.create({
    data: {
      name: 'test customer',
      company_id: 'it',
    }
  })
  const funzionale = await prisma.project.create({
    data: {
      name: 'Funzionale',
      customer_id: claranet.id
    }
  })
  const slackTime = await prisma.project.create({
    data: {
      name: 'Slack time',
      customer_id: claranet.id
    }
  })
  const sor = await prisma.project.create({
    data: {
      name: 'SOR Sviluppo',
      customer_id: testCustomer.id
    }
  })
  await prisma.projectTask.create({
      data: {
        name: 'Attività di portfolio',
        project_id: funzionale.id,
      }
    }
  )
  await prisma.projectTask.create({
    data: {
      name: 'Management',
      project_id: funzionale.id,
    }
  })
  await prisma.projectTask.create({
    data: {
      name: 'formazione',
      project_id: slackTime.id,
    }
  })
  await prisma.projectTask.create({
    data: {
      name: 'Iterazione 1',
      is_completed: true,
      project_id: sor.id,
    }
  })
  await prisma.projectTask.create({
    data: {
      name: 'Iterazione 2',
      project_id: sor.id,
    }
  })
  await prisma.projectTask.create({
    data: {
      name: 'Iterazione 3',
      project_id: sor.id,
    }
  })
})

afterEach(async () => {
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

test('read tasks without authentication', async (t) => {
  const response = await app.inject({
    method: 'GET',
    url: '/api/task/task',
  })

  t.equal(response.statusCode, 401)
})

inputs.forEach((input) => {
  test('read task with company, customer and project param', async (t) => {
    const token = app.createTestJwt({
      email: 'nicholas.crow@email.com',
      name: 'Nicholas Crow',
      picture: 'https://test.com/nicholas.crow.jpg',
      company: input.company
    })

    const customer = input.customer === 'test customer' ? testCustomer.id : claranet.id;

    const response = await app.inject({
      method: 'GET',
      url: `/api/task/task?customer=${customer}&project=${input.project}`,
      headers: {
        authorization: `Bearer ${token}`,
      },
    })

    t.equal(response.statusCode, 200)

    const tasks = response.json<TaskListType>()
    t.equal(tasks.length, input.expectedTasks.length)
    t.same(tasks, input.expectedTasks)
  })
})

test('read not completed tasks', async (t) => {
  const token = app.createTestJwt({
      email: 'nicholas.crow@email.com',
      name: 'Nicholas Crow',
      picture: 'https://test.com/nicholas.crow.jpg',
      company: 'it'
    })

    const response = await app.inject({
      method: 'GET',
      url: `/api/task/task?customer=${testCustomer.id}&project=SOR Sviluppo&completed=false`,
      headers: {
        authorization: `Bearer ${token}`,
      },
    })

    t.equal(response.statusCode, 200)

    const tasks = response.json<TaskListType>()
    t.equal(tasks.length, 2)
})

test('read completed tasks', async (t) => {
  const token = app.createTestJwt({
      email: 'nicholas.crow@email.com',
      name: 'Nicholas Crow',
      picture: 'https://test.com/nicholas.crow.jpg',
      company: 'it'
    })

    const response = await app.inject({
      method: 'GET',
      url: `/api/task/task?customer=${testCustomer.id}&project=SOR Sviluppo&completed=true`,
      headers: {
        authorization: `Bearer ${token}`,
      },
    })

    t.equal(response.statusCode, 200)

    const tasks = response.json<TaskListType>()
    t.equal(tasks.length, 1)
})

test('read task with additional properties', async (t) => {
  const input = {
    company: 'it',
    customer: 'Claranet',
    project: 'Slack time',
  }

  const token = app.createTestJwt({
    email: 'nicholas.crow@email.com',
    name: 'Nicholas Crow',
    picture: 'https://test.com/nicholas.crow.jpg',
    company: input.company
  })

  const response = await app.inject({
    method: 'GET',
    url: `/api/task/task?customer=${claranet.id}&project=${input.project}`,
    headers: {
      authorization: `Bearer ${token}`,
    },
  })

  t.equal(response.statusCode, 200)

  const tasks = response.json<TaskListType>()
  t.equal(tasks.length, 1)
  t.same(tasks, [{
    name: 'formazione',
    completed: false,
    plannedHours: 0,
  }])
})
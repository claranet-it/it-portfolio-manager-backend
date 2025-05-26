import {
  CustomerOptType,
  CustomerProjectDeleteParamsType,
  CustomerProjectUpdateParamsType,
  CustomerReadParamsType, CustomerType,
  ProjectListType,
  ProjectReadParamsType,
  TaskCreateReadParamsType,
  TaskReadParamsType,
  TaskStructureType,
  TaskType,
  TaskUpdateParamsType,
} from '@src/core/Task/model/task.model'
import { TaskRepositoryInterface } from '@src/core/Task/repository/TaskRepositoryInterface'
import { TaskError } from '@src/core/customExceptions/TaskError'
import { PrismaClient } from '../../../../prisma/generated'

export class TaskRepository implements TaskRepositoryInterface {
  async getCustomers(params: CustomerReadParamsType): Promise<CustomerType[]> {
    const prima = new PrismaClient()
    const result = await prima.customer.findMany({
      where: {
        company_id: params.company,
        inactive: false,
        ...(params.completed !== undefined && {
          projects: {
            some: params.completed === true
              ? { completed: true }
              : { OR: [{ completed: false }, { completed: undefined }] },
          },
        }),
      },
    });

    console.log("Company from customers ", result[0].company_id);

    return result.map((customer) => ({
      id: customer.id,
      name: customer.name,
    })).sort((a, b) => a.name.localeCompare(b.name));
  }

  async getProjects(params: ProjectReadParamsType): Promise<ProjectListType> {
    const prisma = new PrismaClient()

    const result = await prisma.project.findMany({
      where: {
        customer_id: params.customer,
        completed: params.completed,
        is_inactive: false,
      },
      orderBy: {
        name: 'asc',
      },
    })

    return result.map((project) => ({
      id: project.id,
      name: project.name,
      type: project.project_type,
      plannedHours: project.plannedHours,
      completed: project.completed,
    }))
  }

  async getTasks(params: TaskReadParamsType): Promise<string[]> {
    const prisma = new PrismaClient()

    const result = await prisma.projectTask.findMany({
      where: {
        project: {
          name: params.project,
          is_inactive: false,
          customer_id: params.customer,
        },
      },
      select: {
        name: true,
      },
      orderBy: {
        name: 'asc',
      },
    })
    return result.map((task) => task.name)
  }

  async getTaskStructure(company: string): Promise<TaskStructureType[]> {
    const prisma = new PrismaClient()

    const tasks = await prisma.projectTask.findMany({
      where: {
        project: {
          is_inactive: false,
          customer: {
            company_id: company,
          },
        },
      },
      include: {
        project: {
          select: {
            name: true,
            customer: {
              select: {
                name: true,
                id: true,
              },
            },
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    })

    return tasks.map((task) => ({
      task: task.name,
      customer: { name:task.project.customer.name, id: task.project.customer.id },
      project: task.project.name,
    }))
  }

  async getTasksWithProperties(
    params: TaskReadParamsType,
  ): Promise<TaskType[]> {
    const prisma = new PrismaClient()

    const result = await prisma.projectTask.findMany({
      where: {
        is_completed: params.completed,
        project: {
          name: params.project,
          is_inactive: false,
          customer_id: params.customer,
        },
      },
      orderBy: [
        {
          name: 'asc',
        },
        {
          createdAt: 'asc',
        },
      ],
    })

    return result.map((task) => ({
      id: task.id,
      name: task.name,
      completed: task.is_completed,
      plannedHours: task.planned_hours,
    }))
  }

  async getTasksWithProjectDetails(
    params: TaskReadParamsType,
  ): Promise<{ tasks: string[]; projectType: string; plannedHours: number }> {
    const prisma = new PrismaClient()

    const result = await prisma.projectTask.findMany({
      where: {
        project: {
          name: params.project,
          is_inactive: false,
          customer: {
            name: params.customer,
            company_id: params.company,
          },
        },
      },
      include: {
        project: true,
      },
      orderBy: {
        name: 'asc',
      },
    })

    if (result.length == 0) {
      return {
        tasks: [],
        projectType: '',
        plannedHours: 0,
      }
    }

    return {
      tasks: result.map((task) => task.name),
      projectType: result[0].project.project_type,
      plannedHours: result[0].project.plannedHours,
    }
  }

  async createTask(params: TaskCreateReadParamsType): Promise<void> {
    const company = params.company
    const project = params.project
    const customer = params.customer
    const task = params.task

    if (!params.project.type) {
      throw new TaskError('Project type missing')
    }

    const customerObj = await this.findOrCreateCustomer(company, customer)
    const projectObj = await this.findOrCreateProject(
      customerObj?.id as string,
      project.name,
      project.type,
      project.plannedHours,
    )


    await this.findOrCreateProjectTask(projectObj?.id as string, task)
  }

  async findOrCreateCustomer(companyId: string, customer: CustomerOptType) {
    const prisma = new PrismaClient()
    let existingCustomer;

    if (customer.id) {
      existingCustomer = await prisma.customer.findUnique({
        where: { id: customer.id },
      })
    }

    if (!existingCustomer || !customer.id) {
      customer = await prisma.customer.create({
        data: {
          company_id: companyId,
          name: customer.name,
        },
      })
    }

    return customer
  }

  async findOrCreateProject(
    customerId: string,
    projectName: string,
    projectType: string,
    plannedHours: number,
  ) {
    const prisma = new PrismaClient()

    let project = await prisma.project.findFirst({
      where: { customer_id: customerId, name: projectName },
    })

    if (!project) {
      project = await prisma.project.create({
        data: {
          name: projectName,
          project_type: projectType,
          plannedHours: plannedHours,
          customer_id: customerId,
        },
      })
    }

    return project
  }

  async findOrCreateProjectTask(projectId: string, taskName: string) {
    const prisma = new PrismaClient()

    let task = await prisma.projectTask.findFirst({
      where: { project_id: projectId, name: taskName },
    })

    if (!task) {
      task = await prisma.projectTask.create({
        data: {
          name: taskName,
          project_id: projectId,
        },
      })
    }

    return task
  }

  async updateCustomerProject(
    params: CustomerProjectUpdateParamsType,
  ): Promise<void> {
    if (!params.project.name) {
      throw new TaskError('Project name must be valorized')
    }

    if (!params.project.id) {
      throw new TaskError('Project id must be valorized')
    }

    if (params.newCustomerName && params.newProject) {
      throw new TaskError(
        'Only one between new customer and new project must be valorized',
      )
    }

    if (!params.newCustomerName && !params.newProject) {
      throw new TaskError(
        'At least one between new customer and new project must be valorized',
      )
    }

    const prisma = new PrismaClient()

    if (params.newProject) {
      const project = await prisma.project.findUniqueOrThrow({
        where: {
          id: params.project.id,
        },
      })

      const projectType = params.newProject.type
        ? params.newProject.type
        : params.project.type
      const plannedHours =
        params.newProject.plannedHours !== undefined
          ? params.newProject.plannedHours
          : params.project.plannedHours
      const completed =
        params.newProject !== undefined &&
          params.newProject.completed !== undefined
          ? params.newProject.completed
          : project.completed

      if (params.newProject.name !== project.name) {
        const existingProject = await prisma.project.findFirst({
          where: {
            name: params.newProject.name,
            customer_id: params.customer,
          },
        })
        if (existingProject) {
          throw new TaskError('Customer project already exists')
        }
      }

      await prisma.project.update({
        data: {
          name: params.newProject.name,
          project_type: projectType,
          plannedHours: plannedHours,
          completed: completed,
        },
        where: {
          id: project.id,
        },
      })
    }

    if (params.newCustomerName) {
      const customer = await prisma.customer.findUniqueOrThrow({
        where: {
          id: params.customer,
        },
      })

      const existingCustomer = await prisma.customer.findFirst({
        where: {
          name: params.newCustomerName,
          company_id: params.company,
        },
      })

      if (existingCustomer) {
        throw new TaskError('Customer already exists')
      }

      await prisma.customer.update({
        data: {
          name: params.newCustomerName,
        },
        where: {
          id: customer.id,
        },
      })
    }
  }

  async updateTask(params: TaskUpdateParamsType): Promise<void> {
    if (!params.newTask) {
      throw new TaskError('New task must be valorized')
    }

    const prisma = new PrismaClient()

    const oldTask = await prisma.projectTask.findFirst({
      where: {
        name: params.task,
        project: {
          name: params.project,
          customer_id: params.customer,
        },
      },
    })

    if (!oldTask) {
      throw new TaskError(`Cannot find task ${params.task}`)
    }

    const existingTask = await prisma.projectTask.findFirst({
      where: {
        name: params.newTask,
        project: {
          name: params.project,
          customer_id: params.customer,
        },
      },
    })

    if (existingTask) {
      throw new TaskError('Task already exists')
    }

    await prisma.projectTask.update({
      data: {
        name: params.newTask,
      },
      where: {
        id: oldTask.id,
      },
    })
  }

  async deleteCustomerProject(
    params: CustomerProjectDeleteParamsType,
  ): Promise<void> {
    const projectName = params.project
    const inactive = params.inactive || true

    const prisma = new PrismaClient()

    const project = await prisma.project.findUnique({
      where: {
        id: params.project,
      },
      include: {
        tasks: {
          include: {
            time_entries: true,
          },
        },
      },
    })

    if (!project) {
      throw new Error(`Cannot find project ${projectName}`)
    }

    if (
      Number(
        project?.tasks.reduce((acc, task) => acc + task.time_entries.length, 0),
      ) > 0
    ) {
      throw new TaskError('Customer project already assigned')
    }

    await prisma.project.update({
      data: {
        is_inactive: inactive,
      },
      where: {
        id: project.id,
      },
    })
  }

  async getCompanyFromProject(project: string): Promise<string | null> {
    const prisma = new PrismaClient()

    const result = await prisma.$queryRaw<{ company_id: string }[]>`
      SELECT DISTINCT c.company_id
      FROM Customer c
      JOIN Project p ON p.customer_id = c.id
      WHERE p.id = ${project}
    `

    return result[0].company_id;
  }
}

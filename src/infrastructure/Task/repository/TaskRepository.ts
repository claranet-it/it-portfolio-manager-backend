import {
  CustomerOptType,
  CustomerProjectDeleteParamsType,
  CustomerProjectUpdateParamsType,
  CustomerReadParamsType, CustomerType,
  ProjectListType,
  ProjectReadParamsType,
  TaskCreateReadParamsType, TaskListType,
  TaskReadParamsType,
  TaskStructureType,
  TaskType,
  TaskUpdateParamsType, ProjectToEncryptType,
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

  async getTask(task: string): Promise<string | null> {
    const prisma = new PrismaClient()

    const result = await prisma.projectTask.findUnique({
      where: {
        id: task
      },
    })
    return result?.id ?? null;
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
            id: true,
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
      task: { id: task.id, name: task.name },
      customer: { name: task.project.customer.name, id: task.project.customer.id },
      project: { name: task.project.name, id: task.project.id },
    }))
  }

  async getTasksWithProperties(
    params: TaskReadParamsType,
  ): Promise<TaskListType> {
    const prisma = new PrismaClient()

    const result = await prisma.projectTask.findMany({
      where: {
        is_completed: params.completed,
        project: {
          id: params.project,
          is_inactive: false,
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

    const prisma = new PrismaClient()

    if (!params.project.type) {
      throw new TaskError('Project type missing')
    }

    const customerObj = await this.findOrCreateCustomer(company, customer)
    const projectObj = await this.findOrCreateProject(
      customerObj?.id as string,
      project.id ?? '',
      project.name,
      project.type,
      project.plannedHours
    )


    await prisma.projectTask.create({
      data: {
        name: task,
        project_id: projectObj?.id as string,
      },
    })
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
    projectId: string,
    projectName: string,
    projectType: string,
    plannedHours: number,
  ) {
    const prisma = new PrismaClient()

    let project = await prisma.project.findUnique({
      where: { id: projectId },
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

  async updateCustomerProject(
    params: CustomerProjectUpdateParamsType,
  ): Promise<void> {
    if (!params.project) {
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
          id: params.project,
        },
      })

      const projectType = params.newProject.type

      const plannedHours =
        params.newProject.plannedHours !== undefined
          ? params.newProject.plannedHours
          : 0
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

    await prisma.projectTask.findUniqueOrThrow({
      where: {
        id: params.task,
      },
    })

    const existingTask = await prisma.projectTask.findFirst({
      where: {
        name: params.newTask,
        project: {
          id: params.project,
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
        id: params.task,
      },
    })
  }

  async deleteCustomerProject(
    params: CustomerProjectDeleteParamsType,
  ): Promise<void> {
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
      throw new Error(`Cannot find project ${params.project}`)
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

  async getCustomersByCompany(companyName: string): Promise<CustomerType[]> {
    const prisma = new PrismaClient()

    const result = await prisma.customer.findMany({
      where: {
        company_id: companyName,
      },
    })

    return result.map((customer) => ({
      id: customer.id,
      name: customer.name,
      inactive: customer.inactive,
    }))
  }

  async getProjectsByCompany(companyName: string): Promise<ProjectToEncryptType[]> {
    const prisma = new PrismaClient()

    const result = await prisma.project.findMany({
      where: {
        customer: {
          company_id: companyName,
        },
      },
    })

    return result.map((task) => ({
      id: task.id,
      name: task.name,
      projectType: task.project_type,
    }))
  }

  async getTasksByCompany(companyName: string): Promise<TaskType[]> {
    const prisma = new PrismaClient()

    const result = await prisma.projectTask.findMany({
      where: {
        project: {
          customer: {
            company_id: companyName,
          },
        },
      },
    })

    return result.map((task) => ({
      id: task.id,
      name: task.name,
      completed: task.is_completed,
      plannedHours: task.planned_hours,
    }))
  }

  async deleteCustomersAndRelatedDataByCompany(id: string): Promise<void> {
    const prisma = new PrismaClient()

    const deleteTemplate = prisma.template.deleteMany({
      where: {
        customer: {
          company_id: id
        }
      },
    })

    const deleteTimeEntries = prisma.timeEntry.deleteMany({
      where: {
        task: {
          project: {
            customer: {
              company_id: id
            }
          }
        }
      },
    })

    const deleteTasks = prisma.projectTask.deleteMany({
      where: {
        project: {
          customer: {
            company_id: id
          }
        }
      },
    })

    const deleteProjects = prisma.project.deleteMany({
      where: {
        customer: {
          company_id: id
        }
      },
    })

    const deleteCustomers = prisma.customer.deleteMany({
      where: {
        company_id: id
      },
    })

    await prisma.$transaction([deleteTemplate, deleteTimeEntries, deleteTasks, deleteProjects, deleteCustomers])
  }
}

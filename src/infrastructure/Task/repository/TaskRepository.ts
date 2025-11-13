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
  TaskUpdateParamsType, ProjectToEncryptType,
} from '@src/core/Task/model/task.model'
import { TaskRepositoryInterface } from '@src/core/Task/repository/TaskRepositoryInterface'
import { TaskError } from '@src/core/customExceptions/TaskError'
import { PrismaDBConnection } from '@src/infrastructure/db/PrismaDBConnection'
import { ProjectWithPercentageListType } from '@src/core/Report/model/projects.model'

export class TaskRepository implements TaskRepositoryInterface {
  
  constructor(private readonly prismaDBConnection: PrismaDBConnection) { }

  async getCustomers(params: CustomerReadParamsType): Promise<CustomerType[]> {
    const result = await this.prismaDBConnection.getClient().customer.findMany({
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
    await this.prismaDBConnection.disconnect();

    return result.map((customer) => ({
      id: customer.id,
      name: customer.name,
    })).sort((a, b) => a.name.localeCompare(b.name));
  }

  async getProjects(params: ProjectReadParamsType): Promise<ProjectListType> {
    const result = await this.prismaDBConnection.getClient().project.findMany({
      where: {
        customer_id: params.customer,
        completed: params.completed,
        is_inactive: false,
      },
      orderBy: {
        name: 'asc',
      },
    })
    await this.prismaDBConnection.disconnect();

    return result.map((project) => ({
      id: project.id,
      name: project.name,
      type: project.project_type,
      plannedHours: project.plannedHours,
      completed: project.completed,
    }))
  }

  async getTask(task: string): Promise<string | null> {
    const result = await this.prismaDBConnection.getClient().projectTask.findUnique({
      where: {
        id: task
      },
    })
    return result?.id ?? null;
  }

  async getTaskStructure(company: string): Promise<TaskStructureType[]> {
    const tasks = await this.prismaDBConnection.getClient().projectTask.findMany({
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
    const result = await this.prismaDBConnection.getClient().projectTask.findMany({
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
    const result = await this.prismaDBConnection.getClient().projectTask.findMany({
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
      project.id ?? '',
      project.name,
      project.type,
      project.plannedHours
    )


    await this.prismaDBConnection.getClient().projectTask.create({
      data: {
        name: task,
        project_id: projectObj?.id as string,
      },
    })
  }

  async findOrCreateCustomer(companyId: string, customer: CustomerOptType) {
    let existingCustomer;

    if (customer.id) {
      existingCustomer = await this.prismaDBConnection.getClient().customer.findUnique({
        where: { id: customer.id },
      })
    }

    if (!existingCustomer || !customer.id) {
      customer = await this.prismaDBConnection.getClient().customer.create({
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
    let project = await this.prismaDBConnection.getClient().project.findUnique({
      where: { id: projectId },
    })

    if (!project) {
      project = await this.prismaDBConnection.getClient().project.create({
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

    if (params.newProject) {
      const project = await this.prismaDBConnection.getClient().project.findUniqueOrThrow({
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
        const existingProject = await this.prismaDBConnection.getClient().project.findFirst({
          where: {
            name: params.newProject.name,
            customer_id: params.customer,
          },
        })
        if (existingProject) {
          throw new TaskError('Customer project already exists')
        }
      }

      await this.prismaDBConnection.getClient().project.update({
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
      const customer = await this.prismaDBConnection.getClient().customer.findUniqueOrThrow({
        where: {
          id: params.customer,
        },
      })

      const existingCustomer = await this.prismaDBConnection.getClient().customer.findFirst({
        where: {
          name: params.newCustomerName,
          company_id: params.company,
        },
      })

      if (existingCustomer) {
        throw new TaskError('Customer already exists')
      }

      await this.prismaDBConnection.getClient().customer.update({
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

    await this.prismaDBConnection.getClient().projectTask.findUniqueOrThrow({
      where: {
        id: params.task,
      },
    })

    const existingTask = await this.prismaDBConnection.getClient().projectTask.findFirst({
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

    await this.prismaDBConnection.getClient().projectTask.update({
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

    const project = await this.prismaDBConnection.getClient().project.findUnique({
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

    await this.prismaDBConnection.getClient().project.update({
      data: {
        is_inactive: inactive,
      },
      where: {
        id: project.id,
      },
    })
  }

  async deleteTask(
    id: string,
  ): Promise<void> {

    const task = await this.prismaDBConnection.getClient().projectTask.findUnique({
      where: {
        id: id,
      },
      include: {
        time_entries: true,
      },
    })

    if (task?.time_entries.length && task.time_entries.length > 0) {
      throw new Error(`Cannot delete task ${id} with time entries`)
    }

    await this.prismaDBConnection.getClient().projectTask.delete({
      where: {
        id,
      },
    })
  }

  async getCustomersByCompany(companyName: string): Promise<CustomerType[]> {
    const result = await this.prismaDBConnection.getClient().customer.findMany({
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

    const result = await this.prismaDBConnection.getClient().project.findMany({
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

  async getTasksByCompany(companyName: string): Promise<TaskListType> {
    const result = await this.prismaDBConnection.getClient().projectTask.findMany({
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
    const deleteTemplate = this.prismaDBConnection.getClient().template.deleteMany({
      where: {
        customer: {
          company_id: id
        }
      },
    })

    const deleteTimeEntries = this.prismaDBConnection.getClient().timeEntry.deleteMany({
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

    const deleteTasks = this.prismaDBConnection.getClient().projectTask.deleteMany({
      where: {
        project: {
          customer: {
            company_id: id
          }
        }
      },
    })

    const deleteProjects = this.prismaDBConnection.getClient().project.deleteMany({
      where: {
        customer: {
          company_id: id
        }
      },
    })

    const deleteCustomers = this.prismaDBConnection.getClient().customer.deleteMany({
      where: {
        company_id: id
      },
    })

    await this.prismaDBConnection.getClient().$transaction([deleteTemplate, deleteTimeEntries, deleteTasks, deleteProjects, deleteCustomers])
  }

  async getProjectsWithPercentage(company: string): Promise<ProjectWithPercentageListType> {
    const projectsData = await this.prismaDBConnection.getClient().$queryRawUnsafe<{
      projectId: string
      projectName: string
      projectPlannedHours: number
      projectTotalHours: number
      projectCompletionPercentage: number
      taskId: string | null
      taskName: string | null
      taskPlannedHours: number | null
      taskTotalHours: number | null
      taskCompletionPercentage: number | null
    }[]>(`
      SELECT
        p.id AS projectId,
        p.name AS projectName,
        p.plannedHours AS projectPlannedHours,
        COALESCE(project_hours.total_hours, 0) AS projectTotalHours,
        CASE
            WHEN p.plannedHours > 0 THEN ROUND((COALESCE(project_hours.total_hours, 0) / p.plannedHours) * 100, 0)
            ELSE 0
        END AS projectCompletionPercentage,
        pt.id AS taskId,
        pt.name AS taskName,
        pt.planned_hours AS taskPlannedHours,
        COALESCE(task_hours.total_hours, 0) AS taskTotalHours,
        CASE
            WHEN pt.planned_hours > 0 THEN ROUND((COALESCE(task_hours.total_hours, 0) / pt.planned_hours) * 100, 0)
            ELSE 0
        END AS taskCompletionPercentage
    FROM Project p
    INNER JOIN Customer c ON p.customer_id = c.id
    LEFT JOIN ProjectTask pt ON pt.project_id = p.id
    LEFT JOIN (
        -- somma ore per task specifica
        SELECT task_id, SUM(hours) AS total_hours
        FROM TimeEntry
        GROUP BY task_id
    ) AS task_hours ON task_hours.task_id = pt.id
    LEFT JOIN (
        -- somma ore per progetto (tutte le task collegate)
        SELECT pt2.project_id, SUM(te2.hours) AS total_hours
        FROM ProjectTask pt2
        LEFT JOIN TimeEntry te2 ON te2.task_id = pt2.id
        GROUP BY pt2.project_id
    ) AS project_hours ON project_hours.project_id = p.id
    WHERE c.company_id = '${company}'
      AND p.is_inactive = 0
      AND p.completed = 0
    `);

    // Raggruppa i risultati per progetto
    const projectsMap = new Map<string, {
      id: string
      name: string
      plannedHours: number
      totalHours: number
      completionPercentage: number
      tasks: Array<{
        id: string
        name: string
        plannedHours: number
        totalHours: number
        completionPercentage: number
      }>
    }>();

    for (const row of projectsData) {
      if (!projectsMap.has(row.projectId)) {
        projectsMap.set(row.projectId, {
          id: row.projectId,
          name: row.projectName,
          plannedHours: row.projectPlannedHours,
          totalHours: row.projectTotalHours,
          completionPercentage: row.projectCompletionPercentage,
          tasks: [],
        });
      }

      const project = projectsMap.get(row.projectId)!;
      
      if (row.taskId && row.taskName !== null) {
        project.tasks.push({
          id: row.taskId,
          name: row.taskName,
          plannedHours: row.taskPlannedHours ?? 0,
          totalHours: row.taskTotalHours ?? 0,
          completionPercentage: row.taskCompletionPercentage ?? 0,
        });
      }
    }

    return Array.from(projectsMap.values());
  }
}

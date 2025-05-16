import { PrismaClient } from '../../../prisma/generated'

const prisma = new PrismaClient()

export async function seedTasks(projects: string[]) {
  for (let i = 0; i < projects.length; i++) {
    await prisma.projectTask.createMany({
      data: [
        { name: `Task ${i}`, project_id: projects[i] },
        { name: `Task ${i}`, project_id: projects[i] },
        { name: `Task ${i}`, project_id: projects[i] },
        { name: `Task ${i}`, project_id: projects[i] },
        { name: `Task ${i}`, project_id: projects[i] },
      ],
    })
  }
}
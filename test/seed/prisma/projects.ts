import { PrismaClient } from '../../../prisma/generated'

const prisma = new PrismaClient()

export async function seedProjects(customerIds: string[]) {
  for (let i = 0; i < customerIds.length; i++) {
    await prisma.project.createMany({
      data: [
        {
          name: `Project ${i}`,
          customer_id: customerIds[i],
        }
      ]
    })
  }
}
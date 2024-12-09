import { PrismaClient } from '../../../prisma/generated'

const prisma = new PrismaClient()

export async function seedCompany() {
  await prisma.company.createMany({
    data: [
      {
        domain: "claranet italia",
        name: "it"
      },
      {
        domain: "claranet us",
        name: "us"
      },
      {
        domain: "test.com",
        name: "test company"
      },
      {
        domain: "cnatest.com",
        name: "cna test"
      }
    ]
  })
}

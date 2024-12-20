import { PrismaClient } from '../../../prisma/generated'

const prisma = new PrismaClient()

export async function seedCompanyConnections() {
  const it = await prisma.company.findFirst({ where: { name: 'it' } })
  const us = await prisma.company.findFirst({ where: { name: 'us' } })

  await prisma.companyConnections.createMany({
    data: {
      requester_company_id: it!.id,
      correspondent_company_id: us!.id,
    },
  })
}
